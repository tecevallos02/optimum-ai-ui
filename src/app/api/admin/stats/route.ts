import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total clients
    const totalClients = await prisma.company.count();
    
    // Get active clients (companies with at least one user)
    const activeClients = await prisma.company.count({
      where: {
        users: {
          some: {}
        }
      }
    });
    
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get total calls (from Google Sheets data - this would need to be calculated)
    // For now, we'll use a placeholder
    const totalCalls = 0;
    
    // Get recent activity (placeholder for now)
    const recentActivity = [
      {
        id: '1',
        action: 'Client added',
        client: 'P&J Air Conditioning',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        action: 'User created',
        client: 'Tech Solutions LLC',
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        action: 'Webhook tested',
        client: 'Acme Corporation',
        timestamp: '6 hours ago'
      }
    ];

    return NextResponse.json({
      totalClients,
      activeClients,
      totalUsers,
      totalCalls,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
