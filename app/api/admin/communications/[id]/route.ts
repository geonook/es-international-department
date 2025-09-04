import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Individual Communication API
 * GET /api/admin/communications/[id] - Get single communication
 * PUT /api/admin/communications/[id] - Update communication
 * DELETE /api/admin/communications/[id] - Delete communication
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communication = await prisma.communication.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!communication) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(communication);
  } catch (error) {
    console.error('Error fetching communication:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content, type, priority, targetAudience, sourceGroup, isImportant, isPinned } = body;

    // Check if communication exists
    const existing = await prisma.communication.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['announcement', 'message', 'message_board', 'reminder', 'newsletter'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const updatedCommunication = await prisma.communication.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(content && { content: content.trim() }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(targetAudience && { targetAudience }),
        ...(sourceGroup !== undefined && { sourceGroup }),
        ...(isImportant !== undefined && { isImportant }),
        ...(isPinned !== undefined && { isPinned })
      }
    });

    return NextResponse.json(updatedCommunication);
  } catch (error) {
    console.error('Error updating communication:', error);
    return NextResponse.json(
      { error: 'Failed to update communication' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if communication exists
    const existing = await prisma.communication.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    await prisma.communication.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    console.error('Error deleting communication:', error);
    return NextResponse.json(
      { error: 'Failed to delete communication' },
      { status: 500 }
    );
  }
}