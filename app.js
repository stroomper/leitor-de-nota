import { exportItemsToExcel } from "./modules/excel.js";
import { createQrScanner, fetchNfceUrl } from "./modules/qr.js";
import { flattenItems, loadNotes, saveNotes } from "./modules/storage.js";
import { bindUiEvents, elements, render, showToast } from "./modules/ui.js";
import { importXmlText, looksLikeXml } from "./modules/xml.js";

const state = {
  notes: loadNotes(),
  lastQrUrl: ""
};

const scanner = createQrScanner({
  readerId: "reader",
  onRead: handleQrCodeRead,
  onStarted() {
    elements.startScannerBtn.disabled = true;
    elements.stopScannerBtn.disabled = false;
    elements.storageStatus.textContent = "Lendo";
  },
  onStopped() {
    elements.startScannerBtn.disabled = false;
    elements.stopScannerBtn.disabled = true;
    elements.storageStatus.textContent = "Pronto";
  },
  onError(message) {
    showToast(message, "error");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  bindUiEvents({
    onStartScanner: () => scanner.start(),
    onStopScanner: () => scanner.stop(),
    onRetryFetch: () => tryImportFromUrl(state.lastQrUrl),
    onQrUrlChange: (url) => {
      state.lastQrUrl = url;
      elements.retryFetchBtn.disabled = !state.lastQrUrl;
    },
    onXmlFiles: handleXmlFiles,
    onImportText: importPastedXml,
    onExport: exportExcel,
    onClear: clearHistory
  });

  render(state.notes);
});

async function handleQrCodeRead(decodedText) {
  const url = decodedText.trim();
  state.lastQrUrl = url;
  elements.qrUrlInput.value = url;
  elements.retryFetchBtn.disabled = false;

  showToast("QR Code lido. URL da NFC-e capturada.");
  await scanner.stop();
  await tryImportFromUrl(url);
}

async function tryImportFromUrl(url) {
  if (!url) {
    showToast("Informe uma URL de NFC-e para tentar baixar.", "warn");
    return;
  }

  try {
    const result = await fetchNfceUrl(url);

    if (result.type === "xml") {
      addXmlNote(result.content, url);
      return;
    }

    if (result.type === "xml-url") {
      await tryImportFromUrl(result.url);
      return;
    }

    showToast("A URL foi salva, mas nao trouxe XML legivel. Importe o XML manualmente para extrair os itens.", "warn");
  } catch (error) {
    console.error(error);
    showToast("URL capturada. O navegador pode bloquear o download da NFC-e; importe o XML manualmente.", "warn");
  }
}

async function handleXmlFiles(event) {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    return;
  }

  let imported = 0;

  for (const file of files) {
    try {
      const content = await file.text();

      if (!looksLikeXml(content)) {
        showToast(`${file.name} nao parece ser um XML valido.`, "warn");
        continue;
      }

      if (addXmlNote(content, file.name, { silent: true })) {
        imported += 1;
      }
    } catch (error) {
      console.error(error);
      showToast(`Nao foi possivel ler ${file.name}.`, "error");
    }
  }

  event.target.value = "";
  showToast(`${imported} arquivo(s) XML importado(s).`);
}

function importPastedXml() {
  const content = elements.xmlTextInput.value.trim();

  if (!content) {
    showToast("Cole o XML da NFC-e antes de importar.", "warn");
    return;
  }

  if (addXmlNote(content, "XML colado")) {
    elements.xmlTextInput.value = "";
  }
}

function addXmlNote(xmlText, source = "XML", options = {}) {
  const result = importXmlText(xmlText, source);

  if (!result.ok) {
    showToast(result.message, result.type || "error");
    return false;
  }

  const alreadyExists = state.notes.some((note) => note.id === result.note.id);

  if (alreadyExists) {
    showToast("Essa nota ja foi importada.", "warn");
    return false;
  }

  state.notes.unshift(result.note);
  saveNotes(state.notes);
  elements.storageStatus.textContent = "Salvo";
  render(state.notes);

  if (!options.silent) {
    showToast("Nota importada com sucesso.");
  }

  return true;
}

function exportExcel() {
  const items = flattenItems(state.notes);
  const result = exportItemsToExcel(items);

  showToast(result.message, result.ok ? "success" : "warn");
}

function clearHistory() {
  const confirmed = confirm("Deseja apagar todas as notas importadas?");

  if (!confirmed) {
    return;
  }

  state.notes = [];
  saveNotes(state.notes);
  elements.storageStatus.textContent = "Salvo";
  render(state.notes);
  showToast("Historico apagado.");
}
