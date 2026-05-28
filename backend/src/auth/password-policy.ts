export const PASSWORD_POLICY_MESSAGE =
  'A senha precisa ter pelo menos 8 caracteres, com letra minúscula, letra maiúscula, número e símbolo.'

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}
