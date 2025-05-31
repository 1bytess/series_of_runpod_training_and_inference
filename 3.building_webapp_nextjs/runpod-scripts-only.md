# RunPod Core Scripts for page.tsx

## Main RunPod Request Handler

```typescript
const handleRunPodRequest = async (prompt: string) => {
  try {
    setStatusMessage('Initializing Model')
    
    // Start the job
    const runResponse = await fetch('/api/runpod/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: prompt,
        model: selectedModel.id 
      }),
    })

    if (!runResponse.ok) {
      const errorData = await runResponse.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`RunPod request failed: ${errorData.message || runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    console.log('RunPod response data:', runData) // Debug log
    
    const jobId = runData.id

    if (!jobId) {
      throw new Error('No job ID returned from RunPod')
    }

    // Check if job completed immediately
    if (runData.status === 'COMPLETED') {
      const result = extractRunPodOutput(runData)
      setChat(prev => [...prev, { sender: 'bot', message: result }])
      return
    }

    setStatusMessage('Bujo is thinking')

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max wait time
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      
      const statusResponse = await fetch(`/api/runpod/status/${jobId}`)
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Status check failed: ${errorData.message || statusResponse.statusText}`)
      }
      
      const statusData = await statusResponse.json()
      console.log('RunPod status data:', statusData) // Debug log
      
      if (statusData.status === 'COMPLETED') {
        const result = extractRunPodOutput(statusData)
        setChat(prev => [...prev, { sender: 'bot', message: result }])
        return
      } else if (statusData.status === 'FAILED') {
        const errorDetails = statusData.error || statusData.output || 'Job failed without details'
        throw new Error(`RunPod job failed: ${JSON.stringify(errorDetails)}`)
      } else if (statusData.status === 'CANCELLED') {
        throw new Error('RunPod job was cancelled')
      }
      
      // Update status message based on job status  
      if (statusData.status === 'IN_QUEUE') {
        setStatusMessage('Bujo is initializing')
      } else if (statusData.status === 'IN_PROGRESS' || statusData.status === 'STARTING') {
        setStatusMessage('Bujo is thinking')
      }
      
      attempts++
    }
    
    throw new Error('Request timed out after 5 minutes')
  } catch (error) {
    throw error
  }
}
```

## Output Extraction Function

```typescript
const extractRunPodOutput = (responseData: any): string => {
  console.log('Extracting output from:', responseData)

  try {
    const output = responseData.output

    // Handle array output like your RunPod response
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item.choices && Array.isArray(item.choices)) {
          const choice = item.choices[0]
          if (choice.tokens && Array.isArray(choice.tokens)) {
            return choice.tokens.join('').trim() || 'No response generated'
          }
        }
      }
    }

    // Handle object-style output just in case
    if (output?.choices && Array.isArray(output.choices)) {
      const choice = output.choices[0]
      if (choice.tokens && Array.isArray(choice.tokens)) {
        return choice.tokens.join('').trim() || 'No response generated'
      }
    }

    if (typeof output === 'string') return output.trim()
    if (output?.generated_text) return String(output.generated_text).trim()
    if (output?.text) return String(output.text).trim()
    if (output?.message?.content) return String(output.message.content).trim()

    return 'No response generated'
  } catch (err) {
    console.error('Error extracting RunPod output:', err)
    return 'Error processing response'
  }
}
```

## Required State Variables

```typescript
const [chat, setChat] = useState<ChatMessage[]>([])
const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const [statusMessage, setStatusMessage] = useState('')
const [selectedModel, setSelectedModel] = useState<ModelOption>({
  id: 'zrah-model',
  name: 'Zrah Model 1.0',
  type: 'runpod'
})
```

## Required Interfaces

```typescript
interface ChatMessage {
  sender: 'user' | 'bot'
  message: string
}

interface ModelOption {
  id: string
  name: string
  type: 'runpod' | 'litellm'
  endpoint?: string
}
```

## HTML/JSX Frontend

```jsx
// Your frontend JSX goes here - complete chat interface with:
// - Chat messages display
// - Input form
// - Model selector
// - Loading states
// - Quick prompt buttons
// - Clear chat functionality
```