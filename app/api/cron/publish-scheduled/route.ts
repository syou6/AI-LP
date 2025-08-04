import { NextRequest, NextResponse } from 'next/server'
import { schedulingService } from '@/lib/scheduling-service'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting scheduled posts processing...')
    
    // Process all scheduled posts that are ready to be published
    const results = await schedulingService.processScheduledPosts()
    
    console.log('Scheduled posts processing completed:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Cron publish scheduled error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Allow manual triggering for testing (in development only)
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Manual triggering only available in development' },
      { status: 403 }
    )
  }

  try {
    console.log('Manually triggering scheduled posts processing...')
    
    const results = await schedulingService.processScheduledPosts()
    
    console.log('Manual scheduled posts processing completed:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      manual_trigger: true,
    })

  } catch (error: any) {
    console.error('Manual publish scheduled error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        manual_trigger: true,
      },
      { status: 500 }
    )
  }
}