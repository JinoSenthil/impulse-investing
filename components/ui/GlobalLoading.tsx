'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

export default function GlobalLoading() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Theme-aware colors
  const accentColor = isLight ? 'text-accent-teal' : 'text-accent-gold';
  const borderAccent = isLight ? 'border-accent-teal' : 'border-accent-gold';
  const borderMuted = isLight ? 'border-accent-teal/20' : 'border-accent-gold/20';
  const glowColor = isLight ? 'bg-accent-teal/20' : 'bg-accent-gold/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-bg-card border border-border px-10 py-8 shadow-2xl">

        {/* Glow */}
        <div className={`pointer-events-none absolute -z-10 h-28 w-28 rounded-full ${glowColor} blur-3xl animate-pulse`} />

        {/* Spinner */}
        <div className="relative">
          <div className={`h-12 w-12 rounded-full border-[3px] ${borderMuted}`} />
          <div className={`absolute inset-0 h-12 w-12 animate-spin rounded-full border-[3px] ${borderAccent} border-t-transparent`} />
        </div>

        {/* Text */}
        <p className={`text-sm font-bold ${accentColor} tracking-wider uppercase`}>
          Loading...
        </p>
      </div>
    </div>
  )
}
