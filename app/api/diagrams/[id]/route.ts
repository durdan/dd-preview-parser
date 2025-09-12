import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// For now, we'll use in-memory storage since MongoDB models aren't set up yet
let diagrams: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const diagramId = parseInt(params.id);
    
    const diagram = diagrams.find(d => d.id === diagramId);
    
    if (!diagram) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    // Check if user can access this diagram
    if (!diagram.isPublic && diagram.ownerId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ diagram });
  } catch (error) {
    console.error('Get diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const diagramId = parseInt(params.id);
    const diagramIndex = diagrams.findIndex(d => d.id === diagramId);
    
    if (diagramIndex === -1) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    const diagram = diagrams[diagramIndex];
    
    // Check if user owns this diagram
    if (diagram.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { title, description, content, type, isPublic } = await request.json();
    
    // Update diagram
    diagrams[diagramIndex] = {
      ...diagram,
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(content && { content }),
      ...(type && { type }),
      ...(isPublic !== undefined && { isPublic }),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ diagram: diagrams[diagramIndex] });
  } catch (error) {
    console.error('Update diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const diagramId = parseInt(params.id);
    const diagramIndex = diagrams.findIndex(d => d.id === diagramId);
    
    if (diagramIndex === -1) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    const diagram = diagrams[diagramIndex];
    
    // Check if user owns this diagram
    if (diagram.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    diagrams.splice(diagramIndex, 1);
    
    return NextResponse.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
