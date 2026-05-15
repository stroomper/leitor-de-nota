export function exportItemsToExcel(items) {
  if (!items.length) {
    return { ok: false, message: "Nao ha itens para exportar." };
  }

  if (!window.XLSX) {
    return {
      ok: false,
      message: "A biblioteca de Excel ainda nao carregou. Tente novamente em alguns segundos."
    };
  }

  const rows = items.map((item) => ({
    "Data da compra": item.purchaseDate,
    Estabelecimento: item.establishment,
    Produto: item.productName,
    Quantidade: item.quantity,
    "Valor unitario": item.unitValue,
    "Valor total": item.totalValue,
    "ID da nota": item.noteId,
    Origem: item.source
  }));

  // SheetJS transforma os objetos da tabela em uma planilha XLSX baixavel.
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Itens NFC-e");
  XLSX.writeFile(workbook, `notas-nfce-${new Date().toISOString().slice(0, 10)}.xlsx`);

  return { ok: true, message: "Arquivo Excel gerado." };
}
