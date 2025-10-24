import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, setAdminSessionCookie } from '@/lib/simple-admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('🔐 Admin login attempt:', email);
    
    // Verify credentials
    const adminUser = await verifyAdminCredentials(email, password);
    
    if (!adminUser) {
      console.log('❌ Invalid admin credentials');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('✅ Admin credentials verified:', adminUser.email);
    
    // Create session
    const sessionToken = await createAdminSession(adminUser);
    await setAdminSessionCookie(sessionToken);
    
    console.log('✅ Admin session created');
    
    return NextResponse.json({
      success: true,
      user: adminUser,
      redirect: '/admin'
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
