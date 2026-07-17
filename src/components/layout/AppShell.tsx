"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

const NO_SHELL_PATHS = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const showShell = !NO_SHELL_PATHS.includes(pathname);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!showShell) {
    return <>{children}</>;
  }

  if (!user) {
    // Auth guard will redirect — show nothing
    return null;
  }

  return (
    <>
      <Sidebar />
      <div className="ml-60 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
