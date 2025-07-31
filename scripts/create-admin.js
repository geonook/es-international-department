/**
 * Create Admin User Script
 * 建立管理員使用者腳本
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('開始建立管理員使用者...')

    // 檢查是否已存在管理員角色
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    })

    if (!adminRole) {
      console.log('建立管理員角色...')
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          displayName: '系統管理員',
          description: '系統管理員'
        }
      })
    }

    // 檢查是否需要建立教師角色
    let teacherRole = await prisma.role.findUnique({
      where: { name: 'teacher' }
    })

    if (!teacherRole) {
      console.log('建立教師角色...')
      teacherRole = await prisma.role.create({
        data: {
          name: 'teacher',
          displayName: '教師',
          description: '教師'
        }
      })
    }

    // 檢查是否已存在管理員使用者
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@es-international.com' }
    })

    if (existingAdmin) {
      console.log('管理員使用者已存在，跳過建立步驟')
      return
    }

    // 建立管理員使用者
    console.log('建立管理員使用者...')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@es-international.com',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        displayName: '系統管理員',
        isActive: true,
        userRoles: {
          create: {
            role: {
              connect: { id: adminRole.id }
            }
          }
        }
      }
    })

    console.log('✅ 管理員使用者建立成功！')
    console.log('📧 電子郵件: admin@es-international.com')
    console.log('🔑 密碼: admin123')
    console.log('⚠️  請盡快變更預設密碼！')

  } catch (error) {
    console.error('❌ 建立管理員使用者時發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()