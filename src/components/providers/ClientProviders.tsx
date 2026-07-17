"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { RiskDataProvider } from "@/contexts/RiskDataContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RiskDataProvider>
        {children}
      </RiskDataProvider>
    </AuthProvider>
  );
}
