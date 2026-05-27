export function HeroSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center relative w-full h-full from-[#026B11] to-[#2B2E4A] bg-gradient-to-b text-white overflow-hidden p-12 xl:p-24">
      {/* Background Graphic Rings */}
      {/* <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full border-[60px] border-white/[0.015] pointer-events-none"></div>
      <div className="absolute top-[-40%] left-[-20%] w-[1000px] h-[1000px] rounded-full border-[60px] border-white/[0.015] pointer-events-none"></div> */}

      <div className="relative z-10 max-w-xl">
        <h2 className="text-[44px] font-semibold mb-5 leading-[1.15] tracking-tight">
          O futuro sustentável começa aqui!
        </h2>
        {/* <p className="text-gray-300 text-[15px] mb-8 leading-relaxed max-w-[400px]">
          MatDash helps developers to build organized and well coded dashboards full of beautiful and rich modules.
        </p>
        <button className="px-6 py-2.5 bg-[#635BFF] hover:bg-[#524ae3] text-white text-[14px] font-medium rounded-lg transition-colors">
          Learn More
        </button> */}
      </div>

      {/* Large Abstract Graphic Bottom Right */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[700px] opacity-100 pointer-events-none select-none">
        <img src="/src/assets/iires-logo-branca.png" alt="Logo" className="w-full h-auto opacity-10" />
      </div>
    </div>
  );
}
