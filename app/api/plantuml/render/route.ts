import { NextRequest, NextResponse } from 'next/server';
import plantumlEncoder from 'plantuml-encoder';

export async function POST(request: NextRequest) {
  try {
    const { code, format = 'svg' } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'PlantUML code is required' }, { status: 400 });
    }

    // Simple PlantUML rendering using plantuml-encoder
    const encoded = plantumlEncoder.encode(code);
    const serverUrl = 'http://www.plantuml.com/plantuml';
    const diagramUrl = `${serverUrl}/${format}/${encoded}`;
    
    // For now, return the URL - in production you might want to fetch and return the actual SVG
    return NextResponse.json({
      url: diagramUrl,
      encoded,
      format,
      serverUrl
    });
  } catch (error) {
    console.error('PlantUML render error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Rendering failed' 
    }, { status: 500 });
  }
}
