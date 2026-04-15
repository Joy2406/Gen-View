"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

function Header() {
    const path = usePathname();
    const [isLogoOpen, setIsLogoOpen] = useState(false);

    return (
        <>
            {/* 1. Increased padding (px-16 to px-40) moves elements further from the edges */}
            <div className='flex p-3 px-16 md:px-40 items-center justify-between bg-gray-50 shadow-sm border-b sticky top-0 z-50'>
                
                {/* 2. Logo Section: Clickable for larger view */}
                <div className='flex items-center gap-2'>
                    <div 
                        className='overflow-hidden rounded-full border-2 border-primary shadow-sm cursor-pointer hover:scale-110 transition-all'
                        onClick={() => setIsLogoOpen(true)}
                    >
                        <Image 
                            src={'/logo_gv.png'} 
                            width={45} 
                            height={45} 
                            alt='logo' 
                            className='object-cover' 
                        />
                    </div>
                </div>

                {/* 3. Middle Navigation: Forced to single line */}
                <ul className='hidden md:flex gap-10 lg:gap-14 justify-center items-center'>
                    <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer text-base whitespace-nowrap
                        ${path == '/dashboard' && 'text-primary font-bold'}`}>Dashboard</li>
                    <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer text-base whitespace-nowrap
                        ${path == '/dashboard/questions' && 'text-primary font-bold'}`}>Questions</li>
                    <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer text-base whitespace-nowrap
                        ${path == '/dashboard/upgrade' && 'text-primary font-bold'}`}>Upgrade</li>
                    <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer text-base whitespace-nowrap
                        ${path == '/dashboard/how' && 'text-primary font-bold'}`}>How it Works?</li>
                </ul>

                {/* 4. User Button Section */}
                <div className='flex items-center justify-end'>
                    <UserButton />
                </div>
            </div>

            {/* 5. Logo "Large View" Modal */}
            <Dialog open={isLogoOpen} onOpenChange={setIsLogoOpen}>
                <DialogContent className="flex items-center justify-center bg-transparent border-none shadow-none">
                    <DialogTitle className="hidden">Logo View</DialogTitle>
                    <div className='rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white'>
                        <Image 
                            src={'/logo_gv.png'} 
                            width={400} 
                            height={400} 
                            alt='Large Logo' 
                            className='object-cover'
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Header