import bcrypt from 'bcryptjs'

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  
  // Check minimum length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  // Check for capital letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one capital letter')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
