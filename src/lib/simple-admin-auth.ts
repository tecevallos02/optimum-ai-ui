import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

const ADMIN_SESSION_COOKIE = 'admin-session';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'admin-secret-key';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function createAdminSession(adminUser: AdminUser): Promise<string> {
  const sessionData = {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    timestamp: Date.now()
  };
  
  // Create a simple session token (in production, use proper JWT)
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  
  return sessionToken;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    // Check if session is expired (24 hours)
    if (Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return {
      id: sessionData.id,
      email: sessionData.email,
      name: sessionData.name
    };
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!adminUser) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    
    if (!isValidPassword) {
      return null;
    }
    
    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name || 'Admin User'
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

export async function setAdminSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
