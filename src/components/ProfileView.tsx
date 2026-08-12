import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
          <User className="text-[var(--text-muted)]" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-[var(--fg)] tracking-tight">Meu Perfil</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Gerencie sua conta e sessão.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="fin-card p-6 border border-[var(--border)] shadow-sm bg-[var(--surface)]"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shrink-0">
            <User className="text-indigo-500" size={32} />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
                <Mail size={14} /> Endereço de E-mail
              </label>
              <div className="font-medium text-[var(--fg)] text-lg px-3 py-2 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
                {user?.email || 'Usuário desconhecido'}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} /> Status da Conta
              </label>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Ativa & Protegida
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <h3 className="text-sm font-bold text-red-500 mb-3">Zona de Perigo</h3>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogOut size={18} />
                <span>Encerrar Sessão (Sair)</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
