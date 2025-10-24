import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/simple-admin-auth';

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminSession();
    
    if (!adminUser) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: adminUser
    });
    
  } catch (error) {
    console.error('❌ Admin session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
