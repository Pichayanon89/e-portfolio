const GEMINI_API_VERSION = "v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_ALLOWED_ORIGIN = "https://pichayanon89.github.io";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function setCors(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  const requestOrigin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  if (requestOrigin && requestOrigin !== allowedOrigin) {
    sendJson(res, 403, {
      error: "ORIGIN_NOT_ALLOWED",
      message: "Origin นี้ไม่ได้รับอนุญาตให้เรียกใช้ API"
    });
    return true;
  }
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 20000) {
        reject(new Error("REQUEST_TOO_LARGE"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

function buildPrompt({ note, subject, gradeLevel, lessonDate }) {
  return `
คุณเป็นผู้ช่วยครูไทย ช่วยวิเคราะห์บันทึกหลังสอนให้ใช้ประกอบ SAR/PA ได้อย่างกระชับ สุภาพ และเป็นภาษาไทยราชการที่อ่านง่าย

ข้อมูลบริบท:
- วันที่: ${lessonDate || "ไม่ระบุ"}
- วิชา: ${subject || "ไม่ระบุ"}
- ชั้นเรียน: ${gradeLevel || "ไม่ระบุ"}

บันทึกต้นฉบับของครู:
${note}

กรุณาตอบเป็นหัวข้อต่อไปนี้เท่านั้น:
1. สรุปเหตุการณ์หลังสอน
2. ผลการเรียนรู้ด้าน K-P-A
3. ปัญหาหรือข้อสังเกตสำคัญ
4. แนวทางปรับปรุงครั้งถัดไป
5. หลักฐาน/PA Tags ที่เกี่ยวข้อง

ข้อกำหนด:
- ห้ามแต่งข้อมูลนักเรียนรายบุคคล
- หากข้อมูลไม่พอให้ระบุว่า "ข้อมูลจากบันทึกยังไม่เพียงพอ"
- ใช้ถ้อยคำเหมาะกับระบบครูและการประเมิน
`.trim();
}

module.exports = async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "METHOD_NOT_ALLOWED", message: "รองรับเฉพาะ POST เท่านั้น" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      error: "MISSING_GEMINI_API_KEY",
      message: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน environment ของ serverless function"
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    const message = error.message === "REQUEST_TOO_LARGE"
      ? "ข้อความยาวเกินไป กรุณาลดความยาวบันทึก"
      : "รูปแบบ JSON ไม่ถูกต้อง";
    return sendJson(res, 400, { error: error.message, message });
  }

  const note = String(body.note || "").trim();
  const subject = String(body.subject || "").trim();
  const gradeLevel = String(body.gradeLevel || "").trim();
  const lessonDate = String(body.lessonDate || "").trim();

  if (note.length < 20) {
    return sendJson(res, 400, {
      error: "NOTE_TOO_SHORT",
      message: "กรุณากรอกบันทึกหลังสอนอย่างน้อย 20 ตัวอักษร"
    });
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt({ note, subject, gradeLevel, lessonDate }) }]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 1400
        }
      })
    });

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return sendJson(res, geminiResponse.status, {
        error: "GEMINI_API_ERROR",
        message: data?.error?.message || "Gemini API ไม่สามารถประมวลผลได้"
      });
    }

    const reflection = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!reflection) {
      return sendJson(res, 502, {
        error: "EMPTY_AI_RESPONSE",
        message: "AI ไม่ได้ส่งข้อความตอบกลับ"
      });
    }

    return sendJson(res, 200, {
      originalNote: note,
      aiReflection: reflection,
      metadata: {
        subject,
        gradeLevel,
        lessonDate,
        model,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "SERVER_ERROR",
      message: "เกิดข้อผิดพลาดระหว่างเชื่อมต่อ Gemini API"
    });
  }
};
