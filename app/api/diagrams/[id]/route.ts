import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const DiagramUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const diagram = await prisma.diagram.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!diagram) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    return NextResponse.json(diagram)
  } catch (error) {
    console.error('Error fetching diagram:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = DiagramUpdateSchema.parse(body)

    const diagram = await prisma.diagram.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: validatedData,
    })

    if (diagram.count === 0) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    const updatedDiagram = await prisma.diagram.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json(updatedDiagram)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating diagram:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.diagram.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Diagram deleted successfully' })
  } catch (error) {
    console.error('Error deleting diagram:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}