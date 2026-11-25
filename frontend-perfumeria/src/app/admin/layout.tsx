import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Admin · Control Multisede & Catálogo",
  description: "Panel de administración privado para gestión de catálogo, inventario y sucursales.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0C0B0A] text-[#F5EFEB]">
      {children}
    </div>
  );
}

