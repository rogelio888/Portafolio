"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileNavContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openNav: () => void;
  closeNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  isOpen: false,
  setIsOpen: () => {},
  openNav: () => {},
  closeNav: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar automáticamente el menú móvil al navegar
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <MobileNavContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openNav: () => setIsOpen(true),
        closeNav: () => setIsOpen(false),
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

export const useMobileNav = () => useContext(MobileNavContext);
