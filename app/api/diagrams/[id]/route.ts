import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const diagramId = params.id;
    
    const diagram = storage.findDiagramById(diagramId);
    
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
    
    const diagramId = params.id;
    const diagram = storage.findDiagramById(diagramId);
    
    if (!diagram) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    // Check if user owns this diagram
    if (diagram.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { title, description, content, type, isPublic, thumbnail } = await request.json();
    
    // Update diagram
    const updatedDiagram = storage.updateDiagram(diagramId, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(content && { content }),
      ...(type && { type }),
      ...(isPublic !== undefined && { isPublic }),
      ...(thumbnail && { thumbnail })
    });
    
    return NextResponse.json({ diagram: updatedDiagram });
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
    
    const diagramId = params.id;
    const diagram = storage.findDiagramById(diagramId);
    
    if (!diagram) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    // Check if user owns this diagram
    if (diagram.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deleted = storage.deleteDiagram(diagramId);
    
    return NextResponse.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
