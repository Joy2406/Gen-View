/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 *
 * CHANGES vs previous version:
 *  - Two-panel layout: LEFT = video player + evaluation cues, RIGHT = review panel
 *  - Video player shows the candidate's recorded answer (operators only)
 *  - Evaluation cues prompt the coach on emotion, tone, and professionalism
 *  - Auto-delete: video is destroyed from Cloudinary the moment a question is finalized
 *    so it is never stored beyond the review window
 *  - Graceful fallback when no video was recorded (audio-only sessions still work)
 */

"use client"

import React, { useEffect, useRef, useState, use } from 'react'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import {
    ShieldAlert,
    LoaderCircle,
    CheckCircle2,
    VideoOff,
    Smile,
    Mic2,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Send,
    Eye,
} from 'lucide-react'

/* ─── Evaluation cue config ─────────────────────────────────────────────── */
const EVAL_CUES = [
    {
        icon: Smile,
        label: 'Emotional tone',
        color: '#f59e0b',
        hint: 'Does the candidate appear nervous, confident, or disengaged? Note microexpressions and facial tension.',
    },
    {
        icon: Mic2,
        label: 'Vocal delivery',
        color: '#3b82f6',
        hint: 'Pace, clarity, filler words ("um", "uh"), and conviction. Are key points emphasised?',
    },
    {
        icon: Briefcase,
        label: 'Professionalism',
        color: '#10b981',
        hint: 'Eye contact, framing, attire, posture, and environment. Would this hold in a live panel?',
    },
    {
        icon: Eye,
        label: 'Engagement',
        color: '#8b5cf6',
        hint: 'Is the candidate present and thinking, or reciting a memorised script? Look for pause-and-think moments.',
    },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
function OperatorReview({ params }) {
    const { user, isLoaded } = useUser();
    const adminEmail = "joypasala2406@gmail.com";

    const currentUserEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isAdmin = currentUserEmail === adminEmail.toLowerCase();

    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const [pendingAnswers, setPendingAnswers] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [coachNotes, setCoachNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [finalizing, setFinalizing] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (interviewId && isLoaded && isAdmin) {
            GetPendingAnswers();
        }
    }, [interviewId, isLoaded, isAdmin]);

    // Reset video player when question changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [activeIndex]);

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
    };

    /* ── Delete video from Cloudinary after review ─────────────────────── */
    const deleteVideoFromCloudinary = async (publicId) => {
        if (!publicId) return; // no video was recorded — skip silently
        try {
            const res = await fetch('/api/delete-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId }),
            });
            if (!res.ok) throw new Error('Delete request failed');
        } catch (err) {
            // Non-fatal — log but don't block the coach's workflow
            console.error('[operator] Video delete failed:', err);
        }
    };

    /* ── Finalize a single question ─────────────────────────────────────── */
    const finalizeReview = async () => {
        setFinalizing(true);
        const current = pendingAnswers[activeIndex];
        try {
            // 1. Save coach feedback and mark as reviewed
            await db.update(UserAnswer)
                .set({
                    humanFeedback: coachNotes,
                    status: 'reviewed'
                })
                .where(eq(UserAnswer.id, current.id));

            // 2. Delete the video from Cloudinary — privacy-first
            //    This fires after the DB update so the coach has seen it
            await deleteVideoFromCloudinary(current.videoPublicId);

            toast.success(`Q${activeIndex + 1} finalized & video deleted.`);

            // 3. Advance to the next question or close
            if (activeIndex < pendingAnswers.length - 1) {
                const nextIndex = activeIndex + 1;
                setActiveIndex(nextIndex);
                setCoachNotes(pendingAnswers[nextIndex].humanFeedback || '');
            } else {
                toast.info("All questions reviewed. Closing operator window...");
                setTimeout(() => window.close(), 2500);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save review.");
        } finally {
            setFinalizing(false);
        }
    };

    /* ── Navigate without saving ─────────────────────────────────────────── */
    const goTo = (index) => {
        setActiveIndex(index);
        setCoachNotes(pendingAnswers[index].humanFeedback || '');
    };

    /* ── Guards ──────────────────────────────────────────────────────────── */
    if (!isLoaded || (loading && isAdmin)) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-gray-50'>
                <LoaderCircle className='animate-spin h-12 w-12 text-primary mb-4' />
                <h2 className='text-xl font-medium text-gray-600'>Verifying Admin Permissions...</h2>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-white p-10 text-center'>
                <ShieldAlert className='h-24 w-24 text-red-500 mb-6' />
                <h1 className='text-5xl font-black text-gray-900 tracking-tighter mb-4'>UNAUTHORIZED ACCESS</h1>
                <p className='text-gray-500 text-xl max-w-lg mb-2'>
                    This evaluation window is strictly reserved for the Human Coach.
                </p>
                <p className='text-gray-400 text-sm'>
                    Logged in as: {user?.primaryEmailAddress?.emailAddress || "Guest"}
                </p>
                <Button className="mt-8 px-10 py-6 text-lg rounded-full" onClick={() => window.location.href = '/dashboard'}>
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

    const current = pendingAnswers[activeIndex];
    const hasVideo = Boolean(current?.videoUrl);

    /* ── Main UI ─────────────────────────────────────────────────────────── */
    return (
        <div className='flex flex-col h-screen bg-gray-50 overflow-hidden'>

            {/* ── Top bar ──────────────────────────────────────────────── */}
            <div className='bg-[#3498db] px-8 py-4 flex items-center justify-between text-white shadow-md flex-shrink-0'>
                <div className='flex items-center gap-4'>
                    <span className='font-black text-2xl uppercase tracking-tighter'>Operator Review</span>
                    <span className='bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide'>
                        Admin Mode
                    </span>
                </div>
                <div className='flex items-center gap-3'>
                    {/* Question pill nav */}
                    {pendingAnswers.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`w-8 h-8 rounded-full text-sm font-bold transition-all
                                ${i === activeIndex
                                    ? 'bg-white text-[#3498db] scale-110 shadow'
                                    : i < activeIndex
                                        ? 'bg-green-400 text-white'
                                        : 'bg-white/30 text-white hover:bg-white/50'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <span className='ml-2 text-white/70 text-sm'>
                        {activeIndex + 1} / {pendingAnswers.length}
                    </span>
                </div>
            </div>

            {/* ── Two-panel body ───────────────────────────────────────── */}
            <div className='flex flex-1 overflow-hidden'>

                {/* ════ LEFT PANEL — video + evaluation cues ════ */}
                <div className='w-[42%] flex-shrink-0 flex flex-col bg-gray-900 overflow-y-auto'>

                    {/* Video player */}
                    <div className='relative bg-black flex items-center justify-center min-h-[300px]'>
                        {hasVideo ? (
                            <video
                                ref={videoRef}
                                src={current.videoUrl}
                                controls
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                                className='w-full max-h-[340px] object-contain'
                                style={{ background: '#000' }}
                            />
                        ) : (
                            <div className='flex flex-col items-center gap-3 p-10 text-gray-500'>
                                <VideoOff className='w-12 h-12' />
                                <p className='text-sm text-center'>
                                    No video for this answer.<br />
                                    Evaluate based on text only.
                                </p>
                            </div>
                        )}

                        {/* Privacy notice overlay badge */}
                        {hasVideo && (
                            <div className='absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur'>
                                🔒 Coach eyes only · auto-deleted on finalize
                            </div>
                        )}
                    </div>

                    {/* Evaluation cue cards */}
                    <div className='p-5 space-y-3 flex-1'>
                        <p className='text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-4'>
                            Evaluation dimensions
                        </p>
                        {EVAL_CUES.map(({ icon: Icon, label, color, hint }) => (
                            <div
                                key={label}
                                className='bg-gray-800 rounded-xl p-4 flex items-start gap-3 border border-gray-700'
                            >
                                <div
                                    className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5'
                                    style={{ background: `${color}22` }}
                                >
                                    <Icon size={15} style={{ color }} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className='text-white text-[13px] font-semibold mb-0.5'>{label}</p>
                                    <p className='text-gray-400 text-[12px] leading-relaxed'>{hint}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ════ RIGHT PANEL — question / answer / feedback / notes ════ */}
                <div className='flex-1 overflow-y-auto p-8 space-y-6'>

                    {/* Question */}
                    <section className='space-y-2'>
                        <label className='text-[11px] font-black uppercase tracking-widest text-gray-400'>
                            Question {activeIndex + 1}
                        </label>
                        <p className='text-gray-900 text-xl font-medium leading-relaxed'>
                            {current.question}
                        </p>
                    </section>

                    {/* Candidate answer */}
                    <section className='space-y-2'>
                        <label className='text-[11px] font-black uppercase tracking-widest text-gray-400'>
                            Candidate&apos;s Answer
                        </label>
                        <div className='p-5 bg-white border-2 border-gray-100 rounded-xl text-gray-800 shadow-sm min-h-[100px] text-[15px] leading-relaxed'>
                            {current.userAns || <span className='text-gray-400 italic'>No answer recorded.</span>}
                        </div>
                    </section>

                    {/* AI feedback */}
                    <section className='space-y-2'>
                        <label className='text-[11px] font-black uppercase tracking-widest text-green-600'>
                            AI Feedback (draft — for reference)
                        </label>
                        <div className='p-5 bg-green-50 border-2 border-green-100 rounded-xl text-green-900 text-[15px] leading-relaxed italic'>
                            {current.feedback || <span className='text-gray-400 not-italic'>No AI feedback available.</span>}
                        </div>
                    </section>

                    {/* Suggested correct answer (if available) */}
                    {current.correctAns && (
                        <section className='space-y-2'>
                            <label className='text-[11px] font-black uppercase tracking-widest text-purple-600'>
                                Suggested Correct Answer
                            </label>
                            <div className='p-5 bg-purple-50 border-2 border-purple-100 rounded-xl text-purple-900 text-[15px] leading-relaxed'>
                                {current.correctAns}
                            </div>
                        </section>
                    )}

                    {/* Coach notes */}
                    <section className='space-y-2'>
                        <label className='text-[11px] font-black uppercase tracking-widest text-[#3498db]'>
                            Your Coach Notes
                        </label>
                        <p className='text-[12px] text-gray-400'>
                            Include written observations on content, delivery, emotion, and what the candidate should do differently.
                        </p>
                        <Textarea
                            className='bg-[#f4faff] border-2 border-[#d6e9f8] min-h-[180px] text-[15px] text-gray-900 focus:ring-blue-300 rounded-xl shadow-sm resize-none'
                            value={coachNotes}
                            onChange={(e) => setCoachNotes(e.target.value)}
                            placeholder={`e.g. "Strong opening but missed quantifying the outcome. Video shows visible hesitation at the 0:42 mark when discussing stakeholder pushback — worth flagging. Recommend practising trade-off articulation."`}
                        />
                    </section>

                    {/* Action buttons */}
                    <div className='flex items-center justify-between pt-4 pb-12'>
                        <Button
                            variant="outline"
                            className='gap-2 px-6 font-bold h-12 rounded-full border-2'
                            onClick={() => goTo(activeIndex - 1)}
                            disabled={activeIndex === 0 || finalizing}
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>

                        <Button
                            className='bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-10 h-14 text-lg rounded-full transition-transform hover:scale-105 shadow-xl gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100'
                            onClick={finalizeReview}
                            disabled={finalizing}
                        >
                            {finalizing ? (
                                <>
                                    <LoaderCircle className='animate-spin' size={18} />
                                    Finalizing...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    {activeIndex < pendingAnswers.length - 1
                                        ? `Finalize Q${activeIndex + 1} & next`
                                        : 'Finalize & complete review'}
                                </>
                            )}
                        </Button>

                        {activeIndex < pendingAnswers.length - 1 && (
                            <Button
                                variant="outline"
                                className='gap-2 px-6 font-bold h-12 rounded-full border-2'
                                onClick={() => goTo(activeIndex + 1)}
                                disabled={finalizing}
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OperatorReview;
