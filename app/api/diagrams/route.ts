import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongodb';

// For now, we'll use in-memory storage since MongoDB models aren't set up yet
let diagrams: any[] = [];
let nextId = 1;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublic = searchParams.get('public') === 'true';
    
    let userDiagrams = diagrams;
    
    if (session?.user?.id) {
      userDiagrams = diagrams.filter(d => d.ownerId === session.user.id);
    } else if (isPublic) {
      userDiagrams = diagrams.filter(d => d.isPublic);
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
    
    const { title, description, content, type, isPublic } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const diagram = {
      id: nextId++,
      title,
      description: description || '',
      content,
      type: type || 'mermaid',
      isPublic: isPublic || false,
      ownerId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    diagrams.push(diagram);
    
    return NextResponse.json({ diagram }, { status: 201 });
  } catch (error) {
    console.error('Create diagram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
