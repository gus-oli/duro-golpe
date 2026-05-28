export const PASSWORD_POLICY_MESSAGE =
  'Use pelo menos 8 caracteres com letra minúscula, letra maiúscula, número e símbolo.'

export const PASSWORD_POLICY_RULES = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (value: string) => value.length >= 8 },
  { id: 'lowercase', label: 'Uma letra minúscula', test: (value: string) => /[a-z]/.test(value) },
  { id: 'uppercase', label: 'Uma letra maiúscula', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Um número', test: (value: string) => /\d/.test(value) },
  { id: 'symbol', label: 'Um símbolo', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

export function getPasswordPolicyStatus(password: string) {
  return PASSWORD_POLICY_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }))
}

export function isStrongPassword(password: string) {
  return getPasswordPolicyStatus(password).every((rule) => rule.passed)
}
