import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import RubikParticles from './RubikParticles';
import { AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'error' as 'error' | 'success' | 'warning' });

  const handleStartSignIn = () => {
    // Trigger the 3D explosion
    window.dispatchEvent(new Event('nixx:signin'));
    setShowForm(true);
  };

  const handleGoogleLogin = async () => {
    window.dispatchEvent(new Event('nixx:implode'));
    setIsLoggingIn(true);
    setMsg({ text: '', type: 'error' });
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      setMsg({ text: e.message || 'Erro ao conectar com o Google.', type: 'warning' });
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMsg({ text: 'Preencha email e senha.', type: 'error' });
      return;
    }
    
    window.dispatchEvent(new Event('nixx:implode'));
    setIsLoggingIn(true);
    setMsg({ text: '', type: 'error' });
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setMsg({ text: 'Conta criada! Verifique seu email para confirmar.', type: 'success' });
        setIsLoggingIn(false);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('Invalid login credentials')) {
        setMsg({ text: 'Email ou senha incorretos.', type: 'error' });
      } else if (e.message?.includes('User already registered')) {
        setMsg({ text: 'Este email já está cadastrado.', type: 'error' });
      } else {
        setMsg({ text: e.message || 'Erro ao autenticar.', type: 'warning' });
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full h-full relative font-sans text-[#e5e1e4] pointer-events-none">
      
      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        
        {/* Initial State */}
        <AnimatePresence>
          {!showForm && (
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center pointer-events-auto absolute inset-0"
            >
              <div className="mb-8 flex flex-col items-center">
                <div className="p-4 bg-[#2a2a2c]/50 backdrop-blur-xl rounded-2xl border border-[#464554]/50 mb-6 shadow-inner">
                  <svg className="w-16 h-16 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="sqBg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2a2a2c" />
                        <stop offset="100%" stopColor="#131315" />
                      </linearGradient>
                      <linearGradient id="fFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#sqBg)" stroke="#464554" strokeWidth="1.5"/>
                    <path d="M6 18V6h3l6 8.5V6h3v12h-3l-6-8.5V18H6z" fill="url(#fFill)" />
                  </svg>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-[#494bd6] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 font-[Sora]">
                  Nixx
                </h1>
                <p className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-[#c0c1ff]/70 font-[JetBrains_Mono]">
                  KNOW YOUR MONEY.
                </p>
              </div>
              <button 
                onClick={handleStartSignIn}
                className="bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 transition-all duration-300 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 w-48 text-lg font-bold"
              >
                <span>SIGN IN</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login State */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center justify-center pointer-events-auto absolute inset-0 w-full px-4"
            >
              <div className="w-full max-w-md p-8 rounded-2xl bg-[#2a2a2c]/80 backdrop-blur-md border border-[#464554]/30 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c0c1ff] to-[#494bd6] mb-2 font-[Sora]">
                    {isSignUp ? 'Criar Conta Nixx' : 'Bem-vindo de volta'}
                  </h2>
                  <p className="text-sm text-[#c0c1ff]/70 tracking-widest font-[JetBrains_Mono]">
                    {isSignUp ? 'REGISTER TO START.' : 'KNOW YOUR MONEY.'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {msg.text && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className={`p-3 text-sm rounded-lg flex items-center gap-2 border ${
                        msg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-[#ffb4ab]' : 
                        msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <p>{msg.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form className="space-y-5" onSubmit={handleEmailAuth}>
                  <div>
                    <label className="block text-sm font-medium text-[#c7c4d7] mb-1 font-[Hanken_Grotesk]" htmlFor="email">
                      Email Address
                    </label>
                    <input 
                      id="email" 
                      type="email" 
                      required 
                      disabled={isLoggingIn}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                      placeholder="Enter your email" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#c7c4d7] mb-1 font-[Hanken_Grotesk]" htmlFor="password">
                      Password
                    </label>
                    <input 
                      id="password" 
                      type="password" 
                      required 
                      disabled={isLoggingIn}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm font-[Hanken_Grotesk]">
                    <label className="flex items-center text-[#c7c4d7] cursor-pointer">
                      <input type="checkbox" className="rounded border-[#464554]/30 bg-[#131315]/50 text-[#c0c1ff] focus:ring-[#c0c1ff]/50 mr-2" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-[#c0c1ff] hover:text-[#e1e0ff] transition-colors bg-transparent border-none p-0 cursor-pointer text-xs uppercase tracking-wider font-bold">
                      {isSignUp ? 'Login Instead' : 'Create Account'}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-lg text-white font-bold text-base mt-4 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                  >
                     {isLoggingIn && msg.type !== 'success' ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>{isSignUp ? 'Criar Conta' : 'Acessar Conta'}</span>
                      )}
                  </button>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full py-3 rounded-lg text-white font-bold text-base bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer */}
      <footer className="bottom-0 w-full py-4 bg-transparent z-20 absolute pointer-events-none font-[Hanken_Grotesk]">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-6 gap-2 w-full max-w-7xl mx-auto pointer-events-auto">
          <div className="font-[JetBrains_Mono] text-[#c0c1ff]/50 hidden md:block tracking-widest text-sm">Nixx</div>
          <div className="text-xs md:text-sm text-[#c7c4d7]/50 text-center md:text-left">© 2024 Nixx. Hyper-Digital Professional Grade.</div>
          <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-[#c7c4d7]/50">
            <button className="hover:text-[#c0c1ff] transition-colors bg-transparent border-none p-0 cursor-pointer">Security</button>
            <button className="hover:text-[#c0c1ff] transition-colors bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button>
            <button className="hover:text-[#c0c1ff] transition-colors bg-transparent border-none p-0 cursor-pointer">Terms of Service</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
