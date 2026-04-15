"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { LoaderCircle } from 'lucide-react'
import { mockInterview } from '@/utils/schema'
import { useRouter } from 'next/navigation' // Use navigation for App Router
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

function AddNewInterview() {
  const router = useRouter(); // Correctly invoked hook
  const [openDailog, setOpenDailog] = useState(false)
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const parseGeminiJSON = (raw) => {
    if (typeof raw !== "string") return raw;
    let s = raw.trim();
    s = s.replace(/```(?:json)?\s*|\s*```/gi, "");
    const m = s.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (m) s = m[1];
    s = s.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(s);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const InputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Based on this, provide ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5} interview questions and answers in JSON format with 'question' and 'answer' fields.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const raw = result.response.text();
      const parsed = parseGeminiJSON(raw);
      const MockJsonResp = JSON.stringify(parsed);

      if (MockJsonResp) {
        const resp = await db.insert(mockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: MockJsonResp,
            jobPosition: jobPosition,
            jobDesc: jobDesc,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY')
          }).returning({ mockId: mockInterview.mockId });

        if (resp) {
          setOpenDailog(false);
          router.push('/dashboard/interview/' + resp[0]?.mockId);
        }
      }
    } catch (err) {
      console.error("Failed to generate or save interview:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className='p-10 border rounded-lg bg-secondary
        hover:scale-105 hover:shadow-md cursor-pointer
        transition-all border-dashed h-[150px] flex items-center justify-center'
        onClick={() => setOpenDailog(true)}
      >
        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>

      <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
            
            {/* asChild prevents the <p> contains <div> error */}
            <DialogDescription asChild>
              <div className="text-muted-foreground text-sm">
                <span>Add details about your job position/role, job description, and years of experience.</span>
                
                <form onSubmit={onSubmit} className="mt-5">
                  <div className='my-3 text-left'>
                    <label className="block mb-1 font-semibold text-black">Job Role/Job Position</label>
                    <Input 
                      placeholder="Ex. Full Stack Developer" 
                      required
                      className="text-black"
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className='my-3 text-left'>
                    <label className="block mb-1 font-semibold text-black">Job Description/ Tech Stack</label>
                    <Textarea 
                      placeholder="Ex. React, NodeJs, MySql etc." 
                      required
                      className="text-black"
                      onChange={(event) => setJobDesc(event.target.value)} 
                    />
                  </div>
                  <div className='my-3 text-left'>
                    <label className="block mb-1 font-semibold text-black">Years of experience</label>
                    <Input 
                      placeholder="Ex. 5" 
                      type="number" 
                      max="100" 
                      required
                      className="text-black"
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>

                  <div className='flex gap-5 justify-end mt-7'>
                    <Button type="button" variant="ghost" onClick={() => setOpenDailog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoaderCircle className='animate-spin mr-2' /> Generating...
                        </>
                      ) : 'Start Interview'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview