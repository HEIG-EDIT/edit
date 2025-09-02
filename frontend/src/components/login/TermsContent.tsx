import React, { JSX } from "react";

export function TermsContent(): JSX.Element {
  return (
    <div>
      <p>
        <strong>Effective Date:</strong> [Insert Date]
      </p>
      <p className="mt-2">
        Welcome to our image editing web application. By creating an account or
        using our platform, you agree to the following terms:
      </p>

      <h3 className="font-semibold mt-4">1. Use of the Service</h3>
      <ul className="list-disc pl-5">
        <li>Create, edit, and save image-based projects</li>
        <li>Access your work using your account</li>
      </ul>
      <p className="mt-2">You agree not to:</p>
      <ul className="list-disc pl-5">
        <li>Use the app for any illegal or harmful purpose</li>
        <li>
          Upload or share offensive or copyrighted material without permission
        </li>
        <li>Attempt to reverse-engineer or attack the service</li>
      </ul>

      <h3 className="font-semibold mt-4">2. Account Management</h3>
      <ul className="list-disc pl-5">
        <li>
          You are responsible for your account and keeping your credentials
          secure
        </li>
        <li>
          You may request deletion of your account and all associated data at
          any time
        </li>
      </ul>

      <h3 className="font-semibold mt-4">3. Age Requirements</h3>
      <p>
        You must be at least 13 years old to use the app, or have the consent of
        a legal guardian.
      </p>

      <h3 className="font-semibold mt-4">4. Availability and Disclaimer</h3>
      <p>
        This app is part of an academic project and may contain bugs or limited
        features. We do not guarantee continuous availability or support, and we
        are not responsible for lost work or downtime.
      </p>
    </div>
  );
}
