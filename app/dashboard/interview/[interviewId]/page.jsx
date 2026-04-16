"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { mockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, use } from 'react' // Added use hook
import Webcam from 'react-webcam'

function Interview({ params }) {
    // FIX: Unwrap params Promise for Next.js 15
    const resolvedParams = use(params);
    const interviewId = resolvedParams.interviewId;

    const [interviewData, setInterviewData] = useState();
    const [webCamEnabled, setWebCamEnabled] = useState(false);

    useEffect(() => {
        GetInterviewDetails();
    }, [interviewId]);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(mockInterview)
            .where(eq(mockInterview.mockId, interviewId));

        setInterviewData(result[0]);
    }

    return (
        <div className='my-10 '>
            <h2 className='font-bold text-2xl'>Let's Get Started</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div className='flex flex-col my-5 gap-5 '>
                    <div className='flex flex-col p-5 rounded-lg border gap-5'>
                        <h2 className='text-lg'><strong>Job Role/Job Position:</strong> {interviewData?.jobPosition} </h2>
                        <h2 className='text-lg'><strong>Job Description/Tech Stack:</strong> {interviewData?.jobDesc} </h2>
                        <h2 className='text-lg'><strong>Years of Experience:</strong> {interviewData?.jobExperience} </h2>
                    </div>
                    <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
                        <h2 className='flex gap-2 items-center text-yellow-500'> <Lightbulb /><strong>Information</strong></h2>
                        <h2 className='mt-3 text-yellow-500'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    {webCamEnabled ? (
                        <Webcam
                            onUserMedia={() => setWebCamEnabled(true)}
                            onUserMediaError={() => setWebCamEnabled(false)}
                            mirrored={true}
                            style={{ height: 300, width: 300 }}
                        />
                    ) : (
                        <div className='w-full flex flex-col items-center'>
                            <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                            <Button variant="ghost" className="w-full" onClick={() => setWebCamEnabled(true)}>
                                Enable Web Cam and Microphone before starting the interview!
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className='flex justify-end items-end mt-5'>
                <Link href={'/dashboard/interview/' + interviewId + '/start'}>
                    <Button>Start Interview</Button>
                </Link>
            </div>
        </div>
    )
}

export default Interview