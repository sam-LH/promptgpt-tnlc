import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC'

let engine = null
let loadingPromise = null

export function isReady() { return !!engine }

export function initEngine(onProgress) {
  if (loadingPromise) return loadingPromise
  loadingPromise = CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (report) => onProgress?.(report),
  }).then(e => { engine = e; return e })
  return loadingPromise
}

export async function chat(messages, system, onChunk) {
  if (!engine) throw new Error('Model not ready')
  const msgs = [
    ...(system ? [{ role: 'system', content: system }] : []),
    ...messages,
  ]
  const stream = await engine.chat.completions.create({
    messages: msgs, stream: true, temperature: 0.7, max_tokens: 2000,
  })
  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || ''
    full += delta
    onChunk?.(full)
  }
  return full
}
