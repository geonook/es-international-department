/**
 * 臨時腳本：升級用戶角色權限
 * Upgrade user role permissions script
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeUserRole() {
  try {
    console.log('🔄 Starting user role upgrade...')
    
    // 目標用戶 email
    const targetEmail = 'tsehungchen@kcislk.ntpc.edu.tw'
    
    // 1. 查找用戶
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!user) {
      console.log(`❌ User ${targetEmail} not found`)
      return
    }
    
    console.log(`👤 Found user: ${user.displayName} (${user.email})`)
    console.log(`📋 Current roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}`)
    
    // 2. 查找管理員角色
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    })
    
    if (!adminRole) {
      console.log('❌ Admin role not found')
      return
    }
    
    // 3. 檢查是否已經是管理員
    const hasAdminRole = user.userRoles.some(ur => ur.role.name === 'admin')
    
    if (hasAdminRole) {
      console.log('✅ User is already an admin')
      return
    }
    
    // 4. 移除現有角色並添加管理員角色
    await prisma.$transaction(async (tx) => {
      // 移除所有現有角色
      await tx.userRole.deleteMany({
        where: { userId: user.id }
      })
      
      // 添加管理員角色
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
          assignedBy: user.id // Self-assigned by system
        }
      })
    })
    
    console.log('✅ Successfully upgraded user to admin role')
    
    // 5. 驗證結果
    const updatedUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (updatedUser) {
      console.log(`🎉 Updated roles: ${updatedUser.userRoles.map(ur => ur.role.name).join(', ')}`)
    }
    
  } catch (error) {
    console.error('❌ Error upgrading user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行腳本
upgradeUserRole()
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })