
const sheetURL = "https://script.google.com/macros/s/AKfycbzKJBAbEezUCNCtLeN7cjlR3kKrl2eOcH24V6kYnLvMal5nTb2LU39IEsSOQ5UtyqnS5Q/exec";
let allAccounts = [];

function loadData() {
  fetch(sheetURL)
    .then(res => res.json())
    .then(data => {
      allAccounts = data.map(d => ({
        name: d.name || "",
        title: d.accountTitle || "",
        number: d.accountNumber || "",
        iban: d.iban || "",
        bank: d.bankName || ""
      }));
      renderTable(allAccounts);
      populateBankDropdown(allAccounts);  // ← 🔹 یہاں لگائیں
    })
    .catch(err => console.error("Error loading data:", err));
}

function renderTable(data) {
  const container = document.getElementById("reportTable");
  container.innerHTML = "";

  data.forEach(acc => {
    const bankKey = acc.bank.toLowerCase();
    const logoPath = `images/${bankKey}.png`;
    const bankName = acc.bank.toUpperCase();

    const div = document.createElement("div");
    div.className = "card";
    div.style = `
      background: #fdfdfd;
      margin: 10px auto;
      padding: 14px 18px;
      border: 1px solid #ccc;
      border-left: 6px solid #4a148c;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      max-width: 750px;
      font-size: 20px;
      direction: rtl;
      page-break-inside: avoid;
    `;

    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <img src="${logoPath}" alt="${bankName}" style="width:34px; height:34px;">
        <strong style="font-size: 24px; color:#4a148c;">${bankName}</strong>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding-bottom: 6px;">
          <span>
            <span style="font-size: 24px; font-weight: bold; color: #00695c;">🏷️ ٹائٹل:</span>
            <span style="font-size: 20px; color: #1a237e;"> ${acc.title}</span>
          </span>
          <span>
            <span style="font-size: 24px; font-weight: bold; color: #bf360c">👤 نام:</span>
            <span style="font-size: 20px; color: #1b5e20;"> ${acc.name}</span>
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 6px;">
          <span>
            <span style="font-size: 24px; font-weight: bold; color: #4e342e;">🔢 نمبر:</span>
            <span style="font-size: 20px; color: #0d47a1;"> ${acc.number}</span>
            <button class="copy-btn" onclick="copyText('${acc.number}')">📋</button>
          </span>
          <span>
            <span style="font-size: 24px; font-weight: bold; color: #37474f;">IBAN:</span>
            <span style="font-size: 20px; color: #33691e;"> ${acc.iban}</span>
            <button class="copy-btn" onclick="copyText('${acc.iban}')">📋</button>
          </span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function populateBankDropdown(data) {
  const bankSet = new Set(data.map(acc => acc.bank.toLowerCase()));
  const dropdown = document.getElementById("searchBank");
  dropdown.innerHTML = '<option value="">📌 بینک منتخب کریں</option>';

  Array.from(bankSet).sort().forEach(bank => {
    const option = document.createElement("option");
    option.value = bank;
    option.textContent = bank.toUpperCase();
    dropdown.appendChild(option);
  });
}


function applyFilters() {
  const name = document.getElementById("searchName").value.toLowerCase();
  const title = document.getElementById("searchTitle").value.toLowerCase();
  const bank = document.getElementById("searchBank").value.toLowerCase();

  const filtered = allAccounts.filter(acc =>
    acc.name.toLowerCase().includes(name) &&
    acc.title.toLowerCase().includes(title) &&
    (bank === "" || acc.bank.toLowerCase() === bank)
  );
  renderTable(filtered);
}

function saveAsPDF() {
  const element = document.getElementById("reportContent"); // ← یہ بدل دیں
  if (!element) {
    alert("ڈیٹا موجود نہیں، پہلے لوڈ کریں");
    return;
  }

  const opt = {
    margin: 0.3,
    filename: 'Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

async function shareReport() {
  const element = document.getElementById("reportTable");

  const opt = {
    margin: 0.3,
    filename: 'Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
  };

  const worker = html2pdf().set(opt).from(element);
  const pdfBlob = await worker.outputPdf('blob');

  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], 'Report.pdf', { type: 'application/pdf' })] })) {
    try {
      await navigator.share({
        title: 'بینک رپورٹ',
        text: 'براہ کرم یہ رپورٹ ملاحظہ فرمائیں',
        files: [new File([pdfBlob], 'Report.pdf', { type: 'application/pdf' })]
      });
    } catch (err) {
      alert("شیئرنگ منسوخ کر دی گئی یا سپورٹ نہیں ہے");
    }
  } else {
    alert("آپ کا براؤزر PDF شیئر کرنے کی سہولت نہیں دیتا۔ براہ کرم دستی طور پر Save کریں");
  }
}
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("کاپی ہو گیا: " + text);
  });
}

window.onload = loadData;
