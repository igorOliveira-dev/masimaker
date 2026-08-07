"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
import Modal from "@/app/dashboard/components/Modal";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export default function QrCodeModal({ isOpen, onClose, slug }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pageUrl = `https://${slug}.masimaker.com`;

  useEffect(() => {
    if (!isOpen || !slug) return;

    QRCode.toDataURL(pageUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("Erro ao gerar QR code:", err));
  }, [isOpen, slug, pageUrl]);

  // Reseta o estado de "copiado" ao fechar
  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAccess = () => {
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access the page" maxWidth="max-w-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-center bg-white rounded-lg p-4 border-2 border-(--foreground)/10">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR code de ${pageUrl}`} className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-sm text-(--foreground)/60">
              Generating QR code...
            </div>
          )}
        </div>

        <p className="text-sm text-(--foreground)/80 break-all text-center">{pageUrl}</p>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleCopyLink}
            className="cursor-pointer w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-(--foreground)/10 hover:bg-(--foreground)/10 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Link copied!" : "Copy link"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="cursor-pointer w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-(--foreground)/10 hover:bg-(--foreground)/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Download QR code
          </button>

          <button
            onClick={handleAccess}
            className="cursor-pointer w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            <ExternalLink size={18} />
            Access page
          </button>
        </div>
      </div>
    </Modal>
  );
}
