/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary 
 * @note This file contains Human-in-the-Loop (HITL) proprietary logic.
 */

import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionSection({ mockInterviewQuestion, activeQuestionIndex }) {

    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speech)
        }
        else {
            alert('Sorry, Your browser does not support text to speech')
        }
    }

    return mockInterviewQuestion && (
        <div className='my-10'>
            {/* 2. Square border running along question numbers and questions */}
            <div className='p-5 border rounded-lg flex flex-col gap-10'>
                
                {/* 1 & 3. Aligned Question Numbers with Gap */}
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                    {mockInterviewQuestion.map((question, index) => (
                        <h2 key={index} className={`p-2 border rounded-full
                            text-xs md:text-sm text-center cursor-pointer
                            ${activeQuestionIndex == index && 'bg-primary text-white'}`}>
                            Question #{index + 1}
                        </h2>
                    ))}
                </div>

                {/* 1 & 3. Active Question Section moved lower with specific gap */}
                <div className='flex flex-col gap-5'>
                    <h2 className='text-md md:text-lg font-medium leading-relaxed'>
                        {mockInterviewQuestion[activeQuestionIndex]?.question}
                    </h2>
                    
                    {/* 3. Speaker Icon with gap from text */}
                    <Volume2 
                        className='cursor-pointer text-gray-500 hover:text-primary transition-colors' 
                        onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} 
                    />
                </div>
            </div>

            {/* 3. Note section with gap from the main border box */}
            <div className='border rounded-lg p-5 bg-blue-100 mt-10'>
                <h2 className='flex gap-2 items-center text-primary'>
                    <Lightbulb />
                    <strong>Note:</strong>
                </h2>
                <h2 className='text-sm text-primary my-2 leading-relaxed'>
                    {process.env.NEXT_PUBLIC_QUESTION_NOTE || "Click on Record Answer to answer the question and save it."}
                </h2>
            </div>
        </div>
    )
}

export default QuestionSection