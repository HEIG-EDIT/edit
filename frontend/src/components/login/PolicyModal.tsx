"use client";

import React from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Simple, reusable centered modal with backdrop. */
export function PolicyModal({ open, title, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-gray-700 border border-violet-400 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-400/50">
          <h2 className="text-lg font-semibold text-violet-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 hover:bg-gray-600 text-violet-100"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-4 text-violet-100 text-sm leading-6">
          {children}
        </div>
        <div className="px-4 py-3 border-t border-violet-400/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-violet-400 text-gray-900 px-4 py-2 font-semibold border-2 border-violet-500 hover:bg-violet-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
