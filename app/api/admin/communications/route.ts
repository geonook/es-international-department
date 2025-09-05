import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Unified Communications API
 * Handles all communication types: message_board, announcement, reminder
 * POST /api/admin/communications - Create communication
 * GET /api/admin/communications - List communications with filtering
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, content, type, priority, targetAudience, sourceGroup, isImportant, isPinned } = body;

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, type' },
        { status: 400 }
      );
    }

    // Validate communication type - support both old and new types
    const validTypes = ['announcement', 'message', 'message_board', 'reminder', 'newsletter'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const communication = await prisma.communication.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        priority: priority || 'medium',
        targetAudience: targetAudience || 'all',
        sourceGroup: sourceGroup || null,
        isImportant: isImportant || false,
        isPinned: isPinned || false,
        publishedAt: new Date(),
        status: 'published'
      }
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const type = searchParams.get('type');
    const boardType = searchParams.get('boardType'); // 'teachers', 'parents', 'general'
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const isPublic = searchParams.get('isPublic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sync = searchParams.get('sync'); // For Parents' Corner sync

    // Build where clause
    const where: any = {};

    if (type) {
      const types = type.split(',');
      where.type = types.length === 1 ? types[0] : { in: types };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (priority) {
      where.priority = priority;
    }

    if (boardType) {
      where.boardType = boardType;
    }

    if (isPublic !== null) {
      // Map isPublic to targetAudience for backward compatibility
      where.targetAudience = isPublic === 'true' ? { in: ['all', 'parents'] } : 'teachers';
    }

    // Parents' Corner sync - announcements and messages for parents
    if (sync === 'parents-corner') {
      where.AND = [
        { targetAudience: { in: ['parents', 'all'] } },
        { type: { in: ['announcement', 'message', 'message_board'] } },
        { status: 'published' }
      ];
    }

    const communications = await prisma.communication.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        targetAudience: true,
        sourceGroup: true,
        isImportant: true,
        isPinned: true,
        isFeatured: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        authorId: true
      }
    });

    const total = await prisma.communication.count({ where });

    return NextResponse.json({
      success: true,
      data: communications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}