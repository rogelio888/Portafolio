"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DemoAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem("vetcontrol_user");
      if (!user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-medium">
        Cargando sesión demo...
      </div>
    );
  }

  return <>{children}</>;
}
