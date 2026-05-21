const SHEETS = {
  CONFIG: "config",
  LINKS: "links",
  UPDATES: "updates",
  LEARNING_MEDIA: "learning_media",
  WORKS: "works",
  CERTIFICATES: "certificates",
  SAR_STANDARDS: "sar_standards",
  EVIDENCE: "evidence",
};

function doGet(event) {
  const data = buildPortfolioData_();
  const callback = event && event.parameter && event.parameter.callback;
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(data)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildPortfolioData_() {
  return {
    site: readConfig_(),
    links: readLinks_(),
    latestUpdates: readRows_(SHEETS.UPDATES).map((row) => ({
      date: row.date,
      title: row.title,
      detail: row.detail,
      link: row.link,
    })),
    learningMediaFolders: readRows_(SHEETS.LEARNING_MEDIA).map((row) => ({
      title: row.title,
      url: row.drive_url || row.url,
      subject: row.subject,
      grade: row.grade,
      description: row.description,
    })),
    works: readRows_(SHEETS.WORKS),
    certificates: readRows_(SHEETS.CERTIFICATES),
    sarStandards: readRows_(SHEETS.SAR_STANDARDS),
    evidence: readRows_(SHEETS.EVIDENCE),
    updatedAt: new Date().toISOString(),
  };
}

function readConfig_() {
  const rows = readRows_(SHEETS.CONFIG, false);
  return rows.reduce((config, row) => {
    if (row.key) config[row.key] = row.value || "";
    return config;
  }, {});
}

function readLinks_() {
  const rows = readRows_(SHEETS.LINKS);
  return rows.reduce((links, row) => {
    if (row.key && row.url) links[row.key] = row.url;
    return links;
  }, {});
}

function readRows_(sheetName, onlyShown) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map((header) => normalizeHeader_(header));
  const rows = values.slice(1).map((valuesRow) => {
    return headers.reduce((record, header, index) => {
      if (header) record[header] = valuesRow[index] || "";
      return record;
    }, {});
  });

  return rows
    .filter((row) => Object.values(row).some(Boolean))
    .filter((row) => onlyShown === false || (row.status || "show").toLowerCase() === "show")
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
}

function normalizeHeader_(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}
