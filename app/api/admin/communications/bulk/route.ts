import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Bulk Communications Operations API
 * POST /api/admin/communications/bulk - Handle bulk operations on communications
 * 
 * Supports operations: delete, publish, archive, update_priority
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, announcementIds, targetStatus } = body;

    // Validate required fields
    if (!action || !announcementIds || !Array.isArray(announcementIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, announcementIds' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['delete', 'publish', 'archive', 'draft', 'update_priority'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const results = {
      success: [] as number[],
      failed: [] as { id: number; error: string }[]
    };

    for (const id of announcementIds) {
      totalProcessed++;
      
      try {
        switch (action) {
          case 'delete':
            await prisma.communication.delete({
              where: { id: parseInt(id) }
            });
            break;
            
          case 'publish':
            await prisma.communication.update({
              where: { id: parseInt(id) },
              data: { 
                status: 'published',
                publishedAt: new Date()
              }
            });
            break;
            
          case 'archive':
            await prisma.communication.update({
              where: { id: parseInt(id) },
              data: { status: 'archived' }
            });
            break;
            
          case 'draft':
            await prisma.communication.update({
              where: { id: parseInt(id) },
              data: { 
                status: 'draft',
                publishedAt: null
              }
            });
            break;
            
          case 'update_priority':
            if (!targetStatus) {
              throw new Error('targetStatus is required for update_priority action');
            }
            await prisma.communication.update({
              where: { id: parseInt(id) },
              data: { priority: targetStatus }
            });
            break;
        }
        
        totalSuccess++;
        results.success.push(parseInt(id));
        
      } catch (error) {
        totalFailed++;
        results.failed.push({
          id: parseInt(id),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed,
        totalSuccess,
        totalFailed,
        results
      },
      message: `Bulk operation completed. ${totalSuccess}/${totalProcessed} items processed successfully.`
    });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}