import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileNavProvider } from "@/context/MobileNavContext";
import { DemoAuthGuard } from "@/components/layout/DemoAuthGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DemoAuthGuard>
      <MobileNavProvider>
        <div className="min-h-full flex flex-1">
          <Suspense fallback={<aside className="hidden lg:flex w-64 border-r border-border bg-card shrink-0" />}>
            <Sidebar />
          </Suspense>

          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-3.5 sm:p-5 lg:p-6 pb-24 lg:pb-6 overflow-y-auto min-w-0">
              {children}
            </main>
            <BottomNav />
          </div>
        </div>
      </MobileNavProvider>
    </DemoAuthGuard>
  );
}
