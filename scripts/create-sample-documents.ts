#!/usr/bin/env ts-node

/**
 * Create Sample Department Documents
 * 創建範例部門文檔
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleDocuments = [
  {
    title: '學生請假申請表格',
    description: '學生因病假、事假或其他原因請假時使用的標準表格。此表格須由家長簽名確認，並由班主任及學務處審核。',
    resourceType: 'PDF',
    fileUrl: '/documents/academic/leave-application-form.pdf',
    category: 'academic-affairs',
    status: 'published',
    tags: ['表格', '請假', '學務處']
  },
  {
    title: '外國學生簽證延期指南',
    description: '協助外國學生辦理簽證延期的詳細指引，包含所需文件清單、申請流程及注意事項。',
    resourceType: 'Document',
    fileUrl: '/documents/foreign/visa-extension-guide.docx',
    category: 'foreign-affairs',
    status: 'published',
    tags: ['簽證', '外國學生', '延期']
  },
  {
    title: '課程變更申請流程',
    description: '學生申請變更課程時的標準作業程序，包含申請時機、所需文件及審核標準。',
    resourceType: 'PDF',
    fileUrl: '/documents/classroom/course-change-procedure.pdf',
    category: 'classroom-affairs',
    status: 'published',
    tags: ['課程', '變更', '申請流程']
  },
  {
    title: '校園安全管理政策',
    description: '學校整體安全管理政策，包含校園門禁管理、訪客管理、緊急應變程序等重要規定。',
    resourceType: 'Document',
    fileUrl: '/documents/policies/campus-security-policy.docx',
    category: 'policies-procedures',
    status: 'published',
    tags: ['政策', '安全管理', '校園']
  },
  {
    title: '新生入學指南',
    description: '新生報到須知及入學準備事項，包含制服購買、教科書清單、社團介紹等重要資訊。',
    resourceType: 'PDF',
    fileUrl: '/documents/students/new-student-guide.pdf',
    category: 'student-resources',
    status: 'published',
    tags: ['新生', '入學', '指南']
  },
  {
    title: '設備借用申請表',
    description: '教師或學生借用學校設備（如投影機、音響設備等）時使用的申請表格。',
    resourceType: 'PDF',
    fileUrl: '/documents/admin/equipment-borrowing-form.pdf',
    category: 'administrative-forms',
    status: 'draft',
    tags: ['設備', '借用', '申請表']
  }
]

async function main() {
  console.log('🚀 Starting sample documents creation...')

  try {
    // Get categories
    const categories = await prisma.resourceCategory.findMany()
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]))

    // Find or create admin user
    let adminUser = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'admin'
            }
          }
        }
      }
    })

    if (!adminUser) {
      console.log('ℹ️  No admin user found, creating documents without creator')
    }

    console.log(`📄 Creating ${sampleDocuments.length} sample documents...`)

    for (const doc of sampleDocuments) {
      const categoryId = categoryMap.get(doc.category)
      
      if (!categoryId) {
        console.log(`⚠️  Category ${doc.category} not found, skipping document: ${doc.title}`)
        continue
      }

      // Check if document already exists
      const existingDoc = await prisma.resource.findFirst({
        where: { title: doc.title }
      })

      if (existingDoc) {
        console.log(`✅ Document already exists: ${doc.title}`)
        continue
      }

      const created = await prisma.resource.create({
        data: {
          title: doc.title,
          description: doc.description,
          resourceType: doc.resourceType,
          fileUrl: doc.fileUrl,
          categoryId: categoryId,
          status: doc.status,
          createdBy: adminUser?.id,
          tags: {
            create: doc.tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
                  }
                }
              }
            }))
          }
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          }
        }
      })

      console.log(`✅ Created: ${created.title} in ${created.category?.displayName}`)
    }

    console.log('🎉 Sample documents creation completed!')

    // Display summary
    const documentsCount = await prisma.resource.count()
    const categoriesWithCounts = await prisma.resourceCategory.findMany({
      include: {
        resources: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    console.log('\n📊 Documents Summary:')
    console.log(`Total documents: ${documentsCount}`)
    categoriesWithCounts.forEach(cat => {
      if (cat.resources.length > 0) {
        console.log(`  • ${cat.displayName}: ${cat.resources.length} documents`)
      }
    })

  } catch (error) {
    console.error('❌ Error creating sample documents:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()