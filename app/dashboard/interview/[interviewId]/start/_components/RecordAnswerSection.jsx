/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 *
 * CHANGE: AI prompt now explicitly asks for a 1–5 STAR-framework rating.
 * The feedback page converts this to a /2 score per question.
 */

"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import { Mic, StopCircle, LoaderCircle, Video, VideoOff } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
    const [userAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);

    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const [isVideoReady, setIsVideoReady] = useState(false);

    const processedCountRef = useRef(0);

    const {
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    // Only append NEW transcript results — fix for repetition bug
    useEffect(() => {
        if (results.length > processedCountRef.current) {
            const newResults = results.slice(processedCountRef.current);
            newResults.forEach((result) => {
                setUserAnswer(prev => prev + (prev ? ' ' : '') + result?.transcript);
            });
            processedCountRef.current = results.length;
        }
    }, [results]);

    // ── Video helpers ────────────────────────────────────────────────────────
    const startVideoRecording = () => {
        recordedChunksRef.current = [];
        const stream = webcamRef.current?.stream;
        if (!stream) return;

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm')
                ? 'video/webm'
                : '';

        try {
            mediaRecorderRef.current = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : undefined
            );
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.start(1000);
        } catch (err) {
            console.error('MediaRecorder could not start:', err);
        }
    };

    const stopVideoRecording = () => {
        return new Promise((resolve) => {
            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !== 'inactive'
            ) {
                mediaRecorderRef.current.onstop = () => {
                    if (recordedChunksRef.current.length === 0) { resolve(null); return; }
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve(null);
            }
        });
    };

    // Direct browser → Cloudinary upload (bypasses Vercel 4.5MB limit)
    const uploadVideo = async (blob) => {
        if (!blob) return { url: null, publicId: null };
        try {
            const publicId = `genview/interviews/${interviewData?.mockId}/question_${activeQuestionIndex + 1}_${Date.now()}`;

            const sigRes = await fetch('/api/cloudinary-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId }),
            });
            if (!sigRes.ok) throw new Error('Failed to get upload signature');
            const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

            const formData = new FormData();
            formData.append('file', blob);
            formData.append('public_id', publicId);
            formData.append('signature', signature);
            formData.append('timestamp', String(timestamp));
            formData.append('api_key', apiKey);
            formData.append('resource_type', 'video');

            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                { method: 'POST', body: formData }
            );

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData?.error?.message || 'Cloudinary upload failed');
            }

            const data = await uploadRes.json();
            return { url: data.secure_url ?? null, publicId: data.public_id ?? null };

        } catch (err) {
            console.error('[uploadVideo] Error:', err);
            toast.error('Video could not be saved, but your answer was recorded.');
            return { url: null, publicId: null };
        }
    };

    // User explicitly clicks stop — no auto-submit
    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
            const videoBlob = await stopVideoRecording();
            await UpdateUserAnswer(videoBlob);
        } else {
            startVideoRecording();
            startSpeechToText();
        }
    };

    const UpdateUserAnswer = async (videoBlob = null) => {
        if (!userAnswer || userAnswer.trim().length <= 10) {
            toast.error('Answer is too short. Please record a longer response.');
            return;
        }

        setLoading(true);
        try {
            // ── UPDATED STAR PROMPT ──────────────────────────────────────────
            // Asks for a strict integer 1–5 based on how many STAR components
            // the candidate covered. The feedback page converts this to /2.
            const feedbackPrompt = `
You are an expert interview coach evaluating a candidate's answer using the STAR framework 
(Situation, Task, Action, Result).

Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}
Candidate's Answer: ${userAnswer}

Rate the answer from 1 to 5 using ONLY these criteria — do not deviate:
- Rating 1: Answer is completely off-topic or blank. No STAR components present.
- Rating 2: Only 1 STAR component is present (e.g. only described the Situation).
- Rating 3: Exactly 2 STAR components are present but the other 2 are missing.
- Rating 4: 3 out of 4 STAR components are present but the answer lacks depth or specificity.
- Rating 5: All 4 STAR components (Situation, Task, Action, Result) are clearly covered with strong specific detail.

Return ONLY a valid JSON object with exactly two fields:
- "rating": an integer between 1 and 5 (no decimals, no strings)
- "feedback": a 2-3 sentence string explaining which STAR components were present, 
  which were missing, and one specific thing the candidate should improve.

Example format:
{"rating": 3, "feedback": "Your answer covered the Situation and Action clearly but missed the Task and Result. Adding the business outcome and your specific responsibility would strengthen this answer significantly."}
`;

            const [videoData, feedbackResult] = await Promise.all([
                uploadVideo(videoBlob),
                chatSession.sendMessage(feedbackPrompt)
            ]);

            const rawText = feedbackResult.response.text()
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const JsonFeedbackResp = JSON.parse(rawText);

            // Clamp rating to 1–5 in case the model misbehaves
            const safeRating = Math.min(5, Math.max(1, Number(JsonFeedbackResp?.rating) || 1));

            const resp = await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: String(safeRating),
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY'),
                status: 'pending',
                ...(videoData.url ? { videoUrl: videoData.url } : {}),
                ...(videoData.publicId ? { videoPublicId: videoData.publicId } : {}),
            });

            if (resp) {
                toast.success('Answer recorded successfully');
                setUserAnswer('');
                setResults([]);
                processedCountRef.current = 0;
                recordedChunksRef.current = [];

                if (activeQuestionIndex === mockInterviewQuestion?.length - 1) {
                    setIsInterviewComplete(true);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Error while saving answer');
        } finally {
            setLoading(false);
        }
    };

    if (isInterviewComplete) {
        return (
            <div className='flex flex-col items-center justify-center mt-20 p-10 bg-gray-50 rounded-xl shadow-sm border h-[500px] w-full'>
                <LoaderCircle className='animate-spin w-16 h-16 text-primary mb-6' />
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Please Wait...</h2>
                <p className='text-gray-500 text-center text-lg max-w-md leading-relaxed'>
                    Your answer has been processed by AI and sent to a Human Coach for evaluation.
                    This operator window is currently open. Please wait here.
                </p>
                <p className='text-primary text-sm mt-8 animate-pulse font-medium'>
                    Checking for coach feedback...
                </p>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 relative'>
                <Image
                    src={'/webcam.jpeg'}
                    width={200}
                    height={200}
                    alt="Webcam placeholder"
                    className='absolute'
                />
                <Webcam
                    ref={webcamRef}
                    audio={true}
                    muted={true}
                    mirrored={true}
                    style={{ height: 500, width: 500, zIndex: 10 }}
                    onUserMedia={() => setIsVideoReady(true)}
                    onUserMediaError={() => {
                        setIsVideoReady(false);
                        toast.error('Camera access denied — video will not be saved.');
                    }}
                />
                {isRecording && (
                    <div className='absolute top-8 right-8 z-20 flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse'>
                        <span className='w-2 h-2 bg-white rounded-full inline-block' />
                        REC
                    </div>
                )}
            </div>

            <div className='flex items-center gap-2 mt-4 text-sm text-gray-500'>
                {isVideoReady ? (
                    <><Video className='w-4 h-4 text-green-500' /> Video recording enabled</>
                ) : (
                    <><VideoOff className='w-4 h-4 text-red-400' /> Camera not available — audio only</>
                )}
            </div>

            <div className='flex flex-col items-center mt-6'>
                <Button
                    disabled={loading}
                    variant="outline"
                    onClick={StartStopRecording}
                >
                    {isRecording ? (
                        <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                            <StopCircle /> Submit Answer
                        </h2>
                    ) : (
                        <h2 className='text-primary flex gap-2 items-center'>
                            <Mic /> Record Answer
                        </h2>
                    )}
                </Button>

                {loading && (
                    <div className='mt-4 flex flex-col items-center gap-2'>
                        <LoaderCircle className='animate-spin text-primary w-6 h-6' />
                        <p className='text-sm text-gray-500'>Saving answer & uploading video...</p>
                    </div>
                )}
            </div>

            {userAnswer && (
                <div className='mt-6 w-full max-w-xl bg-gray-50 border rounded-lg p-4'>
                    <p className='text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide'>Live transcript</p>
                    <p className='text-gray-700 text-sm leading-relaxed'>{userAnswer}</p>
                </div>
            )}
        </div>
    );
}

export default RecordAnswerSection;
