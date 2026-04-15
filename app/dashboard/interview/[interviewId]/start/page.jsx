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

import dynamic from 'next/dynamic'
const RecordAnswerSection = dynamic(
  () => import('./_components/RecordAnswerSection'),
  { ssr: false }
)

function StartInterview({ params }) {
    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [interviewData, setInterviewData] = useState();
    
    // 1. HITL States
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

    // 2. Triggers the Operator Window and Wait Screen
    const handleEndInterview = () => {
        setWaitingForCoach(true);
        // Opens your private operator window in a new tab
        window.open(`/operator/${interviewId}`, '_blank', 'width=1200,height=800');
    }

    // 3. POLLING: Checks if all answers are reviewed every 3 seconds
    useEffect(() => {
        let interval;
        if (waitingForCoach) {
            interval = setInterval(async () => {
                const result = await db.select().from(UserAnswer)
                    .where(and(
                        eq(UserAnswer.mockIdRef, interviewId),
                        eq(UserAnswer.status, 'pending')
                    ));

                // If no 'pending' rows remain, redirect the user
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

                {/* 4. Conditional UI: Camera or Wait Screen */}
                {waitingForCoach ? (
                    <div className='flex flex-col items-center justify-center p-10 bg-white rounded-xl border-2 h-[500px] shadow-sm'>
                        <LoaderCircle className='animate-spin w-16 h-16 text-gray-800 mb-6' />
                        <h2 className='text-3xl font-bold text-black mb-2 text-center'>Please Wait...</h2>
                        <p className='text-gray-500 text-center text-lg max-w-md'>
                            Your answer has been processed by AI and sent to a Human Coach for evaluation. 
                            This operator window is currently open.
                        </p>
                        <p className='text-primary text-sm mt-8 animate-pulse font-bold uppercase'>
                            Checking for coach feedback...
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
            
            {/* 5. Navigation Controls: Hidden when waiting */}
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
                        <Button variant="destructive" onClick={handleEndInterview}>
                            End Interview
                        </Button>
                    }
                </div>
            )}
        </div>
    )
}

export default StartInterview;