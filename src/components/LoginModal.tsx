import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique o e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#121420] border-2 border-[#FFC700] rounded-3xl shadow-[0_0_60px_rgba(255,199,0,0.3)] p-6 sm:p-8 overflow-hidden">
        
        {/* Top gold bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC700] via-[#FFE066] to-[#FFC700]" />

        {/* Logo & Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex relative group mx-auto">
            <img 
              src="/assets/logo-jusc.jpg" 
              alt="Logo JUSC" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFC700] shadow-lg mx-auto"
            />
            <img 
              src="/assets/mascote-jusc.png" 
              alt="Mascote JUSC" 
              className="w-8 h-8 object-contain absolute -bottom-1 -right-2 drop-shadow-md"
            />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-[#FFC700]">JUSC</span>
            <span>Autenticação</span>
          </h2>
          <p className="text-xs text-gray-300 font-medium">
            Gestão de Equipes • jusctrabalho.tccodes.com.br
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/60 flex items-start gap-2.5 text-xs text-red-300 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Digite seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] text-black font-extrabold text-sm transition-all shadow-xl shadow-[#FFC700]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
