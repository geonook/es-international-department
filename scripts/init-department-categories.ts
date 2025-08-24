#!/usr/bin/env ts-node

/**
 * Initialize Department Resource Categories
 * 初始化部門資源分類
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const departmentCategories = [
  {
    name: 'academic-affairs',
    displayName: '學務處文檔',
    description: '學務處相關政策、表格、通知與管理文檔',
    icon: 'GraduationCap',
    color: '#2563eb',
    sortOrder: 1
  },
  {
    name: 'foreign-affairs',
    displayName: '外事處文檔',
    description: '外事處國際交流、簽證、海外活動相關文檔',
    icon: 'Globe',
    color: '#059669',
    sortOrder: 2
  },
  {
    name: 'classroom-affairs',
    displayName: '教務處文檔',
    description: '教務處課程安排、教學管理、評量相關文檔',
    icon: 'BookOpen',
    color: '#dc2626',
    sortOrder: 3
  },
  {
    name: 'administrative-forms',
    displayName: '行政表格',
    description: '各類行政申請表格、審核文件',
    icon: 'FileText',
    color: '#7c3aed',
    sortOrder: 4
  },
  {
    name: 'policies-procedures',
    displayName: '政策程序',
    description: '學校政策、作業程序、規章制度',
    icon: 'Shield',
    color: '#ea580c',
    sortOrder: 5
  },
  {
    name: 'student-resources',
    displayName: '學生資源',
    description: '學生手冊、指導資料、申請資源',
    icon: 'Users',
    color: '#0891b2',
    sortOrder: 6
  }
]

async function main() {
  console.log('🚀 Starting department categories initialization...')

  try {
    // Check if categories already exist
    const existingCategories = await prisma.resourceCategory.findMany({
      where: {
        name: {
          in: departmentCategories.map(cat => cat.name)
        }
      }
    })

    const existingNames = new Set(existingCategories.map(cat => cat.name))
    const newCategories = departmentCategories.filter(cat => !existingNames.has(cat.name))

    if (newCategories.length === 0) {
      console.log('✅ All department categories already exist')
      return
    }

    console.log(`📂 Creating ${newCategories.length} new categories...`)

    // Create new categories
    for (const category of newCategories) {
      const created = await prisma.resourceCategory.create({
        data: {
          ...category,
          isActive: true
        }
      })
      console.log(`✅ Created: ${created.displayName} (${created.name})`)
    }

    console.log('🎉 Department categories initialization completed!')

    // Display summary
    const allCategories = await prisma.resourceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        resources: true
      }
    })

    console.log('\n📊 Current Categories Summary:')
    allCategories.forEach(cat => {
      console.log(`  • ${cat.displayName} (${cat.resources.length} resources)`)
    })

  } catch (error) {
    console.error('❌ Error initializing department categories:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()