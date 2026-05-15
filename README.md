# 📄 Leitor de NFC-e (QR Code + XML → Excel)

Aplicação web simples para leitura de notas fiscais eletrônicas (NFC-e) via QR Code ou importação de XML, com exportação dos dados para Excel.

---

## 🚀 Funcionalidades

- Leitura de QR Code de NFC-e via câmera
- Extração de chave de acesso da nota fiscal
- Importação manual de arquivos XML
- Extração de dados dos produtos:
  - Nome do produto
  - Quantidade
  - Valor unitário
  - Valor total
- Armazenamento local (LocalStorage)
- Listagem de múltiplas notas
- Exportação de dados para Excel (.xlsx)

---

## 🧠 Como funciona

1. O usuário escaneia o QR Code da NFC-e ou informa a chave de acesso
2. O sistema tenta obter os dados da nota via consulta pública
3. Caso necessário, o usuário pode importar o arquivo XML manualmente
4. Os produtos são extraídos e armazenados localmente
5. Os dados podem ser exportados para Excel

---

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- html5-qrcode (leitura de QR Code)
- SheetJS (exportação Excel)
- LocalStorage (persistência local)

---

## 📱 Compatibilidade

- Navegadores modernos
- Dispositivos móveis (Android / iOS)
- Funciona sem backend

---

## ⚠️ Observações

- A extração automática via QR Code depende da disponibilidade da consulta pública da SEFAZ
- Em alguns casos, pode ser necessário importar o XML manualmente
- Não há armazenamento em nuvem, os dados ficam salvos no próprio dispositivo

---

## 📊 Futuras melhorias

- Transformar em PWA (instalável como app)
- Dashboard com gráficos de gastos
- Categorização automática de produtos
- Sincronização em nuvem
- OCR de notas fiscais

---

## 📄 Licença

Projeto livre para uso pessoal e educacional.
```
