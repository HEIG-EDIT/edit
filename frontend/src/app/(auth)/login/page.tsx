"use client";

import { LoginPanel } from "@/components/login/LoginPanel";
import { useRedirectIfAuthed } from "@/hooks/auth";
import { LoadingComponent } from "@/components/api/loadingComponent";

export default function LoginPage() {
  const checking = useRedirectIfAuthed();

  return (
    <main className="bg-gray-900 min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-gray-600 rounded-2xl border border-violet-300 p-6 shadow">
          {checking ? (
            <div className="flex items-center justify-center p-8">
              <LoadingComponent />
            </div>
          ) : (
            <LoginPanel />
          )}
        </div>
      </div>
    </main>
  );
}
