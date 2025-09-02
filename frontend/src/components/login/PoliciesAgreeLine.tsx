"use client";

import React, { JSX, useState } from "react";
import { PolicyModal } from "@/components/login/PolicyModal";
import { TermsContent } from "@/components/login/TermsContent";
import { PrivacyContent } from "@/components/login/PrivacyContent";

/**
 * Self-contained UI line that shows:
 *  "By creating an account, you agree to our Terms & Conditions and Privacy Policy."
 * Clicking each link opens a small modal popup.
 *
 * No external state required; safe to drop anywhere.
 */
export function PoliciesAgreeLine(): JSX.Element {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <p className="text-xs text-violet-200">
        By creating an account, you agree to our{" "}
        <button
          type="button"
          onClick={() => setShowTerms(true)}
          className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
        >
          Terms &amp; Conditions
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
        >
          Privacy Policy
        </button>
        .
      </p>

      <PolicyModal
        open={showTerms}
        title="Terms and Conditions"
        onClose={() => setShowTerms(false)}
      >
        <TermsContent />
      </PolicyModal>

      <PolicyModal
        open={showPrivacy}
        title="Privacy Policy"
        onClose={() => setShowPrivacy(false)}
      >
        <PrivacyContent />
      </PolicyModal>
    </>
  );
}
