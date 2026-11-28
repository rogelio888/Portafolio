import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'max-w-lg',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="drawer-backdrop fixed inset-0 bg-[#14171A]/35"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`drawer-panel relative z-10 flex h-full w-full ${widthClass} flex-col border-l border-[#D6D6CD] bg-white shadow-[-16px_0_40px_rgba(20,23,26,0.14)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#D6D6CD] bg-[#F8F8F5] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="drawer-title"
              className="font-display text-lg font-bold tracking-tight text-[#14171A]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[#5B636B]">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="btn-press inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D6D6CD] bg-white text-[#434B53] hover:border-[#14171A] hover:text-[#14171A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <div className="border-t border-[#D6D6CD] bg-[#F8F8F5] px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
