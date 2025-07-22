/*'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    const [submissionTriggered, setSubmissionTriggered] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async () => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setMessage('✅ A confirmation email has been sent to your address.');
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setConsentGiven(false);
            setSubmissionTriggered(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowConsentModal(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                {message && (
                    <p className="mb-4 text-center text-green-600 text-sm font-medium">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mb-4 text-center text-red-600 text-sm font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border rounded"
                        required
                    />

                    <p className="text-sm">
                        By continuing, you agree to our{' '}
                        <button
                            type="button"
                            onClick={() => setShowConsentModal(true)}
                            className="text-blue-600 underline"
                        >
                            Terms and Conditions
                        </button>
                    </p>

                    <button
                        type="submit"
                        className="w-full bg-violet-500 text-white py-2 rounded-md hover:bg-violet-800"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </p>

                {/* Consent Modal *//*}
                {showConsentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow max-w-md w-full">
                            <h3 className="text-lg font-bold mb-4">Consent Form</h3>
                            <div className="h-48 overflow-y-scroll text-sm border p-2 mb-4">
                                <p>
                                    Welcome to our platform. By registering, you agree to the collection
                                    and processing of your personal data in accordance with our Privacy Policy,
                                    and to abide by the community rules, terms of use, and platform responsibilities.
                                </p>
                                <p className="mt-2">
                                    You agree not to misuse the platform, attempt unauthorized access, or
                                    violate other users' rights. Your data may be used to improve the service
                                    and may be stored securely within our infrastructure.
                                </p>
                                <p className="mt-2">
                                    For more details, see our full Privacy Policy. You must agree to proceed.
                                </p>
                            </div>

                            <label className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                />
                                <span>I agree to the Terms and Conditions</span>
                            </label>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowConsentModal(false);
                                        setConsentGiven(false);
                                    }}
                                    className="text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (consentGiven) {
                                            setShowConsentModal(false);
                                            handleFormSubmit();
                                        }
                                    }}
                                    disabled={!consentGiven}
                                    className={`px-4 py-2 rounded text-white ${
                                        consentGiven
                                            ? 'bg-violet-500 hover:bg-violet-700'
                                            : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    I Agree & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}*/
