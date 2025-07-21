'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        console.log(data); // Handle redirect or error
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
                    <button
                        type="submit"
                        className="w-full bg-violet-500 text-white py-2 rounded-md hover:bg-violet-800"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <button
                        onClick={() => router.push('/pwrecovery')}
                        className="text-blue-600 hover:underline block"
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className="my-6 flex items-center gap-2">
                    <div className="flex-grow border-t" />
                    <span className="text-xs text-gray-500">or login using</span>
                    <div className="flex-grow border-t" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button className="w-full py-2 border rounded hover:bg-gray-100">Google</button>
                    <button className="w-full py-2 border rounded hover:bg-gray-100">LinkedIn</button>
                    <button className="w-full py-2 border rounded hover:bg-gray-100">X</button>
                    <button className="w-full py-2 border rounded hover:bg-gray-100">Microsoft</button>
                </div>

                <div className="text-center text-sm">
                    --- or ---
                    <br />
                    <button
                        onClick={() => router.push('/register')}
                        className="text-blue-600 hover:underline"
                    >
                        Register using Email
                    </button>
                </div>
            </div>
        </div>
    );
}
