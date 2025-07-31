/**
 * ES International Department Database Seeding Script
 * ES 國際部資料庫種子資料腳本 - Zeabur 多環境支援
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * 預設角色資料
 * Default roles data
 */
const defaultRoles = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'System administrator with full access',
    permissions: ['*'] // Full permissions
  },
  {
    name: 'teacher',
    displayName: 'Teacher',
    description: 'Teaching staff with limited admin access',
    permissions: [
      'announcements:create',
      'announcements:read',
      'announcements:update',
      'events:create',
      'events:read',
      'events:update',
      'resources:create',
      'resources:read',
      'resources:update',
      'newsletters:read',
      'message_board:read',
      'message_board:reply'
    ]
  },
  {
    name: 'parent',
    displayName: 'Parent',
    description: 'Parent with access to student information',
    permissions: [
      'announcements:read',
      'events:read',
      'resources:read',
      'newsletters:read',
      'message_board:read',
      'message_board:reply',
      'feedback:create'
    ]
  }
]

/**
 * 預設年級資料
 * Default grade levels data
 */
const defaultGradeLevels = [
  {
    name: 'Grades 1-2',
    displayName: 'Grades 1-2',
    minGrade: 1,
    maxGrade: 2,
    color: 'from-blue-500 to-blue-600',
    sortOrder: 1
  },
  {
    name: 'Grades 3-4',
    displayName: 'Grades 3-4',
    minGrade: 3,
    maxGrade: 4,
    color: 'from-green-500 to-green-600',
    sortOrder: 2
  },
  {
    name: 'Grades 5-6',
    displayName: 'Grades 5-6',
    minGrade: 5,
    maxGrade: 6,
    color: 'from-purple-500 to-purple-600',
    sortOrder: 3
  }
]

/**
 * 預設資源分類
 * Default resource categories
 */
const defaultResourceCategories = [
  {
    name: 'learning-materials',
    displayName: 'Learning Materials',
    description: 'Educational content and learning resources',
    icon: 'BookOpen',
    color: 'blue',
    sortOrder: 1
  },
  {
    name: 'assignments',
    displayName: 'Assignments',
    description: 'Homework and assignments',
    icon: 'FileText',
    color: 'green',
    sortOrder: 2
  },
  {
    name: 'presentations',
    displayName: 'Presentations',
    description: 'Class presentations and slideshows',
    icon: 'Monitor',
    color: 'purple',
    sortOrder: 3
  },
  {
    name: 'videos',
    displayName: 'Educational Videos',
    description: 'Video content for learning',
    icon: 'Video',
    color: 'red',
    sortOrder: 4
  }
]

/**
 * 預設系統設定
 * Default system settings
 */
const defaultSystemSettings = [
  {
    key: 'site_name',
    value: 'ES International Department',
    description: 'Site display name',
    dataType: 'string',
    isPublic: true
  },
  {
    key: 'admin_email',
    value: 'admin@kcislk.ntpc.edu.tw',
    description: 'Administrator email',
    dataType: 'string',
    isPublic: false
  },
  {
    key: 'max_file_size',
    value: '10485760',
    description: 'Maximum file upload size in bytes (10MB)',
    dataType: 'number',
    isPublic: false
  },
  {
    key: 'session_timeout',
    value: '30',
    description: 'Session timeout in minutes',
    dataType: 'number',
    isPublic: false
  },
  {
    key: 'max_login_attempts',
    value: '5',
    description: 'Maximum login attempts before lockout',
    dataType: 'number',
    isPublic: false
  }
]

/**
 * 建立預設管理員帳戶
 * Create default admin account
 */
async function createDefaultAdmin() {
  const adminEmail = 'admin@kcislk.ntpc.edu.tw'
  const adminPassword = 'Admin123!' // 正式環境應使用更安全的密碼
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })
  
  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping creation')
    return existingAdmin
  }
  
  const hashedPassword = await hash(adminPassword, 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Administrator',
      isActive: true,
      emailVerified: true
    }
  })
  
  // 分配管理員角色
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  })
  
  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        assignedBy: adminUser.id
      }
    })
  }
  
  console.log(`✅ Created admin user: ${adminEmail}`)
  console.log(`🔑 Default password: ${adminPassword}`)
  console.log('⚠️  Please change the default password after first login')
  
  return adminUser
}

/**
 * 種子資料主函數
 * Main seeding function
 */
async function main() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // 檢查環境
    const environment = process.env.NODE_ENV || 'development'
    console.log(`🌍 Environment: ${environment}`)
    
    // 1. 建立角色
    console.log('👥 Creating roles...')
    for (const roleData of defaultRoles) {
      await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          displayName: roleData.displayName,
          description: roleData.description,
          permissions: roleData.permissions
        },
        create: roleData
      })
    }
    console.log(`✅ Created ${defaultRoles.length} roles`)
    
    // 2. 建立年級
    console.log('🎓 Creating grade levels...')
    for (const gradeData of defaultGradeLevels) {
      await prisma.gradeLevel.upsert({
        where: { name: gradeData.name },
        update: gradeData,
        create: gradeData
      })
    }
    console.log(`✅ Created ${defaultGradeLevels.length} grade levels`)
    
    // 3. 建立資源分類
    console.log('📚 Creating resource categories...')
    for (const categoryData of defaultResourceCategories) {
      await prisma.resourceCategory.upsert({
        where: { name: categoryData.name },
        update: categoryData,
        create: categoryData
      })
    }
    console.log(`✅ Created ${defaultResourceCategories.length} resource categories`)
    
    // 4. 建立系統設定
    console.log('⚙️  Creating system settings...')
    for (const settingData of defaultSystemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: settingData.key },
        update: {
          value: settingData.value,
          description: settingData.description,
          dataType: settingData.dataType,
          isPublic: settingData.isPublic
        },
        create: settingData
      })
    }
    console.log(`✅ Created ${defaultSystemSettings.length} system settings`)
    
    // 5. 建立預設管理員（僅在開發和測試環境）
    if (environment !== 'production') {
      console.log('👤 Creating default admin user...')
      await createDefaultAdmin()
    } else {
      console.log('⚠️  Skipping default admin creation in production environment')
    }
    
    // 6. 建立範例公告（僅在開發環境）
    if (environment === 'development') {
      console.log('📢 Creating sample announcements...')
      
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@kcislk.ntpc.edu.tw' }
      })
      
      if (adminUser) {
        const sampleAnnouncements = [
          {
            title: 'Welcome to ES International Department',
            content: 'Welcome to our new parent portal! Here you can access important announcements, events, and resources.',
            summary: 'Welcome message for parents',
            authorId: adminUser.id,
            targetAudience: 'parents',
            priority: 'high',
            status: 'published',
            publishedAt: new Date()
          },
          {
            title: 'Staff Meeting Next Week',
            content: 'Please attend the monthly staff meeting next Tuesday at 3:00 PM in the conference room.',
            summary: 'Monthly staff meeting reminder',
            authorId: adminUser.id,
            targetAudience: 'teachers',
            priority: 'medium',
            status: 'published',
            publishedAt: new Date()
          }
        ]
        
        for (const announcement of sampleAnnouncements) {
          await prisma.announcement.create({
            data: announcement
          })
        }
        
        console.log(`✅ Created ${sampleAnnouncements.length} sample announcements`)
      }
    }
    
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 執行種子資料腳本
main()
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })