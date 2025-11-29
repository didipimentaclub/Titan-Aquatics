import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Chrome, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const getFriendlyErrorMessage = (errorMsg: string) => {
  const msg = errorMsg.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado.';
  if (msg.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
  if (msg.includes('email not confirmed')) return 'Por favor, confirme seu e-mail antes de entrar.';
  if (msg.includes('too many requests') || msg.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco.';
  return 'Ocorreu um erro ao processar. Tente novamente.';
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Verifique seu e-mail para confirmar a conta!');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={loading 
              ? { 
                  scale: 1, 
                  y: 0,
                  boxShadow: [
                    "0 25px 50px -12px rgba(79, 183, 179, 0.2)", 
                    "0 0 40px rgba(79, 183, 179, 0.5)", 
                    "0 25px 50px -12px rgba(79, 183, 179, 0.2)"
                  ],
                  borderColor: [
                    "rgba(255, 255, 255, 0.1)",
                    "rgba(79, 183, 179, 0.6)",
                    "rgba(255, 255, 255, 0.1)"
                  ]
                } 
              : { 
                  scale: 1, 
                  y: 0,
                  boxShadow: "0 25px 50px -12px rgba(79, 183, 179, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.1)"
                }
            }
            transition={{ 
              duration: loading ? 1.5 : 0.3, 
              repeat: loading ? Infinity : 0,
              ease: "easeInOut"
            }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1b3b]/90 border p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4fb7b3]/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#637ab9]/20 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <h2 className="text-3xl font-heading font-bold text-white mb-2">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Junte-se ao Titan'}
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {mode === 'login' ? 'Acesse seu dashboard aquático.' : 'Comece a gerenciar seu tanque com precisão de IA.'}
              </p>

              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#a8fbd3] transition-colors mb-6 disabled:opacity-50"
              >
                <Chrome size={16} /> Entrar com Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-white/30 uppercase tracking-widest">Ou</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#4fb7b3] font-mono uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#4fb7b3] transition-colors text-sm"
                      placeholder="aquarista@titan.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#4fb7b3] font-mono uppercase tracking-widest">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#4fb7b3] transition-colors text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded text-red-200 text-xs"
                  >
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                  {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  {mode === 'login' ? "Não tem uma conta? " : "Já tem uma conta? "}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError(null);
                    }}
                    className="text-white underline underline-offset-4 hover:text-[#4fb7b3] transition-colors"
                  >
                    {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;