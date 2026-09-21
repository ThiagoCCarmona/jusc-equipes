import type { PersonType } from '../types';

export const TYPE_STYLES: Record<PersonType, { bg: string; text: string; border: string; dot: string }> = {
  'Coordenação': { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-500/50', dot: '#8B5CF6' },
  'Integrantes': { bg: 'bg-yellow-950/60', text: 'text-[#FFC700]', border: 'border-[#FFC700]/60', dot: '#FFC700' },
  'Tios': { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-500/50', dot: '#06B6D4' },
  'PJ': { bg: 'bg-pink-950/60', text: 'text-pink-300', border: 'border-pink-500/50', dot: '#EC4899' },
  'Veteranos': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/50', dot: '#F59E0B' },
  'Voluntários': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/50', dot: '#10B981' },
};
