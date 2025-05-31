// src/app/api/runpod/run/route.ts
import { NextRequest, NextResponse } from 'next/server'

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY
const RUNPOD_API_BASE_URL = process.env.RUNPOD_API_BASE_URL

if (!RUNPOD_API_KEY || !RUNPOD_API_BASE_URL) {
  console.error("FATAL ERROR: RUNPOD_API_KEY or RUNPOD_API_BASE_URL is not defined in environment variables.")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, max_new_tokens = 1024 } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!RUNPOD_API_KEY || !RUNPOD_API_BASE_URL) {
      return NextResponse.json(
        { error: 'RunPod configuration is missing' },
        { status: 500 }
      )
    }

    const runUrl = `${RUNPOD_API_BASE_URL}/run`
    
    // Format prompt similar to your original server
    const formattedPrompt = `Below is an instruction that describes a task. Write a response that appropriately completes the request.\n### Instruction:\n${prompt.trim()}\n\n### Response:`
    
    const requestPayload = {
      input: { 
        prompt: formattedPrompt, 
        max_new_tokens: parseInt(max_new_tokens.toString(), 10) 
      }
    }

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNPOD_API_KEY}`
      },
      body: JSON.stringify(requestPayload)
    }

    console.log(`[Next.js API] Forwarding to RunPod /run. Prompt: "${prompt.substring(0, 50)}..."`)

    const runpodResponse = await fetch(runUrl, requestConfig)
    
    if (!runpodResponse.ok) {
      const errorText = await runpodResponse.text()
      console.error('[Next.js API] Error starting RunPod job:', {
        status: runpodResponse.status,
        error: errorText,
        requestUrl: runUrl
      })
      
      return NextResponse.json(
        {
          message: "Failed to start AI task via Next.js API.",
          details: errorText
        },
        { status: runpodResponse.status }
      )
    }

    const responseData = await runpodResponse.json()
    console.log("[Next.js API] Job submission response from RunPod (/run):", responseData)
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[Next.js API] Error in RunPod run route:', error)
    
    return NextResponse.json(
      {
        message: "Internal server error in RunPod run route.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}