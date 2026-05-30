const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const RAW = path.join(ROOT, "raw");
const OUTPUT = path.join(ROOT, "corpus.csv");

const LANGUAGES = {
  english: { manualColumn: "english", floresCode: "eng_Latn", masakhanewsCode: "eng" },
  yoruba: { manualColumn: "yoruba", floresCode: "yor_Latn", masakhanewsCode: "yor" },
  hausa: { manualColumn: "hausa", floresCode: "hau_Latn", masakhanewsCode: "hau" },
  igbo: { manualColumn: "igbo", floresCode: "ibo_Latn", masakhanewsCode: "ibo" },
};

function cleanText(text) {
  return String(text || "").replace(/^\uFEFF/, "").trim().replace(/\s+/g, " ");
}

function parseCsvLine(line, delimiter = ",") {
  const values = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseDelimited(content, delimiter = ",") {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  const headers = parseCsvLine(lines[0], delimiter);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function addRow(rows, text, language, source, domain = "", intent = "") {
  const cleaned = cleanText(text);
  if (cleaned.length < 3) return;
  rows.push({ text: cleaned, language, source, domain, intent });
}

function loadManualHealthcare() {
  const content = fs.readFileSync(path.join(ROOT, "manual_healthcare_samples.csv"), "utf8");
  const sourceRows = parseDelimited(content, ",");
  const rows = [];

  for (const item of sourceRows) {
    for (const [language, config] of Object.entries(LANGUAGES)) {
      addRow(
        rows,
        item[config.manualColumn],
        language,
        "manual_healthcare_google_translate",
        item.domain,
        item.intent,
      );
    }
  }

  return rows;
}

function loadManualStressTraining() {
  const content = fs.readFileSync(path.join(ROOT, "manual_stress_training_samples.csv"), "utf8");
  const sourceRows = parseDelimited(content, ",");
  const rows = [];

  for (const item of sourceRows) {
    addRow(
      rows,
      item.text,
      item.language,
      "manual_stress_training",
      item.domain,
      item.case_type,
    );
  }

  return rows;
}

function loadFlores() {
  const rows = [];
  const base = path.join(RAW, "flores", "flores200_dataset");

  for (const [language, config] of Object.entries(LANGUAGES)) {
    for (const split of ["dev", "devtest"]) {
      const filePath = path.join(base, split, `${config.floresCode}.${split}`);
      const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        addRow(rows, line, language, `flores200_${split}`, "general", "");
      }
    }
  }

  return rows;
}

function loadMasakhanews(maxPerLanguage = 1000) {
  const rows = [];

  for (const [language, config] of Object.entries(LANGUAGES)) {
    const languageRows = [];
    const folder = path.join(RAW, "masakhanews", config.masakhanewsCode);

    for (const split of ["train", "dev", "test"]) {
      const filePath = path.join(folder, `${split}.tsv`);
      const content = fs.readFileSync(filePath, "utf8");
      const sourceRows = parseDelimited(content, "\t");
      for (const item of sourceRows) {
        addRow(
          languageRows,
          `${item.headline || ""} ${item.text || ""}`,
          language,
          `masakhanews_${split}`,
          item.category || "",
          "",
        );
      }
    }

    rows.push(...languageRows.slice(0, maxPerLanguage));
  }

  return rows;
}

function deduplicate(rows) {
  const seen = new Set();
  const unique = [];

  for (const row of rows) {
    const key = `${row.language}\u0000${row.text.toLocaleLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  return unique;
}

function balanceRows(rows) {
  const grouped = Object.fromEntries(Object.keys(LANGUAGES).map((language) => [language, []]));
  for (const row of rows) grouped[row.language].push(row);
  const target = Math.min(...Object.values(grouped).map((items) => items.length));
  return Object.values(grouped).flatMap((items) => items.slice(0, target));
}

function writeCorpus(rows) {
  const headers = ["text", "language", "source", "domain", "intent"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(OUTPUT, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  let rows = [
    ...loadManualHealthcare(),
    ...loadManualStressTraining(),
    ...loadFlores(),
    ...loadMasakhanews(1000),
  ];

  rows = deduplicate(rows);
  rows = balanceRows(rows);
  writeCorpus(rows);

  console.log(`Saved: ${OUTPUT}`);
  console.log(`Total rows: ${rows.length}`);
  for (const language of Object.keys(LANGUAGES)) {
    console.log(`${language}: ${rows.filter((row) => row.language === language).length}`);
  }
}

main();
