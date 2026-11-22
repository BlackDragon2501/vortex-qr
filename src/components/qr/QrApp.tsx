'use client'

// Vortex QR - Generador de codigos QR 100% local.
// URL, texto, WiFi, vCard, email, telefono y SMS con colores, tamano,
// margen y correccion de error configurables. Descarga en PNG o SVG.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  QrCode,
  Download,
  Copy,
  Check,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  User,
  Link2,
  Type as TypeIcon,
} from 'lucide-react'
import { buildPayload, payloadReady, QR_TYPE_LABELS, type QrFields, type QrType } from '@/lib/qr'

const SUPPORT_EMAIL = 'vortexmusic.soporte.app@gmail.com'

function VortexLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#161616" />
      <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" strokeWidth="3" />
      <rect x="28" y="8" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" strokeWidth="3" />
      <rect x="8" y="28" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" strokeWidth="3" />
      <rect x="28" y="28" width="5" height="5" fill="#fbbf24" />
      <rect x="35" y="35" width="5" height="5" fill="#fbbf24" />
      <rect x="35" y="28" width="5" height="5" fill="#fbbf24" />
      <rect x="28" y="35" width="5" height="5" fill="#fbbf24" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-[#2b2b31] bg-[#17171a] px-4 py-3 mt-auto">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <VortexLogo className="w-5 h-5" />
          <span className="text-xs text-[#9b9ba4]">Vortex Company · Suite Vórtex · Gratis, sin anuncios, 100% local</span>
        </div>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[11px] text-[#fbbf24] hover:underline">
          Soporte: {SUPPORT_EMAIL}
        </a>
        <span className="text-[10px] text-[#6b6b74]">© 2026 Vortex Company</span>
      </div>
    </footer>
  )
}

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-1.5 text-xs font-medium text-[#ececf1] hover:border-[#f59e0b]/60 hover:bg-[#2b2b31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const input =
  'w-full rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#ececf1] placeholder:text-[#6b6b74] outline-none focus:border-[#8b5cf6]'

const TYPE_ICONS: Record<QrType, React.ComponentType<{ className?: string }>> = {
  url: Link2,
  text: TypeIcon,
  wifi: Wifi,
  vcard: User,
  email: Mail,
  tel: Phone,
  sms: MessageSquare,
}

export default function QrApp() {
  const [type, setType] = useState<QrType>('url')
  const [fields, setFields] = useState<QrFields>({
    url: 'https://vortex-portal.vercel.app',
    text: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    wifiHidden: false,
    vcardName: '',
    vcardOrg: '',
    vcardTel: '',
    vcardEmail: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    telNumber: '',
    smsNumber: '',
    smsMessage: '',
  })
  const [dark, setDark] = useState('#0f0f10')
  const [light, setLight] = useState('#ffffff')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(2)
  const [ecLevel, setEcLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const payload = useMemo(() => buildPayload(type, fields), [type, fields])
  const valid = useMemo(() => payloadReady(type, fields), [type, fields])

  useEffect(() => {
    if (!valid || !canvasRef.current) return
    let alive = true
    setError('')
    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      margin,
      errorCorrectionLevel: ecLevel,
      color: { dark, light },
    })
      .then(() => {
        if (alive) setReady(true)
      })
      .catch(() => {
        if (alive) {
          setReady(false)
          setError('El contenido es demasiado largo para un QR con esta correccion de error. Reduce el texto o baja a L/M.')
        }
      })
    return () => {
      alive = false
    }
  }, [payload, valid, size, margin, ecLevel, dark, light])

  const downloadPng = useCallback(() => {
    if (!canvasRef.current || !ready) return
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'vortex-qr.png'
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }, [ready])

  const downloadSvg = useCallback(async () => {
    if (!valid) return
    try {
      const svg = await QRCode.toString(payload, {
        type: 'svg',
        margin,
        errorCorrectionLevel: ecLevel,
        color: { dark, light },
        width: size,
      })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'vortex-qr.svg'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      setError('No se pudo generar el SVG con este contenido.')
    }
  }, [payload, valid, margin, ecLevel, dark, light, size])

  const copyImage = useCallback(async () => {
    if (!canvasRef.current || !ready) return
    try {
      const blob = await new Promise<Blob | null>((res) => canvasRef.current!.toBlob(res, 'image/png'))
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Tu navegador no permite copiar imagenes al portapapeles. Usa Descargar PNG.')
    }
  }, [ready])

  const setF = (patch: Partial<QrFields>) => setFields((f) => ({ ...f, ...patch }))

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0f0f10] text-[#ececf1]">
      <header className="border-b border-[#2b2b31] bg-[#17171a]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <VortexLogo className="w-8 h-8" />
          <div className="flex-1">
            <h1 className="text-base font-bold tracking-tight">Vórtex QR</h1>
            <p className="text-[11px] text-[#9b9ba4]">Genera tus códigos, sin límites</p>
          </div>
          <span className="rounded-full border border-[#2b2b31] bg-[#1e1e22] px-2.5 py-1 text-[10px] text-[#9b9ba4]">
            100% local
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 space-y-5">
        {/* tipo de contenido */}
        <section className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#9b9ba4] uppercase tracking-wider">Contenido</h2>
          <div className="flex flex-wrap gap-1.5">
            {QR_TYPE_LABELS.map((t) => {
              const Icon = TYPE_ICONS[t.id]
              return (
                <button
                  key={t.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === t.id
                      ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#fbbf24]'
                      : 'border-[#2b2b31] bg-[#1e1e22] text-[#9b9ba4] hover:border-[#f59e0b]/50'
                  }`}
                  onClick={() => setType(t.id)}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden /> {t.label}
                </button>
              )
            })}
          </div>

          {type === 'url' && (
            <input className={input} placeholder="https://tu-pagina.com" value={fields.url} onChange={(e) => setF({ url: e.target.value })} />
          )}
          {type === 'text' && (
            <textarea className={input + ' min-h-24 resize-y'} placeholder="Escribe el texto a codificar..." value={fields.text} onChange={(e) => setF({ text: e.target.value })} />
          )}
          {type === 'wifi' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={input} placeholder="Nombre de la red (SSID)" value={fields.wifiSsid} onChange={(e) => setF({ wifiSsid: e.target.value })} />
              <input className={input} type="password" placeholder="Contrasena" value={fields.wifiPassword} disabled={fields.wifiEncryption === 'nopass'} onChange={(e) => setF({ wifiPassword: e.target.value })} />
              <select className={input} value={fields.wifiEncryption} onChange={(e) => setF({ wifiEncryption: e.target.value as QrFields['wifiEncryption'] })}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sin contrasena</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-[#9b9ba4]">
                <input type="checkbox" className="accent-[#f59e0b]" checked={fields.wifiHidden} onChange={(e) => setF({ wifiHidden: e.target.checked })} />
                Red oculta
              </label>
            </div>
          )}
          {type === 'vcard' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={input} placeholder="Nombre completo" value={fields.vcardName} onChange={(e) => setF({ vcardName: e.target.value })} />
              <input className={input} placeholder="Empresa (opcional)" value={fields.vcardOrg} onChange={(e) => setF({ vcardOrg: e.target.value })} />
              <input className={input} placeholder="Telefono" value={fields.vcardTel} onChange={(e) => setF({ vcardTel: e.target.value })} />
              <input className={input} placeholder="Email" value={fields.vcardEmail} onChange={(e) => setF({ vcardEmail: e.target.value })} />
            </div>
          )}
          {type === 'email' && (
            <div className="grid gap-2">
              <input className={input} placeholder="Destinatario" value={fields.emailTo} onChange={(e) => setF({ emailTo: e.target.value })} />
              <input className={input} placeholder="Asunto (opcional)" value={fields.emailSubject} onChange={(e) => setF({ emailSubject: e.target.value })} />
              <textarea className={input + ' min-h-16 resize-y'} placeholder="Mensaje (opcional)" value={fields.emailBody} onChange={(e) => setF({ emailBody: e.target.value })} />
            </div>
          )}
          {type === 'tel' && (
            <input className={input} placeholder="+34 600 000 000" value={fields.telNumber} onChange={(e) => setF({ telNumber: e.target.value })} />
          )}
          {type === 'sms' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={input} placeholder="Numero" value={fields.smsNumber} onChange={(e) => setF({ smsNumber: e.target.value })} />
              <input className={input} placeholder="Mensaje (opcional)" value={fields.smsMessage} onChange={(e) => setF({ smsMessage: e.target.value })} />
            </div>
          )}
        </section>

        {/* personalizacion */}
        <section className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#9b9ba4] uppercase tracking-wider">Estilo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2">
              <label htmlFor="qr-dark" className="text-xs text-[#9b9ba4]">Color del codigo</label>
              <input id="qr-dark" type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-[#2b2b31] bg-transparent" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2">
              <label htmlFor="qr-light" className="text-xs text-[#9b9ba4]">Color de fondo</label>
              <input id="qr-light" type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-[#2b2b31] bg-transparent" />
            </div>
            <label className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#9b9ba4]">
              Tamano
              <span className="flex items-center gap-2">
                <input type="range" min={256} max={1024} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-[#f59e0b] w-32" />
                <span className="tabular-nums w-14 text-right text-[#ececf1]">{size}px</span>
              </span>
            </label>
            <label className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#9b9ba4]">
              Margen
              <span className="flex items-center gap-2">
                <input type="range" min={0} max={8} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="accent-[#f59e0b] w-32" />
                <span className="tabular-nums w-14 text-right text-[#ececf1]">{margin}</span>
              </span>
            </label>
            <label className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#9b9ba4]">
              Correccion de error
              <select className="rounded border border-[#2b2b31] bg-[#17171a] px-2 py-1 text-xs text-[#ececf1] outline-none" value={ecLevel} onChange={(e) => setEcLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}>
                <option value="L">L · 7%</option>
                <option value="M">M · 15%</option>
                <option value="Q">Q · 25%</option>
                <option value="H">H · 30%</option>
              </select>
            </label>
          </div>
        </section>

        {/* vista previa */}
        <section className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#9b9ba4] uppercase tracking-wider">Vista previa</h2>
          {valid ? (
            <div className="flex flex-col items-center gap-3">
              <canvas ref={canvasRef} className="max-w-full rounded-lg border border-[#2b2b31]" style={{ width: Math.min(size, 320) }} />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <div className="flex flex-wrap justify-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#f59e0b] px-3.5 py-2 text-xs font-semibold text-[#27190a] hover:bg-[#fbbf24] transition-colors" onClick={downloadPng} disabled={!ready}>
                  <Download className="w-4 h-4" aria-hidden /> Descargar PNG
                </button>
                <button className={btn} onClick={downloadSvg} disabled={!ready}>
                  <Download className="w-4 h-4" aria-hidden /> Descargar SVG (vector)
                </button>
                <button className={btn} onClick={copyImage} disabled={!ready}>
                  {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                  {copied ? 'Copiado' : 'Copiar imagen'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <QrCode className="w-10 h-10 text-[#6b6b74]" aria-hidden />
              <p className="text-xs text-[#9b9ba4]">Rellena el contenido para ver el codigo QR en vivo.</p>
            </div>
          )}
          <p className="text-[11px] text-[#9b9ba4]">
            Todo se genera en tu navegador: ningun dato sale de tu dispositivo.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
