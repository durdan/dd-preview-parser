import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'PlantUML code is required' }, { status: 400 });
    }

    // Simple PlantUML validation - check for basic syntax
    const trimmedCode = code.trim();
    const hasStartTag = /@startuml/i.test(trimmedCode);
    const hasEndTag = /@enduml/i.test(trimmedCode);
    
    // Basic validation
    const valid = hasStartTag && hasEndTag && trimmedCode.length > 20;
    
    return NextResponse.json({
      valid,
      parsed: null,
      errors: valid ? [] : ['Invalid PlantUML syntax - missing @startuml/@enduml tags or too short']
    });
  } catch (error) {
    console.error('PlantUML validation error:', error);
    return NextResponse.json({ 
      valid: false,
      parsed: null,
      errors: [error instanceof Error ? error.message : 'Validation failed']
    }, { status: 500 });
  }
}
