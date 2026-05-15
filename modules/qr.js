import { findXmlUrl, looksLikeXml } from "./xml.js";

export function createQrScanner({ readerId, onRead, onStarted, onStopped, onError }) {
  let instance = null;

  return {
    async start() {
      if (!window.Html5Qrcode) {
        onError("A biblioteca de leitura QR Code ainda nao carregou. Tente novamente em alguns segundos.");
        return;
      }

      try {
        instance = instance || new Html5Qrcode(readerId);

        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: getQrBoxSize(), aspectRatio: 1 },
          onRead,
          () => {}
        );

        onStarted();
      } catch (error) {
        console.error(error);
        onError("Nao foi possivel acessar a camera. Verifique a permissao do navegador.");
      }
    },

    async stop() {
      if (!instance || !instance.isScanning) {
        return;
      }

      try {
        await instance.stop();
        onStopped();
      } catch (error) {
        console.error(error);
        onError("Nao foi possivel parar a camera agora.");
      }
    }
  };
}

export async function fetchNfceUrl(url) {
  // Muitas SEFAZ bloqueiam CORS; o app trata essa falha e permite importar XML manualmente.
  const response = await fetch(url, { mode: "cors" });
  const content = await response.text();

  if (!response.ok) {
    throw new Error("Resposta invalida da SEFAZ.");
  }

  if (looksLikeXml(content)) {
    return { type: "xml", content };
  }

  const xmlUrl = findXmlUrl(content, url);

  if (xmlUrl) {
    return { type: "xml-url", url: xmlUrl };
  }

  return { type: "html", content };
}

function getQrBoxSize() {
  const width = Math.min(window.innerWidth - 64, 280);
  return { width, height: width };
}
