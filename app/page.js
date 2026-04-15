import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      
      {/* 1. Full-Page Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/GVImage.png" 
          alt="GenView Background" 
          fill // This scales the image to fill the parent container
          priority
          className="object-cover opacity-40" // Adjust opacity so text remains readable
        />
      </div>

      {/* 2. Content Overlay */}
      <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm p-10 rounded-3xl border border-white/20 shadow-2xl">
        <h1 className="text-gray-950 text-9xl md:text-8xl font-black mb-6 text-center tracking-tighter drop-shadow-lg">
          Welcome to GenView
        </h1>
        
        <p className="text-gray-700 text-lg md:text-lg mb-10 text-center max-w-2xl leading-relaxed font-medium">
          Create and start your AI mockup interview with our advanced generation platform.
        </p>

        {/* 3. Auth Button */}
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <Button size="lg" className="px-12 py-8 text-xl font-bold rounded-full shadow-2xl hover:scale-110 transition-all bg-primary">
            Get Started / Login
          </Button>
        </SignInButton>
      </div>

    </div>
  );
}