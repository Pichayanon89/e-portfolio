const state = {
  user: null,
  works: [],
  client: null,
};

const els = {
  setupNotice: document.querySelector("#setupNotice"),
  authView: document.querySelector("#authView"),
  appView: document.querySelector("#appView"),
  loginForm: document.querySelector("#loginForm"),
  resetPasswordBtn: document.querySelector("#resetPasswordBtn"),
  authMessage: document.querySelector("#authMessage"),
  signOutBtn: document.querySelector("#signOutBtn"),
  workForm: document.querySelector("#workForm"),
  formMode: document.querySelector("#formMode"),
  formMessage: document.querySelector("#formMessage"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  workList: document.querySelector("#workList"),
  searchInput: document.querySelector("#searchInput"),
  yearFilter: document.querySelector("#yearFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  totalCount: document.querySelector("#totalCount"),
  readyCount: document.querySelector("#readyCount"),
  publishedCount: document.querySelector("#publishedCount"),
  latestYear: document.querySelector("#latestYear"),
};

function showSetupNotice() {
  els.setupNotice.classList.toggle("hidden", Boolean(state.client));
}

function setView(authenticated) {
  els.authView.classList.toggle("hidden", authenticated);
  els.appView.classList.toggle("hidden", !authenticated);
  els.signOutBtn.classList.toggle("hidden", !authenticated);
}

function readForm(form) {
  const formData = new FormData(form);
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: formData.get("id") || null,
    teacher_name: formData.get("teacher_name") || "นายพิชญานนท์ วัจนสุนทร",
    position: formData.get("position") || "",
    title: formData.get("title") || "",
    work_date: formData.get("work_date") || null,
    academic_year: formData.get("academic_year") || "",
    semester: formData.get("semester") || "",
    category: formData.get("category") || "",
    work_level: formData.get("work_level") || "",
    pa_indicator: formData.get("pa_indicator") || "",
    sar_standard: formData.get("sar_standard") || "",
    evidence_type: formData.get("evidence_type") || "",
    status: formData.get("status") || "draft",
    evidence_url: normalizeHttpUrl(formData.get("evidence_url") || ""),
    cover_image_url: normalizeHttpUrl(formData.get("cover_image_url") || ""),
    description: formData.get("description") || "",
    notes: formData.get("notes") || "",
    public_on_profile: Boolean(formData.get("public_on_profile")),
    tags,
  };
}

function setForm(work) {
  const form = els.workForm;
  form.elements.id.value = work?.id || "";
  form.elements.teacher_name.value = work?.teacher_name || "นายพิชญานนท์ วัจนสุนทร";
  form.elements.position.value = work?.position || "ครูชำนาญการ";
  form.elements.title.value = work?.title || "";
  form.elements.work_date.value = work?.work_date || "";
  form.elements.academic_year.value = work?.academic_year || "";
  form.elements.semester.value = work?.semester || "";
  form.elements.category.value = work?.category || "";
  form.elements.work_level.value = work?.work_level || "";
  form.elements.pa_indicator.value = work?.pa_indicator || "";
  form.elements.sar_standard.value = work?.sar_standard || "";
  form.elements.evidence_type.value = work?.evidence_type || "";
  form.elements.status.value = work?.status || "draft";
  form.elements.evidence_url.value = work?.evidence_url || "";
  form.elements.cover_image_url.value = work?.cover_image_url || "";
  form.elements.tags.value = Array.isArray(work?.tags) ? work.tags.join(", ") : "";
  form.elements.description.value = work?.description || "";
  form.elements.notes.value = work?.notes || "";
  form.elements.public_on_profile.checked = Boolean(work?.public_on_profile);
  els.formMode.textContent = work ? "แก้ไขผลงาน" : "บันทึกผลงานใหม่";
}

function updateDashboard() {
  const years = state.works.map((work) => work.academic_year).filter(Boolean).sort().reverse();
  els.totalCount.textContent = state.works.length;
  els.readyCount.textContent = state.works.filter((work) => work.status === "ready").length;
  els.publishedCount.textContent = state.works.filter((work) => work.status === "published").length;
  els.latestYear.textContent = years[0] || "-";

  const currentValue = els.yearFilter.value;
  const uniqueYears = [...new Set(years)];
  els.yearFilter.replaceChildren(
    option("", "ทุกปีการศึกษา"),
    ...uniqueYears.map((year) => option(year, year))
  );
  els.yearFilter.value = currentValue;
}

function option(value, label) {
  const el = document.createElement("option");
  el.value = value;
  el.textContent = label;
  return el;
}

function filteredWorks() {
  const search = els.searchInput.value.trim().toLowerCase();
  const year = els.yearFilter.value;
  const status = els.statusFilter.value;

  return state.works.filter((work) => {
    const haystack = [
      work.title,
      work.description,
      work.category,
      work.pa_indicator,
      work.sar_standard,
      work.notes,
      ...(work.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return (!search || haystack.includes(search))
      && (!year || work.academic_year === year)
      && (!status || work.status === status);
  });
}

function renderWorks() {
  updateDashboard();
  const works = filteredWorks();

  if (!works.length) {
    els.workList.replaceChildren(createElement("div", { className: "empty-state", text: "ยังไม่มีรายการที่ตรงกับเงื่อนไข" }));
    return;
  }

  els.workList.replaceChildren(...works.map(renderWorkCard));
}

function renderWorkCard(work) {
  const card = createElement("article", { className: "work-card" });
  const header = createElement("div", { className: "work-card-header" });
  const headerBody = createElement("div");
  const headerMeta = createElement("div", { className: "meta-row" });

  appendTextPill(headerMeta, work.academic_year || "-");
  appendTextPill(headerMeta, work.category || "-");
  headerMeta.append(createElement("span", {
    className: `status-pill ${safeClassName(work.status)}`,
    text: work.status || "draft",
  }));
  if (work.public_on_profile) appendTextPill(headerMeta, "e-Portfolio");

  headerBody.append(
    headerMeta,
    createElement("h3", { text: work.title || "ไม่มีชื่อผลงาน" }),
    createElement("p", { text: work.description || "ไม่มีรายละเอียด" })
  );
  header.append(headerBody);

  const body = createElement("div", { className: "work-card-body" });
  const bodyMeta = createElement("div", { className: "meta-row" });
  [work.pa_indicator, work.sar_standard, work.work_level, work.work_date]
    .filter(Boolean)
    .forEach((value) => appendTextPill(bodyMeta, value));

  const tagRow = createElement("div", { className: "tag-row" });
  (work.tags || []).forEach((tag) => appendTextPill(tagRow, tag));
  body.append(bodyMeta, tagRow);

  const actions = createElement("div", { className: "card-actions" });
  actions.append(createActionButton("edit", work.id, "แก้ไข"));

  const evidenceUrl = normalizeHttpUrl(work.evidence_url || "");
  if (evidenceUrl) {
    const evidenceLink = createElement("a", { text: "เปิดหลักฐาน" });
    evidenceLink.href = evidenceUrl;
    evidenceLink.target = "_blank";
    evidenceLink.rel = "noreferrer noopener";
    actions.append(evidenceLink);
  }

  actions.append(createActionButton("delete", work.id, "ลบ", "delete"));
  card.append(header, body, actions);
  return card;
}

function createElement(tagName, options = {}) {
  const el = document.createElement(tagName);
  if (options.className) el.className = options.className;
  if (Object.hasOwn(options, "text")) el.textContent = options.text;
  return el;
}

function appendTextPill(parent, text) {
  parent.append(createElement("span", { text: String(text || "-") }));
}

function createActionButton(action, id, label, className = "") {
  const button = createElement("button", { className, text: label });
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function normalizeHttpUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeClassName(value) {
  return String(value || "").replace(/[^a-z0-9_-]/gi, "");
}

async function loadWorks() {
  const { data, error } = await state.client
    .from("portfolio_works")
    .select("*")
    .is("deleted_at", null)
    .order("work_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  state.works = data || [];
  renderWorks();
}

async function saveWork(event) {
  event.preventDefault();
  const record = readForm(els.workForm);
  const id = record.id;
  delete record.id;

  if (els.workForm.elements.evidence_url.value && !record.evidence_url) {
    els.formMessage.textContent = "ลิงก์หลักฐานต้องเป็น http หรือ https เท่านั้น";
    return;
  }

  if (els.workForm.elements.cover_image_url.value && !record.cover_image_url) {
    els.formMessage.textContent = "ลิงก์ภาพปกต้องเป็น http หรือ https เท่านั้น";
    return;
  }

  record.owner_id = state.user.id;
  record.updated_at = new Date().toISOString();

  const request = id
    ? state.client.from("portfolio_works").update(record).eq("id", id)
    : state.client.from("portfolio_works").insert(record);

  const { error } = await request;
  if (error) {
    els.formMessage.textContent = `บันทึกไม่สำเร็จ: ${error.message}`;
    return;
  }

  await writeAuditLog(id ? "update" : "create", "portfolio_works", id || null, record);
  els.formMessage.textContent = "บันทึกข้อมูลเรียบร้อย";
  setForm(null);
  await loadWorks();
}

async function deleteWork(id) {
  if (!confirm("เก็บรายการผลงานนี้เข้าถังเก็บถาวรหรือไม่")) return;
  const payload = {
    status: "archived",
    public_on_profile: false,
    deleted_at: new Date().toISOString(),
    deleted_by: state.user.id,
    updated_at: new Date().toISOString(),
  };
  const { error } = await state.client.from("portfolio_works").update(payload).eq("id", id);
  if (error) {
    els.formMessage.textContent = `เก็บถาวรไม่สำเร็จ: ${error.message}`;
    return;
  }
  await writeAuditLog("soft_delete", "portfolio_works", id, payload);
  await loadWorks();
}

async function writeAuditLog(action, tableName, recordId, metadata = {}) {
  if (!state.client || !state.user) return;
  try {
    await state.client.from("portfolio_audit_logs").insert({
      user_id: state.user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      user_agent: navigator.userAgent,
      metadata,
    });
  } catch (_) {
    // Audit logging must not block the teacher's primary workflow.
  }
}

async function login(event) {
  event.preventDefault();
  if (!state.client) return;

  const formData = new FormData(els.loginForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const { data, error } = await state.client.auth.signInWithPassword({ email, password });

  if (error) {
    els.authMessage.textContent = `เข้าสู่ระบบไม่สำเร็จ: ${error.message}`;
    return;
  }

  state.user = data.user;
  setView(true);
  await loadWorks();
}

async function sendPasswordReset() {
  if (!state.client) {
    els.authMessage.textContent = "ยังไม่ได้เชื่อม Supabase จึงส่งอีเมลตั้งรหัสผ่านไม่ได้";
    return;
  }

  const email = els.loginForm.elements.email.value.trim();
  if (!email) {
    els.authMessage.textContent = "กรุณากรอกอีเมลก่อนส่งลิงก์ตั้งรหัสผ่าน";
    els.loginForm.elements.email.focus();
    return;
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await state.client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    els.authMessage.textContent = `ส่งอีเมลไม่สำเร็จ: ${error.message}`;
    return;
  }

  els.authMessage.textContent = "ส่งลิงก์ตั้งรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจ inbox หรือ spam";
}

async function init() {
  await loadConfig();
  showSetupNotice();
  if (!state.client) {
    setView(false);
    return;
  }

  const { data } = await state.client.auth.getSession();
  state.user = data.session?.user || null;
  setView(Boolean(state.user));
  if (state.user) await loadWorks();
}

async function loadConfig() {
  if (!window.supabase) return;
  try {
    const response = await fetch("supabase-config.js", { cache: "no-store" });
    if (!response.ok) return;
    const code = await response.text();
    Function(code)();
    const config = window.PORTFOLIO_SUPABASE || {};
    const isConfigured = config.url && config.anonKey && !config.url.includes("YOUR_PROJECT_ID");
    if (isConfigured) {
      state.client = window.supabase.createClient(config.url, config.anonKey);
    }
  } catch (_) {
    state.client = null;
  }
}

els.loginForm.addEventListener("submit", login);
els.resetPasswordBtn.addEventListener("click", sendPasswordReset);
els.workForm.addEventListener("submit", saveWork);
els.resetFormBtn.addEventListener("click", () => {
  setForm(null);
  els.formMessage.textContent = "";
});
els.refreshBtn.addEventListener("click", loadWorks);
els.searchInput.addEventListener("input", renderWorks);
els.yearFilter.addEventListener("change", renderWorks);
els.statusFilter.addEventListener("change", renderWorks);
els.signOutBtn.addEventListener("click", async () => {
  await state.client.auth.signOut();
  state.user = null;
  state.works = [];
  setView(false);
});
els.workList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const work = state.works.find((item) => item.id === button.dataset.id);
  if (button.dataset.action === "edit" && work) {
    setForm(work);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (button.dataset.action === "delete") {
    deleteWork(button.dataset.id);
  }
});

init();
