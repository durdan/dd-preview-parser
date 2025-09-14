import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple PlantUML server status check
    const serverUrl = 'http://www.plantuml.com/plantuml';
    
    // For now, assume the server is healthy
    // In production, you might want to actually ping the server
    return NextResponse.json({
      serverUrl,
      healthy: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PlantUML status error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Status check failed',
      serverUrl: 'http://www.plantuml.com/plantuml',
      healthy: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
