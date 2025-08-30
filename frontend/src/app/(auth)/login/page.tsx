"use client";

import { LoginPanel } from "@/components/login/LoginPanel";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <LoginPanel />
      </div>
    </main>
  );
}
