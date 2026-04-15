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
import { useUser } from '@clerk/nextjs' 
import { ShieldAlert, LoaderCircle, CheckCircle2 } from 'lucide-react'

function OperatorReview({ params }) {
    const { user, isLoaded } = useUser();
    const adminEmail = "joypasala2406@gmail.com"; 

    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const [pendingAnswers, setPendingAnswers] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [coachNotes, setCoachNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (interviewId && isLoaded && user?.primaryEmailAddress?.emailAddress === adminEmail) {
            GetPendingAnswers();
        }
    }, [interviewId, isLoaded, user]);

    const GetPendingAnswers = async () => {
        setLoading(true);
        try {
            const result = await db.select().from(UserAnswer)
                .where(and(
                    eq(UserAnswer.mockIdRef, interviewId),
                    eq(UserAnswer.status, 'pending')
                ));
            
            setPendingAnswers(result);
            if (result.length > 0) {
                setCoachNotes(result[0].humanFeedback || '');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load interview data.");
        } finally {
            setLoading(false);
        }
    }

    const finalizeReview = async () => {
        try {
            await db.update(UserAnswer)
                .set({ 
                    humanFeedback: coachNotes, 
                    status: 'reviewed' 
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

    if (!isLoaded || (loading && user?.primaryEmailAddress?.emailAddress === adminEmail)) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-gray-50'>
                <LoaderCircle className='animate-spin h-12 w-12 text-primary mb-4' />
                <h2 className='text-xl font-medium text-gray-600'>Verifying Admin Permissions...</h2>
            </div>
        );
    }

    if (user?.primaryEmailAddress?.emailAddress !== adminEmail) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-white p-10 text-center'>
                <ShieldAlert className='h-24 w-24 text-red-500 mb-6' />
                <h1 className='text-5xl font-black text-gray-900 tracking-tighter mb-4'>UNAUTHORIZED ACCESS</h1>
                <p className='text-gray-500 text-xl max-w-lg'>
                    This evaluation window is strictly reserved for the Human Coach.
                </p>
                <Button className="mt-10 px-10 py-6 text-lg rounded-full" onClick={() => window.location.href='/dashboard'}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    if (pendingAnswers.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-gray-50'>
                <CheckCircle2 className='h-20 w-20 text-green-500 mb-6' />
                <h2 className='text-3xl font-bold text-gray-800'>All caught up!</h2>
                <p className='text-gray-500 text-lg'>No pending answers found for this session.</p>
                <Button variant="outline" className="mt-8" onClick={() => window.close()}>Close Window</Button>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-screen bg-gray-50'>
            <div className='bg-[#3498db] p-5 text-center text-white font-bold text-4xl uppercase tracking-tighter shadow-md'>
                Operator Review
            </div>

            <div className='p-10 flex-1 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full'>
                <div className='flex justify-between items-end'>
                    <h2 className='text-3xl font-extrabold text-gray-900'>Question {activeIndex + 1} of {pendingAnswers.length}</h2>
                    <span className='bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase'>Admin Mode</span>
                </div>
                
                {/* FIXED: Removed 'text-xl' conflict, kept 'text-sm' for uppercase labels */}
                <div className='space-y-2'>
                    <h3 className='font-bold text-gray-800 uppercase tracking-wide text-sm'>Current Question:</h3>
                    <p className='text-gray-700 text-xl leading-relaxed'>{pendingAnswers[activeIndex].question}</p>
                </div>

                <div className='space-y-2'>
                    <h3 className='font-bold text-gray-800 uppercase tracking-wide text-sm'>User's Answer:</h3>
                    <div className='p-6 bg-white border-2 rounded-xl text-gray-800 shadow-inner min-h-[120px] text-lg'>
                        {pendingAnswers[activeIndex].userAns}
                    </div>
                </div>

                <div className='space-y-2'>
                    <h3 className='font-bold text-green-700 uppercase tracking-wide text-sm'>AI Feedback (Generated):</h3>
                    <div className='p-6 bg-green-50 border-2 border-green-100 rounded-xl text-green-900 shadow-inner italic'>
                        {pendingAnswers[activeIndex].feedback}
                    </div>
                </div>

                <div className='space-y-2'>
                    <h3 className='font-bold text-[#3498db] uppercase tracking-wide text-sm'>Your Additional Coach Notes:</h3>
                    <Textarea 
                        className='mt-3 bg-[#f4faff] border-2 border-[#d6e9f8] min-h-[200px] text-lg text-gray-900 focus:ring-blue-300 rounded-xl shadow-sm'
                        value={coachNotes}
                        onChange={(e) => setCoachNotes(e.target.value)}
                        placeholder="Add engineering feedback here..."
                    />
                </div>

                <div className='flex justify-center gap-6 pt-10 pb-20'>
                    <Button 
                        variant="outline" 
                        size="lg"
                        className="px-10 border-2 font-bold h-16 text-lg rounded-full"
                        onClick={() => {
                            const prevIndex = activeIndex - 1;
                            setActiveIndex(prevIndex);
                            setCoachNotes(pendingAnswers[prevIndex].humanFeedback || '');
                        }} 
                        disabled={activeIndex === 0}
                    >
                        ← Previous
                    </Button>

                    <Button 
                        className='bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-16 py-8 text-2xl rounded-full transition-transform hover:scale-105 shadow-xl'
                        onClick={finalizeReview}
                    >
                        Finalize & Push to User
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default OperatorReview;