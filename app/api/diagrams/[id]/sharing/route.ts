import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateShareToken, createShareableUrl } from '@/lib/sharing';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isPublic } = await request.json();
    
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' }, 
        { status: 400 }
      );
    }

    // Verify diagram ownership
    const diagram = await prisma.diagram.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!diagram) {
      return NextResponse.json(
        { error: 'Diagram not found' }, 
        { status: 404 }
      );
    }

    // Update sharing settings
    const updateData: any = {
      isPublic,
      sharedAt: isPublic ? new Date() : null
    };

    // Generate new share token if making public
    if (isPublic && !diagram.shareToken) {
      updateData.shareToken = generateShareToken();
    }

    const updatedDiagram = await prisma.diagram.update({
      where: { id: params.id },
      data: updateData
    });

    const shareUrl = isPublic ? createShareableUrl(params.id) : null;

    return NextResponse.json({
      isPublic: updatedDiagram.isPublic,
      shareUrl
    });

  } catch (error) {
    console.error('Sharing update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}