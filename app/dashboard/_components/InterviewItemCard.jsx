import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId)
    }

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + "/feedback")
    }

    return (
        <div className='border shadow-sm rounded-lg p-3 bg-white'>
            <h2 className='font-bold text-primary'>{interview?.jobPosition}</h2>
            <h2 className='text-sm text-gray-600'>{interview?.jobExperience} Years of Experience</h2>
            <h2 className='text-xs text-gray-400'>Created At: {interview?.createdAt}</h2>
            
            {/* The Fix: 
                - w-full on the container ensures it spans the entire card.
                - gap-5 provides the necessary spacing between buttons.
                - w-full on each Button inside flex ensures they share space equally (50/50).
            */}
            <div className='flex justify-between mt-5 gap-5 w-full'>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-1/2"
                    onClick={onFeedbackPress}
                >
                    Feedback
                </Button>
                <Button 
                    size="sm" 
                    className="w-1/2 bg-blue-700 hover:bg-blue-800"
                    onClick={onStart}
                >
                    Start
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard