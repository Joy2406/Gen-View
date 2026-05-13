/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary 
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 */

"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

function RecordAnswerSection({mockInterviewQuestion, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    
    // 1. State to track if the final question has been submitted
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);

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

    // Sync speech results to state
    useEffect(() => {
        results.forEach((result) => {
            setUserAnswer(prevAns => prevAns + result?.transcript);
        });
    }, [results]);

    // Trigger save ONLY when recording stops
    useEffect(() => {
        if (!isRecording && userAnswer?.length > 10) {
            UpdateUserAnswer();
        }
    }, [isRecording]);

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    };

    const UpdateUserAnswer = async () => {
        setLoading(true);
        try {
            const feedbackPrompt = "Question:" + mockInterviewQuestion[activeQuestionIndex]?.question +
                ", User Answer:" + userAnswer + ", Based on the question and user answer," +
                " please give us a rating and feedback as area of improvement in JSON format" +
                " with 'rating' and 'feedback' fields.";

            const result = await chatSession.sendMessage(feedbackPrompt);
            const mockJsonResp = (result.response.text()).replace('```json', '').replace('```', '');
            const JsonFeedbackResp = JSON.parse(mockJsonResp);

            // 2. Updated insert to include 'status: pending'
            const resp = await db.insert(UserAnswer)
                .values({
                    mockIdRef: interviewData?.mockId,
                    question: mockInterviewQuestion[activeQuestionIndex]?.question,
                    correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                    userAns: userAnswer,
                    feedback: JsonFeedbackResp?.feedback,
                    rating: JsonFeedbackResp?.rating,
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-YYYY'),
                    status: 'pending' // Added status field for HITL review
                });

            if (resp) {
                toast.success('Answer recorded successfully');
                setUserAnswer('');
                setResults([]);
                
                // 3. Check if this is the final question to trigger wait screen
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

    // 4. Conditional Rendering: "Please Wait" screen at end of interview
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
        )
    }

    // Default UI for questions 1 through 4
    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 relative'>
                <Image src={'/webcam.jpeg'} width={200} height={200} 
                    alt="Webcam placeholder"
                    className='absolute'/>
                <Webcam
                    mirrored={true}
                    style={{ height:500, width:500, zIndex:10 }}
                />
            </div>
            
            <div className='flex flex-col items-center mt-10'>
                <Button 
                    disabled={loading}
                    variant="outline" 
                    onClick={StartStopRecording}
                >
                    {isRecording ?
                        <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                            <StopCircle/>Submit Answer
                        </h2> :
                        <h2 className='text-primary flex gap-2 items-center'>
                            <Mic/> Record Answer
                        </h2> 
                    }
                </Button>

                {loading && (
                    <div className='mt-4 flex flex-col items-center gap-2'>
                        <LoaderCircle className='animate-spin text-primary w-6 h-6' />
                        <p className='text-sm text-gray-500'>Saving answer...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecordAnswerSection;