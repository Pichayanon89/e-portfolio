(function () {
  const root = document.querySelector("[data-lesson-ai]");
  if (!root) return;

  const form = root.querySelector("[data-lesson-ai-form]");
  const submitButton = root.querySelector("[data-lesson-ai-submit]");
  const clearButton = root.querySelector("[data-lesson-ai-clear]");
  const status = root.querySelector("[data-lesson-ai-status]");
  const output = root.querySelector("[data-lesson-ai-output]");
  const result = root.querySelector("[data-lesson-ai-result]");
  const history = root.querySelector("[data-lesson-ai-history]");
  const historyList = root.querySelector("[data-lesson-ai-history-list]");
  const clearHistoryButton = root.querySelector("[data-lesson-ai-clear-history]");

  const storageKey = "quick-record-ai-reflections";
  const endpoint = document.querySelector('meta[name="lesson-ai-endpoint"]')?.content
    || window.LESSON_AI_ENDPOINT
    || "/api/lesson-reflection";

  function setStatus(message, type) {
    status.textContent = message || "";
    status.dataset.state = type || "";
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "กำลังวิเคราะห์..." : "วิเคราะห์บันทึกด้วย AI";
    root.classList.toggle("is-loading", isLoading);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderReflection(text) {
    return escapeHtml(text)
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeHistory(items) {
    localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 8)));
  }

  function renderHistory() {
    const items = readHistory();
    history.hidden = items.length === 0;
    historyList.innerHTML = items.map((item) => `
      <details>
        <summary>
          <strong>${escapeHtml(item.subject || "ไม่ระบุวิชา")}</strong>
          <span>${escapeHtml(item.gradeLevel || "ไม่ระบุชั้น")} · ${escapeHtml(item.lessonDate || "ไม่ระบุวันที่")}</span>
        </summary>
        <div class="lesson-history-block">
          <h4>บันทึกต้นฉบับ</h4>
          <p>${escapeHtml(item.originalNote)}</p>
          <h4>ผลวิเคราะห์ AI</h4>
          ${renderReflection(item.aiReflection)}
        </div>
      </details>
    `).join("");
  }

  function saveReflection(payload) {
    const items = readHistory();
    items.unshift({
      originalNote: payload.originalNote,
      aiReflection: payload.aiReflection,
      subject: payload.metadata?.subject || "",
      gradeLevel: payload.metadata?.gradeLevel || "",
      lessonDate: payload.metadata?.lessonDate || "",
      createdAt: payload.metadata?.createdAt || new Date().toISOString()
    });
    writeHistory(items);
    renderHistory();
  }

  async function analyzeLesson(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      lessonDate: formData.get("lessonDate") || "",
      subject: formData.get("subject") || "",
      gradeLevel: formData.get("gradeLevel") || "",
      note: formData.get("note") || ""
    };

    if (String(payload.note).trim().length < 20) {
      setStatus("กรุณากรอกบันทึกหลังสอนอย่างน้อย 20 ตัวอักษร", "error");
      return;
    }

    setLoading(true);
    output.hidden = true;
    setStatus("กำลังส่งบันทึกไปวิเคราะห์ผ่าน serverless function...", "loading");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }

      result.innerHTML = renderReflection(data.aiReflection);
      output.hidden = false;
      saveReflection(data);
      setStatus("บันทึกต้นฉบับและผลวิเคราะห์ AI ถูกบันทึกไว้ในเครื่องนี้แล้ว", "success");
    } catch (error) {
      setStatus(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI", "error");
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener("submit", analyzeLesson);
  clearButton.addEventListener("click", () => {
    form.reset();
    output.hidden = true;
    result.innerHTML = "";
    setStatus("", "");
  });
  clearHistoryButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderHistory();
    setStatus("ล้างประวัติในเครื่องนี้แล้ว", "success");
  });

  renderHistory();
})();
