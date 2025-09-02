import React, { JSX } from "react";

export function PrivacyContent(): JSX.Element {
  return (
    <div>
      <p>
        <strong>Effective Date:</strong> [Insert Date]
      </p>
      <p className="mt-2">
        We respect your privacy. This Privacy Policy explains what data we
        collect and how we use it when you use our image editing web
        application.
      </p>

      <h3 className="font-semibold mt-4">1. Information We Collect</h3>
      <ul className="list-disc pl-5">
        <li>Username (required to identify your account)</li>
        <li>
          Email address and password (if you register with email/password)
        </li>
        <li>Projects and images you create or upload on the platform</li>
      </ul>

      <h3 className="font-semibold mt-4">2. How We Use Your Data</h3>
      <ul className="list-disc pl-5">
        <li>Provide access to your projects and tools</li>
        <li>Securely manage your account and sessions</li>
        <li>Store your projects so you can continue working on them later</li>
      </ul>
      <p>
        We do not share your data with any third parties or use it for marketing
        purposes.
      </p>

      <h3 className="font-semibold mt-4">3. Data Storage and Security</h3>
      <p>
        Your data is stored on secured cloud servers (AWS EC2, RDS and S3). We
        use encryption and access control measures to keep your information
        safe. Passwords are encrypted and never stored in plain text.
      </p>

      <h3 className="font-semibold mt-4">4. Your Rights (GDPR)</h3>
      <ul className="list-disc pl-5">
        <li>Access the data we have on you</li>
        <li>Request deletion of your account and all associated data</li>
        <li>Export your data upon request</li>
      </ul>
      <p>
        You can do this by contacting us at [Insert Contact Email] or through
        the &quot;Delete My Account&quot; option in your profile.
      </p>

      <h3 className="font-semibold mt-4">5. Cookies</h3>
      <p>
        We may use session cookies to keep you logged in. These are temporary
        and deleted when you log out or close your browser.
      </p>
    </div>
  );
}
