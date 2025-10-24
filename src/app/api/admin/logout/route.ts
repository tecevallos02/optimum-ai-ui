import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/simple-admin-auth';

export async function POST(request: NextRequest) {
  try {
    await clearAdminSession();
    
    return NextResponse.json({
      success: true,
      redirect: '/admin/login'
    });
    
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
