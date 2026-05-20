import { config } from '../config.js'

interface PasswordResetEmailInput {
  to: string
  displayName: string
  resetUrl: string
}

function assertBrevoConfigured() {
  if (!config.BREVO_API_KEY || !config.BREVO_SENDER_EMAIL) {
    throw Object.assign(new Error('Recuperação de senha indisponível no momento'), { statusCode: 503 })
  }
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  assertBrevoConfigured()

  const senderName = config.BREVO_SENDER_NAME ?? 'Duro Golpe'
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': config.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: config.BREVO_SENDER_EMAIL!,
      },
      to: [{ email: input.to, name: input.displayName }],
      subject: 'Recuperar senha do Duro Golpe',
      htmlContent: `
        <p>Olá, ${escapeHtml(input.displayName)}.</p>
        <p>Recebemos um pedido para redefinir sua senha no Duro Golpe.</p>
        <p><a href="${escapeAttribute(input.resetUrl)}">Clique aqui para criar uma nova senha</a></p>
        <p>Esse link expira em ${config.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.</p>
        <p>Se você não pediu essa alteração, pode ignorar este e-mail.</p>
      `,
      textContent: `Olá, ${input.displayName}.\n\nRecebemos um pedido para redefinir sua senha no Duro Golpe.\n\nAbra este link para criar uma nova senha:\n${input.resetUrl}\n\nEsse link expira em ${config.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.\n\nSe você não pediu essa alteração, pode ignorar este e-mail.`,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw Object.assign(new Error(`Brevo error: ${response.status} ${body}`), { statusCode: 502 })
  }
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', '&quot;')
}
