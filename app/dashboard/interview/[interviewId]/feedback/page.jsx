"use client"
/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 *
 * SCORING SYSTEM:
 *   AI rates each answer 1–5 based on STAR framework coverage.
 *   Each rating converts to a score out of 2:
 *     1 → 0.0,  2 → 0.5,  3 → 1.0,  4 → 1.5,  5 → 2.0
 *   Formula: (rating - 1) × 0.5
 *   Total score = sum of all per-question scores.
 *   Max possible = number of questions × 2.
 */

import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState, use } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, UserCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// ── Scoring helpers ──────────────────────────────────────────────────────────

// Converts an AI rating (1–5) to a score out of 2
const toScoreOutOf2 = (rating) => {
    const clamped = Math.min(5, Math.max(1, Number(rating) || 1));
    return (clamped - 1) * 0.5;
};

// Returns a colour class based on score out of 2
const scoreColour = (score) => {
    if (score >= 1.5) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
    if (score >= 1.0) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
    if (score >= 0.5) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
};

// Returns a colour for the total score banner
const totalColour = (score, max) => {
    const pct = max > 0 ? score / max : 0;
    if (pct >= 0.8) return { bg: 'bg-green-500', label: 'Excellent' };
    if (pct >= 0.6) return { bg: 'bg-blue-500', label: 'Good' };
    if (pct >= 0.4) return { bg: 'bg-yellow-500', label: 'Fair' };
    return { bg: 'bg-red-500', label: 'Needs Work' };
};

// ── STAR label for each rating (shown to user so they understand the score) ──
const STAR_LABELS = {
    1: 'No STAR components present',
    2: '1 / 4 STAR components',
    3: '2 / 4 STAR components',
    4: '3 / 4 STAR components',
    5: 'All 4 STAR components',
};

// ── Star icons component ─────────────────────────────────────────────────────
function StarRating({ rating }) {
    return (
        <div className='flex items-center gap-0.5'>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={14}
                    className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                />
            ))}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
function Feedback({ params }) {
    const resolvedParams = use(params);
    const [feedbackList, setFeedbackList] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [maxScore, setMaxScore] = useState(0);
    const router = useRouter();

    useEffect(() => {
        GetFeedback();
    }, []);

    const GetFeedback = async () => {
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, resolvedParams.interviewId))
            .orderBy(UserAnswer.id);

        setFeedbackList(result);

        if (result.length > 0) {
            // Convert every rating to /2 and sum them up
            const total = result.reduce(
                (sum, item) => sum + toScoreOutOf2(item.rating), 0
            );
            setTotalScore(Math.round(total * 10) / 10); // round to 1 decimal
            setMaxScore(10);
        }
    };

    if (feedbackList.length === 0) {
        return (
            <div className='p-10 flex flex-col gap-3'>
                <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback Record Found</h2>
                <Button className="w-fit" onClick={() => router.replace('/dashboard')}>Go Home</Button>
            </div>
        );
    }

    const { bg: bannerBg, label: performanceLabel } = totalColour(totalScore, maxScore);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
        <div className='p-10 md:px-20 lg:px-40'>

            <h2 className='text-4xl font-black text-green-500 tracking-tighter'>Congratulations!</h2>
            <h2 className='font-bold text-2xl mt-2 text-gray-800'>Here is your interview feedback</h2>

            {/* ── Total score banner ─────────────────────────────────────── */}
            <div className='my-8 rounded-2xl overflow-hidden border shadow-sm'>
                <div className={`${bannerBg} px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                    <div>
                        <p className='text-white/80 text-sm font-medium uppercase tracking-widest mb-1'>
                            Total STAR Score
                        </p>
                        <div className='flex items-end gap-3'>
                            <span className='text-white text-6xl font-black leading-none'>
                                {totalScore}
                            </span>
                            <span className='text-white/70 text-2xl font-medium mb-1'>
                                / {maxScore}
                            </span>
                        </div>
                    </div>
                    <div className='text-right'>
                        <span className='inline-block bg-white/20 text-white text-lg font-bold px-5 py-2 rounded-full'>
                            {performanceLabel} · {percentage}%
                        </span>
                        <p className='text-white/60 text-xs mt-2'>
                            Each question is scored 0 – 2 based on the STAR framework
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className='h-2 bg-gray-100'>
                    <div
                        className={`h-full ${bannerBg} transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* STAR legend */}
                <div className='bg-gray-50 px-8 py-4 grid grid-cols-2 sm:grid-cols-5 gap-2'>
                    {Object.entries(STAR_LABELS).map(([rating, label]) => {
                        const score = toScoreOutOf2(Number(rating));
                        return (
                            <div key={rating} className='flex flex-col items-center text-center'>
                                <StarRating rating={Number(rating)} />
                                <span className='text-[11px] font-bold text-gray-700 mt-1'>{score} / 2</span>
                                <span className='text-[10px] text-gray-400 leading-tight mt-0.5'>{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className='text-gray-500 font-medium mb-5'>
                Find below each question with your score, model answer, your response, and hybrid (AI + Human) feedback.
            </p>

            {/* ── Per-question collapsibles ──────────────────────────────── */}
            {feedbackList.map((item, index) => {
                const rating = Math.min(5, Math.max(1, Number(item.rating) || 1));
                const score = toScoreOutOf2(rating);
                const { bg, border, text } = scoreColour(score);

                return (
                    <Collapsible key={index} className='mt-4'>
                        <CollapsibleTrigger className='w-full p-4 bg-gray-50 hover:bg-gray-100 transition-all border rounded-xl flex items-center justify-between gap-4 text-left'>
                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                                {/* Score pill */}
                                <div className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 ${bg} ${border}`}>
                                    <span className={`text-lg font-black leading-none ${text}`}>{score}</span>
                                    <span className={`text-[10px] font-bold ${text} opacity-70`}>/ 2</span>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5'>
                                        Question {index + 1}
                                    </p>
                                    <p className='font-semibold text-gray-700 truncate'>
                                        {item.question}
                                    </p>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <StarRating rating={rating} />
                                        <span className='text-[11px] text-gray-400'>{STAR_LABELS[rating]}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronsUpDown className='h-5 w-5 text-gray-400 flex-shrink-0' />
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className='flex flex-col gap-4 p-5 bg-white border-x border-b rounded-b-xl'>

                                {/* Score breakdown */}
                                <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${bg} ${border}`}>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-widest ${text} opacity-70 mb-1`}>
                                            STAR Score
                                        </p>
                                        <div className='flex items-center gap-3'>
                                            <StarRating rating={rating} />
                                            <span className={`font-bold text-sm ${text}`}>
                                                {rating}/5 stars → {score}/2 points
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-1 ${text} opacity-80`}>
                                            {STAR_LABELS[rating]}
                                        </p>
                                    </div>
                                    <div className={`text-4xl font-black ${text}`}>
                                        {score}<span className='text-lg opacity-50'>/2</span>
                                    </div>
                                </div>

                                {/* User answer */}
                                <div className='p-4 border rounded-xl bg-gray-50'>
                                    <strong className='text-gray-800 block mb-1 text-sm uppercase tracking-wide'>Your Answer</strong>
                                    <p className='text-sm text-gray-600 leading-relaxed'>{item.userAns}</p>
                                </div>

                                {/* Correct answer */}
                                <div className='p-4 border rounded-xl bg-green-50/40'>
                                    <strong className='text-green-800 block mb-1 text-sm uppercase tracking-wide'>Model Answer</strong>
                                    <p className='text-sm text-green-700 leading-relaxed'>{item.correctAns}</p>
                                </div>

                                {/* AI Feedback */}
                                <div className='p-4 border rounded-xl bg-blue-50/40'>
                                    <strong className='text-blue-800 block mb-1 text-sm uppercase tracking-wide'>AI Feedback</strong>
                                    <p className='text-sm text-blue-700 leading-relaxed'>{item.feedback}</p>
                                </div>

                                {/* Human coach feedback */}
                                {item.humanFeedback && (
                                    <div className='p-5 border-2 border-indigo-100 rounded-xl bg-indigo-50/50 shadow-sm'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <UserCheck className='h-5 w-5 text-indigo-600' />
                                            <strong className='text-indigo-800 text-sm uppercase tracking-wide'>
                                                Additional Coach Notes
                                            </strong>
                                        </div>
                                        <p className='text-indigo-900 italic font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-50'>
                                            &quot;{item.humanFeedback}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}

            {/* ── Final total recap ──────────────────────────────────────── */}
            <div className='mt-10 p-6 rounded-2xl bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div>
                    <p className='text-gray-400 text-sm uppercase tracking-widest font-bold mb-1'>Final Score</p>
                    <p className='text-5xl font-black'>
                        {totalScore}
                        <span className='text-2xl text-gray-500 font-medium'> / {maxScore}</span>
                    </p>
                    <p className='text-gray-400 text-sm mt-1'>{feedbackList.length} questions · max 2 pts each</p>
                </div>
                <div className='text-center sm:text-right'>
                    <span className={`inline-block px-6 py-2 rounded-full font-black text-lg ${bannerBg}`}>
                        {performanceLabel}
                    </span>
                    <p className='text-gray-500 text-xs mt-2'>Based on STAR framework coverage</p>
                </div>
            </div>

            <div className='flex items-center justify-center mt-10 mb-20'>
                <Button
                    className='px-12 py-6 text-lg font-bold rounded-full shadow-lg'
                    onClick={() => router.replace('/dashboard')}
                >
                    Go Back to Dashboard
                </Button>
            </div>
        </div>
    );
}

export default Feedback;
