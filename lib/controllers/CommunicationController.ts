/**
 * Unified Communication Controller
 * 統一通訊控制器 - 整合所有通訊功能的 API 端點
 * 
 * Features:
 * - Single controller for announcements, messages, reminders
 * - Consistent response format
 * - Role-based access control
 * - Optimized database queries
 * - Unified caching strategy
 */

import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  Communication,
  CommunicationType,
  CommunicationTypes,
  CommunicationFilters,
  CreateCommunicationData,
  UpdateCommunicationData,
  CommunicationListResponse,
  CommunicationStats,
  CommunicationUtils,
  communicationFiltersSchema,
  createCommunicationSchema,
  updateCommunicationSchema
} from '@/lib/models/communication'

// Initialize Prisma client (use shared instance)
const prisma = new PrismaClient()

// 📋 API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface ApiErrorResponse extends ApiResponse {
  success: false
  error: string
  details?: any
}

export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  success: true
  data: T
}

// 🎯 Communication Controller Class
export class CommunicationController {
  
  /**
   * List Communications with filtering and pagination
   * GET /api/v1/communications
   */
  static async list(
    request: NextRequest,
    userRole: string,
    userId?: string
  ): Promise<ApiResponse<CommunicationListResponse>> {
    try {
      const { searchParams } = new URL(request.url)
      
      // Parse and validate filters
      const rawFilters = Object.fromEntries(searchParams.entries())
      const filters = communicationFiltersSchema.parse({
        ...rawFilters,
        page: rawFilters.page ? parseInt(rawFilters.page) : undefined,
        limit: rawFilters.limit ? parseInt(rawFilters.limit) : undefined
      })
      
      // Build where clause
      const whereClause: any = {}
      
      // Type filter
      if (filters.type) {
        whereClause.type = filters.type
      }
      
      // Source group filter
      if (filters.sourceGroup) {
        whereClause.sourceGroup = filters.sourceGroup
      }
      
      // Board type filter
      if (filters.boardType) {
        whereClause.boardType = filters.boardType
      }
      
      // Status filter (role-based)
      if (filters.status) {
        whereClause.status = filters.status
      } else {
        // Default status filtering based on role
        if (userRole === 'viewer') {
          whereClause.status = 'published'
        } else if (userRole === 'office_member') {
          whereClause.status = { not: 'draft' }
        }
        // Admin sees all statuses
      }
      
      // Priority filter
      if (filters.priority) {
        whereClause.priority = filters.priority
      }
      
      // Flag filters
      if (filters.isPinned !== undefined) {
        whereClause.isPinned = filters.isPinned
      }
      
      if (filters.isImportant !== undefined) {
        whereClause.isImportant = filters.isImportant
      }
      
      if (filters.isFeatured !== undefined) {
        whereClause.isFeatured = filters.isFeatured
      }
      
      // Author filter
      if (filters.authorId) {
        whereClause.authorId = filters.authorId
      }
      
      // Search filter (full-text search)
      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
          { summary: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
      
      // Target audience filter (role-based)
      if (userRole === 'viewer') {
        whereClause.targetAudience = { in: ['all', 'teachers'] }
      }
      
      // Calculate offset
      const offset = (filters.page - 1) * filters.limit
      
      // Execute queries in parallel
      const [communications, total] = await Promise.all([
        prisma.communication.findMany({
          where: whereClause,
          include: {
            author: {
              select: {
                id: true,
                email: true,
                displayName: true,
                firstName: true,
                lastName: true
              }
            },
            replies: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              include: {
                author: {
                  select: {
                    id: true,
                    email: true,
                    displayName: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            _count: {
              select: { replies: true }
            }
          },
          orderBy: [
            { isPinned: 'desc' },
            { isImportant: 'desc' },
            { [filters.sortBy]: filters.sortOrder }
          ],
          skip: offset,
          take: filters.limit
        }),
        
        prisma.communication.count({ where: whereClause })
      ])
      
      // Generate statistics
      const stats = await CommunicationController.generateStats(whereClause)
      
      // Format response
      const response: CommunicationListResponse = {
        communications: communications as Communication[],
        stats,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
          hasNext: filters.page < Math.ceil(total / filters.limit),
          hasPrev: filters.page > 1
        }
      }
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('CommunicationController.list error:', error)
      return {
        success: false,
        error: 'Failed to fetch communications',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Get Single Communication by ID
   * GET /api/v1/communications/[id]
   */
  static async getById(
    id: string,
    userRole: string,
    userId?: string
  ): Promise<ApiResponse<Communication>> {
    try {
      const communicationId = parseInt(id)
      if (isNaN(communicationId)) {
        return {
          success: false,
          error: 'Invalid communication ID',
          timestamp: new Date().toISOString()
        }
      }
      
      const communication = await prisma.communication.findUnique({
        where: { id: communicationId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              displayName: true,
              firstName: true,
              lastName: true
            }
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  displayName: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })
      
      if (!communication) {
        return {
          success: false,
          error: 'Communication not found',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check visibility permissions
      if (!CommunicationUtils.isVisibleToRole(communication as Communication, userRole)) {
        return {
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        }
      }
      
      // Increment view count (async, don't wait)
      prisma.communication.update({
        where: { id: communicationId },
        data: { viewCount: { increment: 1 } }
      }).catch(error => console.error('Failed to increment view count:', error))
      
      return {
        success: true,
        data: communication as Communication,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('CommunicationController.getById error:', error)
      return {
        success: false,
        error: 'Failed to fetch communication',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Create New Communication
   * POST /api/v1/communications
   */
  static async create(
    request: NextRequest,
    userRole: string,
    userId: string
  ): Promise<ApiResponse<Communication>> {
    try {
      // Check permissions
      if (!['admin', 'office_member'].includes(userRole)) {
        return {
          success: false,
          error: 'Insufficient permissions to create communication',
          timestamp: new Date().toISOString()
        }
      }
      
      // Parse and validate request body
      const body = await request.json()
      const data = createCommunicationSchema.parse({
        ...body,
        authorId: userId
      })
      
      // Create communication
      const communication = await prisma.communication.create({
        data: {
          ...data,
          publishedAt: data.status === 'published' ? new Date() : undefined
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              displayName: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
      
      return {
        success: true,
        data: communication as Communication,
        message: 'Communication created successfully',
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('CommunicationController.create error:', error)
      return {
        success: false,
        error: 'Failed to create communication',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Update Communication
   * PUT /api/v1/communications/[id]
   */
  static async update(
    id: string,
    request: NextRequest,
    userRole: string,
    userId: string
  ): Promise<ApiResponse<Communication>> {
    try {
      const communicationId = parseInt(id)
      if (isNaN(communicationId)) {
        return {
          success: false,
          error: 'Invalid communication ID',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check permissions
      if (!['admin', 'office_member'].includes(userRole)) {
        return {
          success: false,
          error: 'Insufficient permissions to update communication',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check if communication exists
      const existing = await prisma.communication.findUnique({
        where: { id: communicationId }
      })
      
      if (!existing) {
        return {
          success: false,
          error: 'Communication not found',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check ownership (non-admin can only edit their own)
      if (userRole !== 'admin' && existing.authorId !== userId) {
        return {
          success: false,
          error: 'Can only edit your own communications',
          timestamp: new Date().toISOString()
        }
      }
      
      // Parse and validate request body
      const body = await request.json()
      const data = updateCommunicationSchema.parse(body)
      
      // Handle status change to published
      const updateData: any = { ...data }
      if (data.status === 'published' && existing.status !== 'published') {
        updateData.publishedAt = new Date()
      }
      
      // Update communication
      const communication = await prisma.communication.update({
        where: { id: communicationId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              displayName: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
      
      return {
        success: true,
        data: communication as Communication,
        message: 'Communication updated successfully',
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('CommunicationController.update error:', error)
      return {
        success: false,
        error: 'Failed to update communication',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Delete Communication
   * DELETE /api/v1/communications/[id]
   */
  static async delete(
    id: string,
    userRole: string,
    userId: string
  ): Promise<ApiResponse<{ id: number }>> {
    try {
      const communicationId = parseInt(id)
      if (isNaN(communicationId)) {
        return {
          success: false,
          error: 'Invalid communication ID',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check permissions (only admin can delete)
      if (userRole !== 'admin') {
        return {
          success: false,
          error: 'Only administrators can delete communications',
          timestamp: new Date().toISOString()
        }
      }
      
      // Check if communication exists
      const existing = await prisma.communication.findUnique({
        where: { id: communicationId }
      })
      
      if (!existing) {
        return {
          success: false,
          error: 'Communication not found',
          timestamp: new Date().toISOString()
        }
      }
      
      // Delete communication (cascade will handle replies)
      await prisma.communication.delete({
        where: { id: communicationId }
      })
      
      return {
        success: true,
        data: { id: communicationId },
        message: 'Communication deleted successfully',
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('CommunicationController.delete error:', error)
      return {
        success: false,
        error: 'Failed to delete communication',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Generate Statistics
   * Private helper method
   */
  private static async generateStats(whereClause: any): Promise<CommunicationStats> {
    try {
      const [
        total,
        byType,
        byStatus,
        byPriority,
        pinnedCount,
        importantCount,
        featuredCount
      ] = await Promise.all([
        prisma.communication.count({ where: whereClause }),
        
        prisma.communication.groupBy({
          by: ['type'],
          where: whereClause,
          _count: true
        }),
        
        prisma.communication.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true
        }),
        
        prisma.communication.groupBy({
          by: ['priority'],
          where: whereClause,
          _count: true
        }),
        
        prisma.communication.count({
          where: { ...whereClause, isPinned: true }
        }),
        
        prisma.communication.count({
          where: { ...whereClause, isImportant: true }
        }),
        
        prisma.communication.count({
          where: { ...whereClause, isFeatured: true }
        })
      ])
      
      return {
        total,
        byType: Object.fromEntries(
          Object.values(CommunicationTypes).map(type => [
            type,
            byType.find(item => item.type === type)?._count || 0
          ])
        ) as Record<CommunicationType, number>,
        
        byStatus: Object.fromEntries(
          ['draft', 'published', 'archived', 'closed'].map(status => [
            status,
            byStatus.find(item => item.status === status)?._count || 0
          ])
        ) as any,
        
        byPriority: Object.fromEntries(
          ['low', 'medium', 'high'].map(priority => [
            priority,
            byPriority.find(item => item.priority === priority)?._count || 0
          ])
        ) as any,
        
        pinned: pinnedCount,
        important: importantCount,
        featured: featuredCount
      }
      
    } catch (error) {
      console.error('Failed to generate stats:', error)
      // Return default stats on error
      return {
        total: 0,
        byType: Object.fromEntries(
          Object.values(CommunicationTypes).map(type => [type, 0])
        ) as Record<CommunicationType, number>,
        byStatus: { draft: 0, published: 0, archived: 0, closed: 0 } as any,
        byPriority: { low: 0, medium: 0, high: 0 } as any,
        pinned: 0,
        important: 0,
        featured: 0
      }
    }
  }
}

export default CommunicationController