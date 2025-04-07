export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '')
  
  // Remove country code prefixes
  if (normalized.startsWith('92')) {
    normalized = normalized.substring(2)
  } else if (normalized.startsWith('0092')) {
    normalized = normalized.substring(4)
  }
  
  // Remove leading zero if present
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1)
  }
  
  // Ensure the number is 10 digits
  if (normalized.length !== 10) {
    throw new Error('Invalid phone number format')
  }
  
  return normalized
}

export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  return `92${normalized}`
} 