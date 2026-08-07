import { AcceptInviteForm } from './components/AcceptInviteForm';
import { HeroSection } from '../Login/components/HeroSection';

export default function AcceptInviteModule() {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center flex-shrink-0">
        <AcceptInviteForm />
      </div>
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-1">
        <HeroSection />
      </div>
    </div>
  );
}
