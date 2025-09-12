import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'PlantUML code is required' }, { status: 400 });
    }

    // Import PlantUML services dynamically to avoid SSR issues
    const PlantUMLRenderer = (await import('../../../src/services/plantuml-renderer.js')).default;
    const renderer = new PlantUMLRenderer();
    
    const result = await renderer.validateSyntax(code);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PlantUML validation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Validation failed' 
    }, { status: 500 });
  }
}
