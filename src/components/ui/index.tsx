'use client';
import { ReactNode } from 'react';

// Score pill
export function ScorePill({ score }: { score: number }) {
  const tier = score >= 80 ? 'green' : score >= 40 ? 'amber' : 'red';
  const cls = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
  }[tier];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{score}</span>;
}

// Status badge
export function Badge({ label, variant = 'default' }: { label: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const cls = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }[variant];
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>{label}</span>;
}

// Metric card
export function MetricCard({ label, value, delta, deltaUp }: { label: string; value: string | number; delta?: string; deltaUp?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {delta && (
        <div className={`text-xs mt-1 ${deltaUp ? 'text-green-600' : 'text-gray-400'}`}>{delta}</div>
      )}
    </div>
  );
}

// Card
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>{children}</div>
  );
}

// Page header
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}

// Button
export function Button({
  children, onClick, variant = 'secondary', size = 'md', disabled = false, className = '', type = 'button',
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md'; disabled?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
    ghost: 'text-gray-600 hover:bg-gray-100 border border-transparent',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// Loading spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className={`${s} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
