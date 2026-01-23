import { X, Download, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRModal({ isOpen, onClose, link }) {
    if (!isOpen || !link) return null

    const fullUrl = `${window.location.origin}/${link.short_code}`

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg")
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL("image/png")
            const downloadLink = document.createElement("a")
            downloadLink.download = `qrcode-${link.short_code}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }
        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">QR Code</h3>
                <p className="text-sm text-gray-500 mb-6">Scan to visit {fullUrl}</p>

                <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-center mb-6">
                    <QRCodeSVG
                        id="qr-code-svg"
                        value={fullUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={downloadQR}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download
                    </button>
                    <button className="px-4 py-2 border border-gray-200 dark:border-zinc-600 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
