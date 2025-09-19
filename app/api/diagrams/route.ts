import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublic = searchParams.get('public') === 'true';
    
    let userDiagrams = storage.diagrams;
    
    if (session?.user?.id) {
      userDiagrams = storage.findDiagramsByOwner(session.user.id);
    } else if (isPublic) {
      userDiagrams = storage.diagrams.filter(d => d.isPublic);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDiagrams = userDiagrams.slice(startIndex, endIndex);
    
    return NextResponse.json({ 
      diagrams: paginatedDiagrams,
      total: userDiagrams.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Get diagrams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, description, content, type, isPublic, thumbnail } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const diagram = storage.createDiagram({
      title,
      description: description || '',
      content,
      type: type || 'mermaid',
      isPublic: isPublic || false,
      ownerId: session.user.id,
      thumbnail: thumbnail || undefined
    });
    
    return NextResponse.json({ diagram }, { status: 201 });
  } catch (error) {
    console.error('Create diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
