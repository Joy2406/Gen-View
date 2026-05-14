/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
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

    // FIX 2: track how many results already appended
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

    // FIX 2: only append NEW results, never re-process old ones
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
                    if (recordedChunksRef.current.length === 0) {
                        resolve(null);
                        return;
                    }
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve(null);
            }
        });
    };

    // Returns { url, publicId } — both saved to DB
    const uploadVideo = async (blob) => {
        if (!blob) return { url: null, publicId: null };
        try {
            const formData = new FormData();
            const filename = `interview_${interviewData?.mockId}_q${activeQuestionIndex + 1}_${Date.now()}.webm`;
            formData.append('video', blob, filename);
            formData.append('mockId', interviewData?.mockId ?? '');
            formData.append('questionIndex', String(activeQuestionIndex));

            const res = await fetch('/api/upload-video', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            return { url: data.url ?? null, publicId: data.publicId ?? null };
        } catch (err) {
            console.error('Video upload error:', err);
            toast.error('Video could not be saved, but your answer was recorded.');
            return { url: null, publicId: null };
        }
    };

    // FIX 1: user-controlled stop only — no useEffect on isRecording
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
            const [videoData, feedbackResult] = await Promise.all([
                uploadVideo(videoBlob),
                chatSession.sendMessage(
                    "Question:" + mockInterviewQuestion[activeQuestionIndex]?.question +
                    ", User Answer:" + userAnswer +
                    ", Based on the question and user answer, please give us a rating and feedback" +
                    " as area of improvement in JSON format with 'rating' and 'feedback' fields."
                )
            ]);

            const mockJsonResp = feedbackResult.response.text()
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const JsonFeedbackResp = JSON.parse(mockJsonResp);

            const resp = await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: JsonFeedbackResp?.rating,
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

    // "Please Wait" screen after final question
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