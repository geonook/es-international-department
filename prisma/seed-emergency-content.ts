/**
 * Emergency Content Seed Script
 * 緊急內容資料庫遷移腳本
 *
 * Purpose: Migrate hardcoded content from emergency fixes to database
 * 目的：將緊急修復的硬編碼內容遷移到資料庫
 *
 * Created: 2025-09-13
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Announcement data from hardcoded content
const announcementData = {
  title: "English Textbooks Return & eBook Purchase 英語教材退書 & 電子書加購",
  content: `如果您選擇不用學校提供的教材（例如已經自行購買 myView或New Cornerstone等主教材），請於 9月5日（五）前，將書本交還給您孩子的外籍教師(IT)。

📌 請一年級家長 特別注意:
myView 1.1 與 1.2：請交還給外籍英語教師(IT)。
myView 1.3：請交還給中籍英語教師(LT)。

⚠️ 注意事項：
書本必須保持全新狀態，不得有筆跡、姓名貼紙或任何使用痕跡。
老師會連同學生的學號、姓名與班級一併登記退書。
國際處將統一與書商辦理退書事宜。

👉 建議您於聯絡簿上留言，讓中外師能夠同步掌握訊息。

💻 114 學年度 myView / myPerspectives 線上帳號（電子書）加購公告
本次電子書帳號加購為自願參加，僅供康橋國際學校學生使用，不另對外販售。
訂購時間：即日起至 2025/9/30（二） 止
使用期限：自開通日起至 2026/8/31 止
訂購網址：https://reurl.cc/XE8RxR

---

Dear Parents,
If you decide not to use the school-issued English textbooks (for example, if you have already purchased myView or New Cornerstone), please return them to your child's International teacher(IT) by Friday, September 5.

📌 Notice for Grade 1 parents:
myView 1.1 and 1.2: Please return to the international teacher(IT).
myView 1.3: Please return to the local teacher(LT).

⚠️ Reminders:
Books must remain in brand-new condition, with no writing, name stickers, or any signs of use.
Teachers will record the return together with the student's ID, name, and class.
The ID Office will arrange the return with the publisher.

👉 We recommend leaving a note in the communication book, so both local and international teachers are informed.

💻 myView / myPerspectives eBook Purchase
The purchase of eBook accounts is optional and available exclusively for Kang Chiao students.
Order period: From now until Tue., September 30, 2025
Validity: From the activation date until August 31, 2026
Order link: https://reurl.cc/XE8RxR`,
  summary: "英語教材退書須於9月5日前辦理，電子書加購至9/30截止。Grade 1 parents please note different return procedures for myView series.",
  type: "announcement",
  priority: "high",
  isImportant: true,
  isPinned: true,
  publishedAt: new Date('2024-08-25T09:00:00Z'),
  targetAudience: 'all'
}

// Newsletter data from hardcoded content
const newsletterData = [
  {
    title: "September 2024 ID Monthly Newsletter",
    content: "Welcome to our September 2024 newsletter featuring the start of new academic year, fresh curriculum initiatives, and exciting international programs. This issue introduces new faculty members, student achievements, and upcoming school events.",
    summary: "September 2024 newsletter: New academic year, curriculum initiatives, and international programs.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/hqdc/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/hqdc/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2024-09",
    publishedAt: new Date('2024-09-15T10:00:00Z'),
  },
  {
    title: "October 2024 ID Monthly Newsletter",
    content: "Explore our October 2024 newsletter highlighting autumn semester activities, international student exchanges, and academic innovations. This issue showcases science fair projects, literary competitions, and multicultural awareness programs.",
    summary: "October 2024 newsletter: Autumn activities, student exchanges, and academic innovations.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/jeay/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/jeay/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2024-10",
    publishedAt: new Date('2024-10-15T10:00:00Z'),
  },
  {
    title: "November 2024 ID Monthly Newsletter",
    content: "Read our November 2024 newsletter featuring autumn learning adventures, international collaboration projects, and gratitude celebrations. This issue includes teacher development programs, student research projects, and thanksgiving activities.",
    summary: "November 2024 newsletter: Autumn learning, international collaborations, and gratitude celebrations.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/bhyo/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/bhyo/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2024-11",
    publishedAt: new Date('2024-11-15T10:00:00Z'),
  },
  {
    title: "December 2024 ID Monthly Newsletter",
    content: "Discover our December 2024 newsletter showcasing winter celebrations, year-end reflections, and holiday activities. This issue features student performances, academic milestones, and festive community events.",
    summary: "December 2024 newsletter: Winter celebrations, year-end reflections, and holiday activities.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/bhyo/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/bhyo/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2024-12",
    publishedAt: new Date('2024-12-15T10:00:00Z'),
  },
  {
    title: "January 2025 ID Monthly Newsletter",
    content: "Welcome to our January 2025 newsletter featuring new year resolutions, winter semester preparations, and student achievements. This issue highlights innovative teaching methods, technology integration, and community partnerships.",
    summary: "January 2025 newsletter: New year resolutions, winter semester preparations, and achievements.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/iojr/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/iojr/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-01",
    publishedAt: new Date('2025-01-15T10:00:00Z'),
  },
  {
    title: "February 2025 ID Monthly Newsletter",
    content: "Explore our February 2025 newsletter covering Lunar New Year celebrations, winter learning activities, and academic excellence recognition. This issue includes cultural performances, study abroad opportunities, and family engagement programs.",
    summary: "February 2025 newsletter: Lunar New Year celebrations, winter activities, and academic excellence.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/hqjv/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/hqjv/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-02",
    publishedAt: new Date('2025-02-15T10:00:00Z'),
  },
  {
    title: "March 2025 ID Monthly Newsletter",
    content: "Check out our March 2025 newsletter highlighting new semester beginnings, international curriculum updates, and student leadership programs. This issue features classroom innovations, parent engagement activities, and upcoming events.",
    summary: "March 2025 newsletter: New semester beginnings, curriculum updates, and leadership programs.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/xcjz/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/xcjz/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-03",
    publishedAt: new Date('2025-03-15T10:00:00Z'),
  },
  {
    title: "April 2025 ID Monthly Newsletter",
    content: "Read our April 2025 newsletter featuring spring festival celebrations, academic progress updates, and international exchange programs. This issue includes student art exhibitions, sports achievements, and community service projects.",
    summary: "April 2025 newsletter: Spring festivals, academic updates, and international exchanges.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/bbcn/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/bbcn/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-04",
    publishedAt: new Date('2025-04-15T10:00:00Z'),
  },
  {
    title: "May 2025 ID Monthly Newsletter",
    content: "Discover our May 2025 newsletter covering spring semester highlights, international cultural events, and academic achievements. This issue showcases student projects, teacher spotlights, and upcoming graduation preparations.",
    summary: "May 2025 newsletter: Spring semester highlights, cultural events, and academic achievements.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/xjrq/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/xjrq/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-05",
    publishedAt: new Date('2025-05-15T10:00:00Z'),
  },
  {
    title: "June 2025 ID Monthly Newsletter",
    content: "Explore our June 2025 newsletter featuring summer activities, graduation ceremonies, and next academic year preparation. This issue highlights student achievements, upcoming events, and important announcements for the International Department community.",
    summary: "June 2025 newsletter: Summer activities, graduation ceremonies, and next academic year preparation.",
    onlineReaderUrl: "https://online.pubhtml5.com/vpgbz/vgzj/",
    embedCode: "<iframe style='width:900px;height:600px' src='https://online.pubhtml5.com/vpgbz/vgzj/'  seamless='seamless' scrolling='no' frameborder='0' allowtransparency='true' allowfullscreen='true' ></iframe>",
    issueNumber: "2025-06",
    publishedAt: new Date('2025-06-15T10:00:00Z'),
  }
]

async function seedEmergencyContent() {
  console.log('🌱 Starting emergency content seed...')

  try {
    // Check if we have a system user for authoring
    let systemUser = await prisma.user.findFirst({
      where: {
        email: 'system@kcislk.ntpc.edu.tw'
      }
    })

    // Create system user if not exists
    if (!systemUser) {
      console.log('📝 Creating system user...')
      systemUser = await prisma.user.create({
        data: {
          id: 'system_user',
          email: 'system@kcislk.ntpc.edu.tw',
          displayName: 'KCISLK ESID',
          firstName: 'KCISLK',
          lastName: 'ESID',
          emailVerified: true,
          isActive: true
        }
      })
    }

    // Seed announcement
    console.log('📢 Seeding announcement...')

    // Check if announcement already exists
    const existingAnnouncement = await prisma.communication.findFirst({
      where: {
        title: announcementData.title,
        type: 'announcement'
      }
    })

    if (!existingAnnouncement) {
      await prisma.communication.create({
        data: {
          ...announcementData,
          authorId: systemUser.id,
          status: 'published',
          boardType: 'general'
        }
      })
      console.log('✅ Announcement created successfully')
    } else {
      console.log('⚠️ Announcement already exists, skipping...')
    }

    // Seed newsletters
    console.log('📰 Seeding newsletters...')

    for (const newsletter of newsletterData) {
      // Check if newsletter already exists
      const existingNewsletter = await prisma.communication.findFirst({
        where: {
          title: newsletter.title,
          type: 'newsletter'
        }
      })

      if (!existingNewsletter) {
        await prisma.communication.create({
          data: {
            ...newsletter,
            type: 'newsletter',
            authorId: systemUser.id,
            status: 'published',
            targetAudience: 'all',
            boardType: 'general',
            priority: 'medium',
            isImportant: false,
            isPinned: false,
            pdfUrl: null
          }
        })
        console.log(`✅ Newsletter "${newsletter.title}" created`)
      } else {
        console.log(`⚠️ Newsletter "${newsletter.title}" already exists, skipping...`)
      }
    }

    console.log('🎉 Emergency content seed completed successfully!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedEmergencyContent()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })