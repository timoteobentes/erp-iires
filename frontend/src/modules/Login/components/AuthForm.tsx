import React from 'react';

export function AuthForm() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src="/src/assets/logo-original.png" alt="IIRes" className="w-full h-auto opacity-100" />
      
      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Cadastre-se</h1>
        {/* <p className="text-[14px] text-gray-400">Seu painel administrativo</p> */}
      </div>

      {/* <div className="flex gap-4 mb-8">
        <SocialLoginButton provider="Google" icon={<GoogleIcon />} />
        <SocialLoginButton provider="Facebook" icon={<FacebookIcon />} />
      </div>

      <div className="relative flex items-center justify-center mb-8">
        <div className="border-t border-gray-100 w-full absolute"></div>
        <span className="bg-white px-4 text-[13px] text-gray-500 relative tracking-wide">or sign up with</span>
      </div> */}

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>        
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">E-mail</label>
          <input 
            type="email" 
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">Senha</label>
          <input 
            type="password" 
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-[#026B11] hover:bg-[#026B11]/80 active:bg-[#026B11]/60 text-white text-[15px] font-medium py-2.5 rounded-lg transition-colors mt-4"
        >
           Cadastrar
        </button>
      </form>

      <p className="mt-8 text-[14px] text-gray-600">
        Não tem uma conta? <a href="/signup" className="text-[#635BFF] hover:text-[#524ae3] hover:underline font-medium ml-1">Cadastre-se</a>
      </p>
    </div>
  );
}
