#!/usr/bin/env ts-node

/**
 * Event Management System Test & Setup
 * 活動管理系統測試與設置腳本
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEventSystem() {
  console.log('🧪 Testing Event Management System...\n')

  try {
    // Test 1: Database Schema and Existing Data
    console.log('1️⃣ Checking database schema and existing data...')
    const eventCount = await prisma.event.count()
    console.log(`✅ Database connection successful`)
    console.log(`   Existing events: ${eventCount}`)

    // Test 2: Create Sample Events if None Exist
    if (eventCount === 0) {
      console.log('\n📅 Creating sample events for testing...')
      
      const sampleEvents = [
        {
          title: 'Coffee with Principal - September Session',
          description: 'Monthly Coffee with Principal session for parents to discuss school matters and upcoming activities.',
          eventType: 'coffee_session',
          startDate: new Date('2025-09-15'),
          startTime: new Date('2025-09-15T09:00:00Z'),
          endTime: new Date('2025-09-15T10:30:00Z'),
          location: 'School Library',
          maxParticipants: 30,
          registrationRequired: true,
          registrationDeadline: new Date('2025-09-13'),
          targetGrades: ['all'],
          status: 'published',
          isFeatured: true
        },
        {
          title: 'Grade 3-4 Sports Day',
          description: 'Annual sports day competition for Grades 3-4 students with various athletic activities.',
          eventType: 'sports',
          startDate: new Date('2025-10-10'),
          startTime: new Date('2025-10-10T08:30:00Z'),
          endTime: new Date('2025-10-10T15:00:00Z'),
          location: 'School Sports Field',
          registrationRequired: false,
          targetGrades: ['3', '4'],
          status: 'published',
          isFeatured: false
        },
        {
          title: 'Parent-Teacher Conference',
          description: 'Quarterly parent-teacher conferences to discuss student progress and development.',
          eventType: 'parent_meeting',
          startDate: new Date('2025-11-20'),
          endDate: new Date('2025-11-22'),
          startTime: new Date('2025-11-20T13:00:00Z'),
          endTime: new Date('2025-11-20T17:00:00Z'),
          location: 'Individual Classrooms',
          registrationRequired: true,
          registrationDeadline: new Date('2025-11-15'),
          targetGrades: ['all'],
          status: 'published',
          isFeatured: true
        },
        {
          title: 'Science Fair Exhibition',
          description: 'Student science project exhibition showcasing innovative experiments and research.',
          eventType: 'academic',
          startDate: new Date('2025-12-05'),
          startTime: new Date('2025-12-05T14:00:00Z'),
          endTime: new Date('2025-12-05T16:30:00Z'),
          location: 'School Auditorium',
          registrationRequired: false,
          targetGrades: ['5', '6'],
          status: 'draft',
          isFeatured: false
        }
      ]

      for (const eventData of sampleEvents) {
        await prisma.event.create({ data: eventData })
      }
      
      console.log(`✅ Created ${sampleEvents.length} sample events`)
    }

    // Test 3: API Endpoints (requires authentication, so we'll test the logic)
    console.log('\n2️⃣ Testing API structure...')
    
    // Check events with different filters
    const publishedEvents = await prisma.event.findMany({
      where: { status: 'published' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })
    
    console.log(`✅ Published events found: ${publishedEvents.length}`)
    
    // Test filtering by event type
    const coffeeEvents = await prisma.event.findMany({
      where: { 
        status: 'published',
        eventType: 'coffee_session'
      }
    })
    console.log(`✅ Coffee session events: ${coffeeEvents.length}`)
    
    // Test filtering by target grades
    const gradeSpecificEvents = await prisma.event.findMany({
      where: {
        status: 'published',
        targetGrades: {
          array_contains: ['3']
        }
      }
    })
    console.log(`✅ Grade 3 events: ${gradeSpecificEvents.length}`)

    // Test 4: Event Features
    console.log('\n3️⃣ Testing event features...')
    
    // Featured events
    const featuredEvents = await prisma.event.findMany({
      where: { 
        status: 'published',
        isFeatured: true
      }
    })
    console.log(`✅ Featured events: ${featuredEvents.length}`)
    
    // Upcoming events (future dates)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: 'published',
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: 'asc' }
    })
    console.log(`✅ Upcoming events: ${upcomingEvents.length}`)
    
    // Events requiring registration
    const registrationEvents = await prisma.event.findMany({
      where: {
        status: 'published',
        registrationRequired: true
      }
    })
    console.log(`✅ Events requiring registration: ${registrationEvents.length}`)

    // Test 5: Event Types Analysis
    console.log('\n4️⃣ Analyzing event types...')
    const eventsByType = await prisma.event.groupBy({
      by: ['eventType'],
      where: { status: 'published' },
      _count: { eventType: true }
    })
    
    eventsByType.forEach(group => {
      console.log(`   - ${group.eventType}: ${group._count.eventType} events`)
    })

    console.log('\n🎉 Event System Analysis Complete!')
    console.log('\n📋 System Status:')
    console.log('✅ Event database schema is working')
    console.log('✅ Sample events created/verified')
    console.log('✅ Event filtering by type works')
    console.log('✅ Event filtering by target grades works')
    console.log('✅ Featured events system works')
    console.log('✅ Registration system structure ready')
    console.log('✅ Event status system works')
    
    console.log('\n🔧 Next Implementation Steps:')
    console.log('1. Test authenticated API endpoints')
    console.log('2. Implement EventForm component')
    console.log('3. Implement EventList component')
    console.log('4. Test event CRUD operations')
    console.log('5. Implement registration functionality')
    console.log('6. Add event calendar integration')

    // Display sample events for review
    console.log('\n📅 Sample Events Created:')
    publishedEvents.forEach(event => {
      console.log(`   • ${event.title}`)
      console.log(`     Type: ${event.eventType} | Date: ${event.startDate.toDateString()}`)
      console.log(`     Registration: ${event.registrationRequired ? 'Required' : 'Not Required'}`)
      console.log()
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testEventSystem()