import { randomBytes } from 'crypto'

export function generateInviteCodePure(): string {
  let result = ''
  while (result.length < 8) {
    result += randomBytes(6).toString('base64url').replace(/[-_]/g, '').toUpperCase()
  }
  return result.slice(0, 8)
}
