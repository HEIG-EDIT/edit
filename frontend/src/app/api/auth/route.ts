import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();
    const { action, email, password, confirmPassword } = body;

    if (!action || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (action === 'login') {
        // Dummy login logic (replace with real auth later)
        console.log('Logging in user:', email);
        return NextResponse.json({ message: 'User logged in (stub)' });
    }

    if (action === 'register') {
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }
        // Dummy registration logic (replace with real DB call)
        console.log('Registering user:', email);
        return NextResponse.json({ message: 'User registered (stub)' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
