// Constructor de contenidos QR: texto plano, URL, WiFi, vCard, email,
// telefono y SMS. Todo se genera localmente en el navegador.

export type QrType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'tel' | 'sms'

export interface QrFields {
  url: string
  text: string
  wifiSsid: string
  wifiPassword: string
  wifiEncryption: 'WPA' | 'WEP' | 'nopass'
  wifiHidden: boolean
  vcardName: string
  vcardOrg: string
  vcardTel: string
  vcardEmail: string
  emailTo: string
  emailSubject: string
  emailBody: string
  telNumber: string
  smsNumber: string
  smsMessage: string
}

export const QR_TYPE_LABELS: { id: QrType; label: string }[] = [
  { id: 'url', label: 'URL' },
  { id: 'text', label: 'Texto' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'vcard', label: 'Contacto' },
  { id: 'email', label: 'Email' },
  { id: 'tel', label: 'Telefono' },
  { id: 'sms', label: 'SMS' },
]

/** escapa los caracteres especiales del formato WiFi (:) */
function escWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, '\\$1')
}

/** escapa saltos de linea en campos vCard */
function escVcard(v: string): string {
  return v.replace(/\r?\n/g, '\\n')
}

export function buildPayload(type: QrType, f: QrFields): string {
  switch (type) {
    case 'url':
      return f.url.trim()
    case 'text':
      return f.text
    case 'wifi': {
      const parts = [`T:${f.wifiEncryption}`, `S:${escWifi(f.wifiSsid)}`]
      if (f.wifiEncryption !== 'nopass') parts.push(`P:${escWifi(f.wifiPassword)}`)
      if (f.wifiHidden) parts.push('H:true')
      return `WIFI:${parts.join(';')};;`
    }
    case 'vcard': {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escVcard(f.vcardName)}`]
      if (f.vcardOrg.trim()) lines.push(`ORG:${escVcard(f.vcardOrg)}`)
      if (f.vcardTel.trim()) lines.push(`TEL:${f.vcardTel.trim()}`)
      if (f.vcardEmail.trim()) lines.push(`EMAIL:${f.vcardEmail.trim()}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    case 'email': {
      const params: string[] = []
      if (f.emailSubject.trim()) params.push(`subject=${encodeURIComponent(f.emailSubject)}`)
      if (f.emailBody.trim()) params.push(`body=${encodeURIComponent(f.emailBody)}`)
      return `mailto:${f.emailTo.trim()}${params.length ? '?' + params.join('&') : ''}`
    }
    case 'tel':
      return `tel:${f.telNumber.replace(/\s+/g, '')}`
    case 'sms':
      return `SMSTO:${f.smsNumber.replace(/\s+/g, '')}:${f.smsMessage}`
  }
}

/** valida que el contenido del tipo activo no este vacio */
export function payloadReady(type: QrType, f: QrFields): boolean {
  switch (type) {
    case 'url':
      return f.url.trim().length > 0
    case 'text':
      return f.text.trim().length > 0
    case 'wifi':
      return f.wifiSsid.trim().length > 0 && (f.wifiEncryption === 'nopass' || f.wifiPassword.length > 0)
    case 'vcard':
      return f.vcardName.trim().length > 0
    case 'email':
      return f.emailTo.trim().length > 0
    case 'tel':
      return f.telNumber.trim().length > 0
    case 'sms':
      return f.smsNumber.trim().length > 0
  }
}
