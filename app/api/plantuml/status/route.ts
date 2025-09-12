import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import PlantUML services dynamically to avoid SSR issues
    const PlantUMLRenderer = (await import('../../../src/services/plantuml-renderer.js')).default;
    const renderer = new PlantUMLRenderer();
    
    const status = await renderer.getServerStatus();
    
    return NextResponse.json(status);
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
