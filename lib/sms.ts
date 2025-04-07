const SMS_API_URL = process.env.SMS_API_URL

interface SendSMSResponse {
  success: boolean
  message?: string
  error?: string
}

interface Contact {
  first_name: string
  last_name: string
  phone: string
  [key: string]: string // For additional dynamic columns
}

function replaceVariables(message: string, contact: Contact): string {
  return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = contact[key.toLowerCase()]
    return value !== undefined ? value : match
  })
}

export async function sendSMS(phoneNumber: string, message: string, contact?: Contact): Promise<SendSMSResponse> {
  try {
    // Clean and format phone numbers
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    
    // Ensure phone number starts with country code
    const formattedPhoneNumber = cleanPhoneNumber.startsWith('92') 
      ? cleanPhoneNumber 
      : `92${cleanPhoneNumber}`

    // Replace variables if contact data is provided
    const processedMessage = contact ? replaceVariables(message, contact) : message

    console.log('Sending SMS to:', formattedPhoneNumber)
    console.log('Message:', processedMessage)
    console.log('Full URL:', `${SMS_API_URL}?destination=${formattedPhoneNumber}&message=${encodeURIComponent(processedMessage)}`)

    const response = await fetch(
      `${SMS_API_URL}?destination=${formattedPhoneNumber}&message=${encodeURIComponent(processedMessage)}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SMS API error response:', errorText)
      throw new Error(`SMS API responded with status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log('SMS API response:', data)
    
    return {
      success: true,
      message: 'SMS sent successfully'
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS'
    }
  }
}

export async function sendBulkSMS(
  contacts: Contact[],
  message: string,
  onProgress?: (progress: number) => void
): Promise<{
  success: boolean
  sent: number
  failed: number
  errors: string[]
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  const total = contacts.length
  let processed = 0

  for (const contact of contacts) {
    try {
      const response = await sendSMS(contact.phone, message, contact)
      
      if (response.success) {
        results.sent++
      } else {
        results.failed++
        results.errors.push(`Failed to send to ${contact.phone}: ${response.error}`)
      }
    } catch (error) {
      results.failed++
      results.errors.push(`Error sending to ${contact.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    processed++
    if (onProgress) {
      onProgress((processed / total) * 100)
    }
  }

  results.success = results.failed === 0
  return results
} 