import { flattenItems } from "./storage.js";

export const elements = {
  storageStatus: document.querySelector("#storageStatus"),
  notesCount: document.querySelector("#notesCount"),
  itemsCount: document.querySelector("#itemsCount"),
  totalSpent: document.querySelector("#totalSpent"),
  startScannerBtn: document.querySelector("#startScannerBtn"),
  stopScannerBtn: document.querySelector("#stopScannerBtn"),
  retryFetchBtn: document.querySelector("#retryFetchBtn"),
  qrUrlInput: document.querySelector("#qrUrlInput"),
  xmlFileInput: document.querySelector("#xmlFileInput"),
  xmlTextInput: document.querySelector("#xmlTextInput"),
  importTextBtn: document.querySelector("#importTextBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  tableHint: document.querySelector("#tableHint"),
  itemsTableBody: document.querySelector("#itemsTableBody"),
  toast: document.querySelector("#toast")
};

export function bindUiEvents(handlers) {
  elements.startScannerBtn.addEventListener("click", handlers.onStartScanner);
  elements.stopScannerBtn.addEventListener("click", handlers.onStopScanner);
  elements.retryFetchBtn.addEventListener("click", handlers.onRetryFetch);
  elements.xmlFileInput.addEventListener("change", handlers.onXmlFiles);
  elements.importTextBtn.addEventListener("click", handlers.onImportText);
  elements.exportBtn.addEventListener("click", handlers.onExport);
  elements.clearBtn.addEventListener("click", handlers.onClear);

  elements.qrUrlInput.addEventListener("change", (event) => {
    handlers.onQrUrlChange(event.target.value.trim());
  });
}

export function render(notes) {
  const items = flattenItems(notes);
  const total = items.reduce((sum, item) => sum + item.totalValue, 0);

  elements.notesCount.textContent = notes.length;
  elements.itemsCount.textContent = items.length;
  elements.totalSpent.textContent = formatCurrency(total);
  elements.exportBtn.disabled = !items.length;
  elements.clearBtn.disabled = !notes.length;
  elements.tableHint.textContent = items.length
    ? `${items.length} item(ns) em ${notes.length} nota(s).`
    : "Nenhuma nota importada ainda.";

  renderTable(items);
}

export function showToast(message, type = "success") {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type === "success" ? "" : type}`;

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.className = "toast";
  }, 4200);
}

function renderTable(items) {
  elements.itemsTableBody.innerHTML = "";

  if (!items.length) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = '<td colspan="6">Importe um XML ou leia uma NFC-e para comecar.</td>';
    elements.itemsTableBody.appendChild(row);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.purchaseDate || "-")}</td>
      <td>${escapeHtml(item.establishment)}</td>
      <td>${escapeHtml(item.productName)}</td>
      <td>${formatNumber(item.quantity)}</td>
      <td>${formatCurrency(item.unitValue)}</td>
      <td>${formatCurrency(item.totalValue)}</td>
    `;
    fragment.appendChild(row);
  }

  elements.itemsTableBody.appendChild(fragment);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  }).format(value || 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
