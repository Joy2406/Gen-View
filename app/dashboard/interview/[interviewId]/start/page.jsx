/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary 
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 */

"use client"
import { db } from '@/utils/db'
import { mockInterview, UserAnswer } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import React, { useEffect, useState, use } from 'react'
import QuestionSection from './_components/QuestionSection'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs' // Added to identify the user for notifications
import { toast } from 'sonner'

import dynamic from 'next/dynamic'
const RecordAnswerSection = dynamic(
  () => import('./_components/RecordAnswerSection'),
  { ssr: false }
)

function StartInterview({ params }) {
    // FIX: Next.js 15 requires unwrapping params before use
    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const { user } = useUser(); // Get logged-in user details
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [interviewData, setInterviewData] = useState();
    
    // HITL State
    const [waitingForCoach, setWaitingForCoach] = useState(false);
    const router = useRouter();

    useEffect(() => {
        GetInterviewDetails();
    }, [interviewId]);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(mockInterview)
            .where(eq(mockInterview.mockId, interviewId));

        if (result && result[0]) {
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            setMockInterviewQuestion(jsonMockResp);
            setInterviewData(result[0]);
        }
    }

    /**
     * UPDATED: Triggers Resend Notification and switches to Wait Screen
     * No longer opens a popup; sends a private email to the coach instead.
     */
    const handleEndInterview = async () => {
        setWaitingForCoach(true);
        
        try {
            // 1. Call your custom Resend API route
            const response = await fetch('/api/notify-coach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId: interviewId,
                    userEmail: user?.primaryEmailAddress?.emailAddress || "Anonymous User"
                }),
            });

            if (response.ok) {
                toast.success("Human Coach has been notified for evaluation.");
            } else {
                console.error("Failed to send notification email.");
            }
        } catch (error) {
            console.error("Error triggering notification:", error);
            toast.error("Process saved, but coach notification failed.");
        }
    }

    /**
     * POLLING: Continues to check the database every 3 seconds.
     * Redirects the user only when 'pending' status is cleared by the coach.
     */
    useEffect(() => {
        let interval;
        if (waitingForCoach) {
            interval = setInterval(async () => {
                const result = await db.select().from(UserAnswer)
                    .where(and(
                        eq(UserAnswer.mockIdRef, interviewId),
                        eq(UserAnswer.status, 'pending')
                    ));

                // If no 'pending' rows remain, the coach has finalized the review
                if (result?.length === 0) {
                    setWaitingForCoach(false);
                    router.push(`/dashboard/interview/${interviewId}/feedback`);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [waitingForCoach, interviewId]);

    return (
        <div className='p-10 md:px-20 lg:px-40'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {/* Questions Section */}
                <QuestionSection 
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                />

                {/* HITL UI: Shows "Please Wait" screen after submission */}
                {waitingForCoach ? (
                    <div className='flex flex-col items-center justify-center p-10 bg-white rounded-xl border-2 h-[500px] shadow-sm'>
                        <LoaderCircle className='animate-spin w-16 h-16 text-gray-800 mb-6' />
                        <h2 className='text-3xl font-bold text-black mb-2 text-center'>Please Wait...</h2>
                        <p className='text-gray-500 text-center text-lg max-w-md'>
                            Your answers have been processed by AI and sent to a Human Coach for evaluation. 
                            You will be redirected automatically once the review is complete.
                        </p>
                        <p className='text-primary text-sm mt-8 animate-pulse font-bold uppercase tracking-widest'>
                            Waiting for coach feedback...
                        </p>
                    </div>
                ) : (
                    <RecordAnswerSection
                        mockInterviewQuestion={mockInterviewQuestion}
                        activeQuestionIndex={activeQuestionIndex}
                        interviewData={interviewData}
                    />
                )}
            </div>
            
            {/* Navigation Controls: Hidden during evaluation wait state */}
            {!waitingForCoach && (
                <div className='flex justify-end gap-6 mb-10 mt-10'>
                    {activeQuestionIndex > 0 && 
                        <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                            Previous Question
                        </Button>
                    }
                    {activeQuestionIndex !== mockInterviewQuestion?.length - 1 && 
                        <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                            Next Question
                        </Button>
                    }
                    {activeQuestionIndex === mockInterviewQuestion?.length - 1 && 
                        <Button variant="destructive" className="px-10" onClick={handleEndInterview}>
                            Submit & End Interview
                        </Button>
                    }
                </div>
            )}
        </div>
    )
}

export default StartInterview;