export function importXmlText(xmlText, source = "XML") {
  if (!looksLikeXml(xmlText)) {
    return {
      ok: false,
      type: "error",
      message: "O conteudo informado nao parece ser um XML valido."
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  if (doc.querySelector("parsererror")) {
    return {
      ok: false,
      type: "error",
      message: "Nao consegui interpretar esse XML. Verifique se o arquivo esta completo."
    };
  }

  const note = parseNfceXml(doc, source);

  if (!note.items.length) {
    return {
      ok: false,
      type: "warn",
      message: "XML reconhecido, mas nenhum item de produto foi encontrado."
    };
  }

  return { ok: true, note };
}

export function looksLikeXml(content) {
  return /^\s*<\?xml|^\s*<[^>]+>/i.test(content);
}

export function findXmlUrl(html, baseUrl) {
  const match = html.match(/https?:\/\/[^"']+\.xml[^"']*/i) || html.match(/href=["']([^"']*xml[^"']*)["']/i);

  if (!match) {
    return "";
  }

  try {
    return new URL(match[1] || match[0], baseUrl).href;
  } catch (error) {
    return "";
  }
}

function parseNfceXml(doc, source) {
  const infNFe = firstElement(doc, "infNFe");
  const noteId = infNFe?.getAttribute("Id") || createId();
  const establishment = textFrom(doc, "emit xNome") || textFrom(doc, "xNome") || "Nao informado";
  const rawDate = textFrom(doc, "ide dhEmi") || textFrom(doc, "dhEmi") || textFrom(doc, "ide dEmi") || "";
  const purchaseDate = normalizeDate(rawDate);

  const items = findElements(doc, "det").map((det, index) => {
    const productNode = firstElement(det, "prod") || det;

    return {
      id: `${noteId}-${index + 1}`,
      productName: textFrom(productNode, "xProd") || "Produto sem nome",
      quantity: toNumber(textFrom(productNode, "qCom")),
      unitValue: toNumber(textFrom(productNode, "vUnCom")),
      totalValue: toNumber(textFrom(productNode, "vProd")),
      purchaseDate,
      establishment
    };
  });

  return {
    id: noteId.replace(/^NFe/i, ""),
    source,
    importedAt: new Date().toISOString(),
    purchaseDate,
    establishment,
    items
  };
}

function firstElement(root, selector) {
  const parts = selector.split(" ");
  let current = root;

  for (const part of parts) {
    current = findElements(current, part)[0];
  }

  return current || null;
}

// Busca por localName para funcionar com XMLs com namespace, como nfe:det ou det.
function findElements(root, tagName) {
  return Array.from(root?.getElementsByTagName("*") || []).filter((element) => element.localName === tagName);
}

function textFrom(root, selector) {
  return firstElement(root, selector)?.textContent?.trim() || "";
}

function toNumber(value) {
  if (!value) {
    return 0;
  }

  return Number(String(value).replace(",", ".")) || 0;
}

function normalizeDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("pt-BR");
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }

  return value;
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `nfce-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
