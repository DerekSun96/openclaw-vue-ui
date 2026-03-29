import { config as loadEnv } from 'dotenv'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { createPrivateKey, createPublicKey, sign, generateKeyPairSync, createHash } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

loadEnv()

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789'
const PROXY_HOST = process.env.PROXY_HOST || '0.0.0.0'
const PROXY_PORT = parseInt(process.env.PROXY_PORT || '18790')
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const DATA_DIR = join(homedir(), '.openclaw-vue-ui')

// Try to read gateway token from openclaw config
function readGatewayToken(): string {
  const envToken = process.env.OPENCLAW_GATEWAY_TOKEN
  if (envToken) return envToken
  try {
    const configPath = join(homedir(), '.openclaw', 'openclaw.json')
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    return config?.gateway?.auth?.token ?? ''
  } catch { return '' }
}

const GATEWAY_TOKEN = readGatewayToken()

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const IDENTITY_FILE = join(DATA_DIR, 'device.json')
const TOKEN_FILE = join(DATA_DIR, 'token.json')

interface DeviceIdentity {
  deviceId: string
  publicKeyPem: string
  privateKeyPem: string
  publicKeyBase64Url: string
}

interface TokenInfo {
  token: string
  scopes: string[]
  savedAt: number
}

interface OpenClawSkillSummary {
  id: string
  name: string
  description: string
  available: boolean
  path: string
  exampleRequest?: string
}

// Load or create device identity
function loadOrCreateIdentity(): DeviceIdentity {
  if (existsSync(IDENTITY_FILE)) {
    return JSON.parse(readFileSync(IDENTITY_FILE, 'utf8'))
  }
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }) as string
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string
  const pubDer = publicKey.export({ type: 'spki', format: 'der' })
  const rawPub = (pubDer as Buffer).slice(-32)
  const deviceId = createHash('sha256').update(rawPub).digest('hex')
  const publicKeyBase64Url = rawPub.toString('base64url')

  const identity: DeviceIdentity = { deviceId, publicKeyPem: pubPem, privateKeyPem: privPem, publicKeyBase64Url }
  writeFileSync(IDENTITY_FILE, JSON.stringify(identity, null, 2))
  console.log(`[proxy] Created new device identity: ${deviceId.slice(0, 16)}...`)
  return identity
}

function loadToken(): TokenInfo | null {
  if (existsSync(TOKEN_FILE)) {
    try { return JSON.parse(readFileSync(TOKEN_FILE, 'utf8')) } catch { return null }
  }
  return null
}

function saveToken(info: TokenInfo) {
  writeFileSync(TOKEN_FILE, JSON.stringify(info, null, 2))
}

function readOpenClawConfig(): Record<string, any> {
  const configPath = join(homedir(), '.openclaw', 'openclaw.json')
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    return {}
  }
}

function resolveWorkspacePath(): string {
  const configuredWorkspace = readOpenClawConfig()?.agents?.defaults?.workspace
  if (typeof configuredWorkspace === 'string' && configuredWorkspace.trim()) {
    return configuredWorkspace
  }
  return join(homedir(), '.openclaw', 'workspace')
}

function parseSkillFrontmatter(content: string): { name?: string; description?: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const result: { name?: string; description?: string } = {}
  for (const rawLine of match[1].split(/\r?\n/)) {
    if (/^\s/.test(rawLine)) continue
    const line = rawLine.trim()
    if (!line) continue

    const nameMatch = line.match(/^name:\s*(.+)$/)
    if (nameMatch) {
      result.name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '')
      continue
    }

    const descriptionMatch = line.match(/^description:\s*(.+)$/)
    if (descriptionMatch) {
      result.description = descriptionMatch[1].trim().replace(/^['"]|['"]$/g, '')
    }
  }

  return result
}

function parseExampleRequest(content: string): string {
  const lines = content.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    const normalizedLine = line.replace(/\*\*/g, '')
    const inlineMatch = normalizedLine.match(/^示例请求[:：]\s*(.+)$/)
    if (inlineMatch) return inlineMatch[1].trim()

    if (/^示例请求[:：]$/.test(normalizedLine)) {
      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
        const nextLine = lines[nextIndex].trim()
        if (!nextLine) continue
        if (/^[-*]\s+/.test(nextLine)) return nextLine.replace(/^[-*]\s+/, '').trim()
        return nextLine
      }
    }
  }

  return ''
}

function readWorkspaceSkills(): OpenClawSkillSummary[] {
  const workspacePath = resolveWorkspacePath()
  const skillsDir = join(workspacePath, 'skills')
  if (!existsSync(skillsDir)) return []

  return readdirSync(skillsDir).flatMap((entryName) => {
      const skillDir = join(skillsDir, entryName)
      if (!statSync(skillDir).isDirectory()) return []

      const skillFile = join(skillDir, 'SKILL.md')
      const content = existsSync(skillFile) ? readFileSync(skillFile, 'utf8') : ''
      const frontmatter = content ? parseSkillFrontmatter(content) : {}
      const exampleRequest = content ? parseExampleRequest(content) : ''

      return [{
        id: entryName,
        name: frontmatter.name || entryName,
        description: frontmatter.description || '',
        available: true,
        path: skillDir,
        exampleRequest: exampleRequest || undefined,
      }]
    })
}

function sendJson(res: any, statusCode: number, payload: Record<string, unknown>) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  })
  res.end(JSON.stringify(payload))
}

const identity = loadOrCreateIdentity()
let tokenInfo = loadToken()
const privateKey = createPrivateKey(identity.privateKeyPem)

function buildConnectParams(nonce: string) {
  const signedAt = Date.now()
  const role = 'operator'
  const scopes = ['operator.read', 'operator.write', 'operator.admin', 'operator.approvals', 'operator.pairing']
  const clientId = 'openclaw-control-ui'
  const clientMode = 'ui'
  const platform = 'web'

  const token = GATEWAY_TOKEN || tokenInfo?.token || ''
  const deviceFamily = ''
  const payload = ['v3', identity.deviceId, clientId, clientMode, role, scopes.join(','), String(signedAt), token, nonce, platform, deviceFamily].join('|')
  const signature = sign(null, Buffer.from(payload, 'utf8'), privateKey).toString('base64url')

  const params: Record<string, unknown> = {
    minProtocol: 3, maxProtocol: 3,
    client: { id: clientId, version: '0.1.0', platform, mode: clientMode },
    role, scopes, caps: ['tool-events'],
    device: { id: identity.deviceId, publicKey: identity.publicKeyBase64Url, signature, signedAt, nonce },
  }
  const auth: Record<string, string> = {}
  if (GATEWAY_TOKEN) auth.token = GATEWAY_TOKEN
  if (tokenInfo?.token) auth.deviceToken = tokenInfo.token
  if (Object.keys(auth).length > 0) params.auth = auth
  return params
}

// HTTP server
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `127.0.0.1:${PROXY_PORT}`}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': CORS_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/healthz') {
    sendJson(res, 200, {
      ok: true,
      proxy: 'openclaw-gateway-proxy',
      gatewayUrl: GATEWAY_URL,
      paired: !!tokenInfo?.token,
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/openclaw/skills') {
    try {
      const skills = readWorkspaceSkills()
      sendJson(res, 200, {
        ok: true,
        workspace: resolveWorkspacePath(),
        skills,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read workspace skills'
      sendJson(res, 500, {
        ok: false,
        error: message,
      })
    }
    return
  }

  sendJson(res, 200, { ok: true, proxy: 'openclaw-gateway-proxy', paired: !!tokenInfo })
})

const wss = new WebSocketServer({ server })

wss.on('connection', (clientWs) => {
  console.log('[proxy] Client connected')
  const gwWs = new WebSocket(GATEWAY_URL, { origin: `http://127.0.0.1:${PROXY_PORT}` })
  let authenticated = false
  let buffered: string[] = []
  let pairingRequestId: string | null = null

  gwWs.on('open', () => console.log('[proxy] Gateway WS open'))

  gwWs.on('message', (data) => {
    const msg = JSON.parse(data.toString())

    // Step 1: Handle challenge
    if (!authenticated && msg.event === 'connect.challenge') {
      const params = buildConnectParams(msg.payload.nonce)
      gwWs.send(JSON.stringify({ type: 'req', id: 'proxy-connect', method: 'connect', params }))
      return
    }

    // Step 2: Handle connect response
    if (!authenticated && msg.id === 'proxy-connect') {
      if (msg.ok) {
        authenticated = true
        // Check if we got a new deviceToken in the response
        if (msg.payload?.deviceToken) {
          tokenInfo = { token: msg.payload.deviceToken, scopes: msg.payload.scopes ?? [], savedAt: Date.now() }
          saveToken(tokenInfo)
          console.log('[proxy] Saved new device token')
        }
        console.log('[proxy] Authenticated successfully')
        clientWs.send(JSON.stringify({ type: 'event', event: 'proxy.connected', payload: { ok: true } }))
        for (const m of buffered) gwWs.send(m)
        buffered = []
      } else {
        const code = msg.error?.details?.code
        if (code === 'PAIRING_REQUIRED' || code === 'NOT_PAIRED') {
          pairingRequestId = msg.error?.details?.requestId
          console.log(`[proxy] Pairing required. Request ID: ${pairingRequestId}`)
          console.log('[proxy] *** Please approve the pairing request in OpenClaw dashboard ***')
          console.log('[proxy] Run: openclaw dashboard')
          clientWs.send(JSON.stringify({
            type: 'event', event: 'proxy.pairing-required',
            payload: { requestId: pairingRequestId, message: 'Please approve device pairing in OpenClaw dashboard' }
          }))
          // Keep connection open, wait for pairing approval via gateway events
        } else if (code === 'AUTH_DEVICE_TOKEN_MISMATCH') {
          // Token was rotated, clear and retry
          tokenInfo = null
          writeFileSync(TOKEN_FILE, '{}')
          console.log('[proxy] Token mismatch, cleared. Reconnecting...')
          gwWs.close()
        } else {
          console.error('[proxy] Auth failed:', msg.error)
          clientWs.send(JSON.stringify({ type: 'event', event: 'proxy.error', payload: msg.error }))
        }
      }
      return
    }

    // Forward everything else to client
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data.toString())
    }
  })

  gwWs.on('close', (code, reason) => {
    console.log(`[proxy] Gateway closed: ${code} ${reason}`)
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close()
  })

  gwWs.on('error', (err) => console.error('[proxy] Gateway error:', err.message))

  clientWs.on('message', (data) => {
    const str = data.toString()
    if (!authenticated) { buffered.push(str); return }
    if (gwWs.readyState === WebSocket.OPEN) gwWs.send(str)
  })

  clientWs.on('close', () => {
    console.log('[proxy] Client disconnected')
    if (gwWs.readyState === WebSocket.OPEN) gwWs.close()
  })
})

server.listen(PROXY_PORT, PROXY_HOST, () => {
  console.log(`[proxy] OpenClaw Gateway Proxy on ws://${PROXY_HOST}:${PROXY_PORT}`)
  console.log(`[proxy] Proxying to ${GATEWAY_URL}`)
  console.log(`[proxy] Device: ${identity.deviceId.slice(0, 16)}...`)
  console.log(`[proxy] Paired: ${!!tokenInfo?.token}`)
  console.log(`[proxy] CORS origin: ${CORS_ORIGIN}`)
})
