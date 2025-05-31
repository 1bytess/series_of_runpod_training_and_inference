// src/app/api/litellm/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Configuration for your local LiteLLM server
const LITELLM_API_KEY = process.env.LITELLM_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key'
const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://192.168.1.200:4000/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, model = 'gpt-4o', max_tokens = 1024 } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Format the request for OpenAI-compatible API
    const requestPayload = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: parseInt(max_tokens.toString(), 10),
      temperature: 0.7
    }

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LITELLM_API_KEY}`
      },
      body: JSON.stringify(requestPayload)
    }

    console.log(`[Next.js API] Making LiteLLM request to: ${LITELLM_BASE_URL}/chat/completions`)
    console.log(`[Next.js API] Using model: ${model}`)

    const chatUrl = `${LITELLM_BASE_URL}/chat/completions`
    const response = await fetch(chatUrl, requestConfig)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Next.js API] Error with LiteLLM request:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: chatUrl
      })
      
      return NextResponse.json(
        {
          message: `Failed to get response from LiteLLM API. Status: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const responseData = await response.json()
    
    // Extract the message content from the response
    const result = responseData.choices?.[0]?.message?.content || 'No response generated'
    
    console.log("[Next.js API] LiteLLM response received successfully")
    
    return NextResponse.json({ result })

  } catch (error) {
    console.error('[Next.js API] Error in LiteLLM chat route:', error)
    
    return NextResponse.json(
      {
        message: "Internal server error in LiteLLM chat route.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}