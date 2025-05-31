// src/app/api/runpod/status/[jobId]/route.ts
import { NextResponse } from 'next/server'

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY
const RUNPOD_API_BASE_URL = process.env.RUNPOD_API_BASE_URL

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    if (!RUNPOD_API_KEY || !RUNPOD_API_BASE_URL) {
      return NextResponse.json(
        { error: 'RunPod configuration is missing' },
        { status: 500 }
      )
    }

    const statusUrl = `${RUNPOD_API_BASE_URL}/status/${jobId}`
    const requestConfig = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNPOD_API_KEY}`
      }
    }

    // console.log(`[Next.js API] Polling RunPod status for job ${jobId}`) // Can be too verbose

    const runpodResponse = await fetch(statusUrl, requestConfig)

    if (!runpodResponse.ok) {
      const errorText = await runpodResponse.text()
      console.error(`[Next.js API] Error polling RunPod status for job ${jobId}:`, {
        status: runpodResponse.status,
        error: errorText,
        requestUrl: statusUrl
      })
      return NextResponse.json(
        {
          message: "Error polling AI task status via Next.js API.",
          details: errorText
        },
        { status: runpodResponse.status }
      )
    }

    const responseData = await runpodResponse.json()
    // console.log(`[Next.js API] Status response for job ${jobId}:`, responseData)
    return NextResponse.json(responseData)

  } catch (error) {
    console.error(`[Next.js API] Error in RunPod status route:`, error)
    return NextResponse.json(
      {
        message: "Internal server error in RunPod status route.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}