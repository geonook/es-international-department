#!/usr/bin/env tsx

/**
 * Create First Week Message for 25-26 School Year
 * 創建25-26學年第一週訊息
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createFirstWeekMessage() {
  try {
    console.log('🚀 Creating first week message for 25-26 school year...')
    
    // First, let's get an admin user to be the author
    const adminUser = await prisma.user.findFirst({
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
      console.log('❌ No admin user found. Creating message without author.')
    }

    const messageContent = `<h2>🎉 開學典禮 Opening Ceremony</h2>
<p><strong>時間：10:05-10:55（全體教師參加）</strong></p>
<p>校長將介紹新教師以及擔任新行政職務的同事。</p>

<h3>📋 典禮流程</h3>
<ul>
<li>新教師/行政人員請聚集在舞台右側</li>
<li>請依辦公室分成三排：DSA、DAA、ID</li>
<li>聽到姓名時，請走到舞台前方向學生揮手致意</li>
<li>結束後從右側退場，前往教師座位區</li>
</ul>

<h3>📢 上台順序</h3>
<p>Harry, Peko, Bryce, Natacha, Aleks, Samatha, Elena, Adeelena, Richmond, Caseylyn, Russell, Jade</p>

<hr>

<h2>📚 Academic Team</h2>

<h3>🚌 接送安排 Pick-up Arrangements</h3>
<ul>
<li><strong>一年級教師</strong>：每堂課第一天請親自接學生</li>
<li><strong>EV & myReading教師</strong>：第一堂課也請親自接學生</li>
<li><strong>KCFS班級</strong>：學生可能會走錯教室，請提醒正確位置</li>
<li><strong>2-6年級</strong>：聯絡簿已發至導師班，導師會分發並指導學生仔細閱讀課表</li>
</ul>

<h3>👥 學生分班 Student Placement</h3>
<ul>
<li>請仔細觀察學生是否適合目前程度</li>
<li>辦公室人員可能會進教室觀察特定學生</li>
<li>提醒學生保持書本整潔，前兩週可能會調整班級安排</li>
</ul>

<h3>📝 點名 Attendance</h3>
<ul>
<li>每天記得點名</li>
<li>如有學生缺席，請先查看iSchool，再聯絡Nydia</li>
</ul>

<h3>👨‍👩‍👧‍👦 大使招募 Ambassador Recruitment</h3>
<p>我們將向家長發送新學年大使計劃報名表，透過電子郵件和Google Classroom通知。</p>

<h3>🎯 學生行為管理三層介入流程</h3>
<p>請參閱附件連結了解學生行為管理和諮詢三層介入流程詳細資訊。由於這是新制度，實施過程中仍有調整空間。</p>

<hr>

<h2>📖 Curriculum Team</h2>

<h3>📋 聯絡簿 Communication Book</h3>
<ul>
<li>每週一（或該課程第一天）下午4:35前上傳聯絡簿頁面至E-Communication</li>
</ul>

<h3>📊 週報告 Weekly Report (Summary)</h3>
<p><strong>每週五上傳週報告至E-Communication聯絡簿</strong></p>

<p>報告應包含：</p>
<ul>
<li>週次和日期</li>
<li>班級名稱（例：G2 Inventors）</li>
<li>以家長友善語言撰寫的週摘要</li>
<li>使用條列式</li>
<li>註明教科書/練習簿頁數</li>
<li>學習目標使用"我能夠..."的陳述</li>
<li>幫助家長和學生複習下週形成性評量重點</li>
<li>下週內容預覽</li>
<li>形成性評量公告（註明測驗類型，如Reading Test Unit 1）</li>
<li>重要提醒事項</li>
</ul>

<p><strong>命名格式</strong>：WR: G1 Achievers LT W2</p>
<p>詳細說明請參閱<a href="#" target="_blank">此連結</a>。</p>

<h3>⭐ STAR測驗 (LT教師)</h3>
<ul>
<li><strong>截止日期</strong>：請在第二週完成STAR測驗</li>
<li>查看iPad時程安排測驗時間</li>
<li>完成追蹤表格記錄進度，註記無法在第1-2週完成測驗的學生（如需第3週完成請告知我們）</li>
<li>Renaissance系統會顯示兩個班級（今年+去年）</li>
<li>去年資料將在下週安全移除（夏季閱讀積分會保留至9/12）</li>
<li>1-2年級教師的學生登入資訊已放在信箱</li>
<li>3-6年級學生如忘記密碼，可輸入學號查詢</li>
</ul>

<p><strong>STAR測驗密碼：cat</strong></p>

<h3>📚 課程計劃 Unit Plans</h3>
<ul>
<li>請提前完成課程計劃並複習目標準備課程</li>
<li>請假時必須提供代課教師課程計劃</li>
<li>建議建立個人系統定期更新計劃，避免臨時準備</li>
</ul>

<h3>🏢 ID辦公室會議</h3>
<p><strong>時間</strong>：下週三第7節</p>
<p><strong>議程</strong>：</p>
<ul>
<li>PTC簡報檢討</li>
<li>分年段小組討論</li>
</ul>

<hr>

<h2>🎯 Instructional Team</h2>

<h3>👥 一對一會議預約 1-on-1 Meeting Sign up</h3>
<p>Natacha將在第1-3週開始安排一對一會議，請使用報名表預約方便的時段。2025年8月新進教師可預約2個時段。</p>

<p><strong>報名表連結</strong>：<a href="https://docs.google.com/spreadsheets/d/1mIH5-LyUb69RnF5MfbVBkiB3Gkv4qrpbuOivJoEO8pU/edit?usp=sharing" target="_blank">點此預約</a></p>

<h3>🏆 班級積分系統重新介紹 Squad Points Re-introduction</h3>
<p>本週三Aleksandra將分享班級積分系統的精彩更新！她會向大家說明如何將班級週積分添加到Google表單的簡單流程。</p>

<p>就像去年一樣，我們會每週更新ID辦公室外的瑪利歐主題積分榜，讓學生看到進度。我們很興奮與大家合作，感謝大家協助建立我們的絕佳校園社群！</p>

<hr>

<p><em>📅 發布日期：25-26學年第一週</em><br>
<em>📧 如有任何問題，請聯絡相關組別負責人</em></p>`

    // Create the message board post
    const message = await prisma.messageBoard.create({
      data: {
        title: '25-26學年第一週：開學典禮及重要事項',
        content: messageContent,
        sourceGroup: 'Vickie',
        boardType: 'teachers',
        isImportant: true,
        isPinned: false,
        status: 'active',
        authorId: adminUser?.id || null,
        replyCount: 0,
        viewCount: 0
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

    console.log('✅ First week message created successfully!')
    console.log(`📋 Message ID: ${message.id}`)
    console.log(`📝 Title: ${message.title}`)
    console.log(`👩‍💼 Source Group: ${message.sourceGroup}`)
    console.log(`🚨 Important: ${message.isImportant}`)
    console.log(`📅 Created: ${message.createdAt}`)
    
    if (message.author) {
      console.log(`✍️ Author: ${message.author.displayName || message.author.email}`)
    }

    console.log('\n🎉 Message board post ready for teachers to view!')

  } catch (error) {
    console.error('❌ Error creating message:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createFirstWeekMessage()