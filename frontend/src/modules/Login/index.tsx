import React from 'react';
import { AuthForm } from './components/AuthForm';
import { HeroSection } from './components/HeroSection';

export default function LoginModule() {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Column - Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center flex-shrink-0">
        <AuthForm />
      </div>

      {/* Right Column - Hero Graphic */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-1">
        <HeroSection />
      </div>
    </div>
  );
}
