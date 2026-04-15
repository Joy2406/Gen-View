/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary 
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 */


"use client"    

import React, { useEffect, useState, use } from 'react'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

function OperatorReview({ params }) {
    // Unwrap the dynamic interviewId parameter
    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const [pendingAnswers, setPendingAnswers] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [coachNotes, setCoachNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (interviewId) {
            GetPendingAnswers();
        }
    }, [interviewId]);

    // Fetches answers marked as 'pending' for this specific session
    const GetPendingAnswers = async () => {
        setLoading(true);
        const result = await db.select().from(UserAnswer)
            .where(and(
                eq(UserAnswer.mockIdRef, interviewId),
                eq(UserAnswer.status, 'pending')
            ));
        
        setPendingAnswers(result);
        if (result.length > 0) {
            setCoachNotes(result[0].humanFeedback || '');
        }
        setLoading(false);
    }

    // Updates the DB and moves to the next question or closes the window
    const finalizeReview = async () => {
        try {
            await db.update(UserAnswer)
                .set({ 
                    humanFeedback: coachNotes, 
                    status: 'reviewed' // This will trigger the user's redirect from the "Wait" screen
                })
                .where(eq(UserAnswer.id, pendingAnswers[activeIndex].id));

            toast.success("Feedback finalized for this question!");
            
            if (activeIndex < pendingAnswers.length - 1) {
                const nextIndex = activeIndex + 1;
                setActiveIndex(nextIndex);
                setCoachNotes(pendingAnswers[nextIndex].humanFeedback || '');
            } else {
                toast.info("All questions reviewed. Closing operator window...");
                setTimeout(() => window.close(), 2000); 
            }
        } catch (error) {
            toast.error("Failed to save review.");
        }
    }

    if (loading) return <div className='p-20 text-center text-xl'>Loading answers...</div>
    if (pendingAnswers.length === 0) return <div className='p-20 text-center text-xl font-bold'>No pending answers found for this session.</div>

    return (
        <div className='flex flex-col h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-[#3498db] p-5 text-center text-white font-bold text-4xl uppercase tracking-tighter shadow-md'>
                Operator Review
            </div>

            <div className='p-10 flex-1 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full'>
                <h2 className='text-3xl font-extrabold text-gray-900'>Question {activeIndex + 1} of {pendingAnswers.length}</h2>
                
                <div>
                    <h3 className='font-bold text-xl text-gray-800'>Question:</h3>
                    <p className='text-gray-700 text-lg mt-1'>{pendingAnswers[activeIndex].question}</p>
                </div>

                <div>
                    <h3 className='font-bold text-xl text-gray-800'>User's Answer:</h3>
                    <div className='p-6 bg-white border-2 rounded-xl text-gray-800 shadow-inner min-h-[120px]'>
                        {pendingAnswers[activeIndex].userAns}
                    </div>
                </div>

                <div>
                    <h3 className='font-bold text-xl text-green-700'>AI Feedback:</h3>
                    <div className='p-6 bg-green-50 border-2 border-green-100 rounded-xl text-green-900 shadow-inner'>
                        {pendingAnswers[activeIndex].feedback}
                    </div>
                </div>

                <div>
                    <h3 className='font-bold text-xl text-[#3498db]'>Your Additional Improvements/Notes:</h3>
                    <Textarea 
                        className='mt-3 bg-[#f4faff] border-2 border-[#d6e9f8] min-h-[180px] text-lg text-gray-900 focus:ring-blue-300'
                        value={coachNotes}
                        onChange={(e) => setCoachNotes(e.target.value)}
                        placeholder="Add human context, corrections, or encouragement here..."
                    />
                </div>

                <div className='flex justify-center gap-6 pt-10 pb-20'>
                    <Button 
                        variant="outline" 
                        size="lg"
                        className="px-10 border-2 font-bold"
                        onClick={() => {
                            const prevIndex = activeIndex - 1;
                            setActiveIndex(prevIndex);
                            setCoachNotes(pendingAnswers[prevIndex].humanFeedback || '');
                        }} 
                        disabled={activeIndex === 0}
                    >
                        ← Previous Question
                    </Button>

                    <Button 
                        className='bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-16 py-8 text-2xl rounded-full transition-transform hover:scale-105 shadow-xl'
                        onClick={finalizeReview}
                    >
                        Finalize & Show to User
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default OperatorReview;