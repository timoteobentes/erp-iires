import iconeMosaico from '../../../assets/icone-mosaico-sigetes.png';

export function HeroSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center relative w-full h-full bg-gradient-to-b from-primary-500 to-dark-500 text-white overflow-hidden p-12 xl:p-24">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-[44px] font-semibold mb-5 leading-[1.15] tracking-tight">
          A gestão que sustenta a sua missão.
        </h2>
        <p className="text-white/80 text-[15px] leading-relaxed max-w-[420px]">
          Financeiro, projetos, pessoas e prestação de contas em um só lugar —
          feito para o ritmo real do terceiro setor.
        </p>
      </div>

      {/* Marca d'água do ícone-mosaico da logo */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[700px] opacity-100 pointer-events-none select-none">
        <img src={iconeMosaico} alt="" className="w-full h-auto opacity-10" />
      </div>
    </div>
  );
}
