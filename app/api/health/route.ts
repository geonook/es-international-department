/**
 * Health Check API Endpoint
 * KCISLK ESID Info Hub - 健康檢查 API 端點
 * 
 * This endpoint is used by Docker health checks and monitoring systems
 * to verify that the application is running correctly.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: 'OK',
      service: 'KCISLK ESID Info Hub',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    // If there's any error, return unhealthy status
    const errorStatus = {
      status: 'ERROR',
      service: 'KCISLK ESID Info Hub',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorStatus, { status: 500 })
  }
}

// Support HEAD requests for lightweight health checks
export async function HEAD() {
  try {
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}