import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, format = 'svg' } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'PlantUML code is required' }, { status: 400 });
    }

    // Import PlantUML services dynamically to avoid SSR issues
    const PlantUMLRenderer = (await import('../../../src/services/plantuml-renderer.js')).default;
    const renderer = new PlantUMLRenderer();
    
    const result = await renderer.renderFromCode(code, format);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PlantUML render error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Rendering failed' 
    }, { status: 500 });
  }
}
