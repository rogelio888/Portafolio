"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  Calendar, 
  HeartPulse, 
  ShoppingCart, 
  Menu
} from "lucide-react";
import { useMobileNav } from "@/context/MobileNavContext";

export function BottomNav() {
  const pathname = usePathname();
  const { openNav, isOpen } = useMobileNav();

  const quickItems = [
    { name: "Inicio", href: "/", icon: Activity },
    { name: "Turnos", href: "/turnos", icon: Calendar, badge: "3" },
    { name: "Pacientes", href: "/pacientes", icon: HeartPulse },
    { name: "POS Caja", href: "/pos", icon: ShoppingCart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-1.5 lg:hidden pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
      {quickItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer relative ${
              isActive 
                ? "text-primary font-extrabold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-primary text-white rounded-full text-[9px] font-mono flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5 tracking-tight">{item.name}</span>
          </Link>
        );
      })}

      {/* Botón Menú Completo */}
      <button
        type="button"
        onClick={openNav}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
          isOpen
            ? "text-primary font-extrabold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Ver todos los módulos"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
        <span className="mt-0.5 tracking-tight">Menú</span>
      </button>
    </nav>
  );
}
