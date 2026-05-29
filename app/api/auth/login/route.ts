import { NextRequest, NextResponse } from 'next/server';

// Mock users for demo (replace with Supabase query after database setup)
const MOCK_USERS = [
  {
    id: '1',
    name: 'Hamdi',
    email: 'sokare5564@nuitx.com',
    pin: '1234',
    role: 'Admin',
  },
  {
    id: '2',
    name: 'Hadeer',
    email: 'hadeer@ew-tc.com',
    pin: '2345',
    role: 'MediaBuyer',
  },
  {
    id: '3',
    name: 'Bakr',
    email: 'bakr@ew-tc.com',
    pin: '3456',
    role: 'Creator',
  },
  {
    id: '4',
    name: 'Asmaa',
    email: 'asmaa@ew-tc.com',
    pin: '4567',
    role: 'Creator',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    // Find user in mock data
    const user = MOCK_USERS.find((u) => u.email === email && u.pin === pin);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
