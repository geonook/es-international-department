import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API for Parents Corner
 * GET /api/public/info
 * 
 * Returns school information and settings
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch public system settings
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'school_name',
            'school_address',
            'school_phone',
            'school_email',
            'school_website',
            'school_logo_url',
            'parent_hero_image_url',
            'office_hours',
            'emergency_contact',
            'school_mission',
            'school_vision'
          ]
        }
      },
      select: {
        key: true,
        value: true
      }
    })

    // Transform settings to object
    const info = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    // Add squad information (static for now)
    info.squads = [
      "Trailblazers", "Discoverers", "Adventurers", "Innovators", 
      "Explorers", "Navigators", "Inventors", "Voyagers", 
      "Pioneers", "Guardians", "Pathfinders", "Seekers", 
      "Visionaries", "Achievers"
    ]

    // Add quick links
    info.quickLinks = [
      { name: "School Calendar", url: "/calendar" },
      { name: "Parent Handbook", url: "/handbook" },
      { name: "Contact Us", url: "/contact" },
      { name: "FAQ", url: "/faq" }
    ]

    // Set CORS headers for public access
    const headers = {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
    }

    return NextResponse.json(
      {
        success: true,
        data: info
      },
      { headers }
    )
  } catch (error) {
    console.error('Public info API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch school information' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}