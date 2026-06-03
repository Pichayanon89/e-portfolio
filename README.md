# E-Portfolio 2568

เว็บแฟ้มสะสมงานอิเล็กทรอนิกส์ของนายพิชญานนท์ วัจนสุนทร สร้างจากข้อมูลใหม่ในไฟล์ SAR 2568 และแบบประเมินเลื่อนเงินเดือน ครูชำนาญการ

## เปิดใช้งาน

เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้โดยตรง

## เผยแพร่

ดูขั้นตอนใน `DEPLOY.md`

## หน้าเพิ่มเติม

- `teacher-cockpit.html` อธิบายระบบ Teacher Cockpit SMT ป.4/2 พร้อมภาพตัวอย่างแดชบอร์ด
- `quick-record.html` อธิบายระบบ Quick Record พร้อมภาพตัวอย่างระบบและลิงก์เปิดใช้งานจริง
- `quick-record.html#ai-reflection` มีเครื่องมือทดลอง AI Lesson Reflection ผ่าน serverless function

## แก้ไขข้อมูล

- แก้ลิงก์และรายการที่เปลี่ยนบ่อยใน `data/site-data.json`
- ดูคู่มือแก้ไขใน `EDITING.md`
- ใช้ Google Sheet CMS ได้จากคู่มือ `GOOGLE_SHEET_CMS.md`
- ระบบบันทึกผลงานครูแบบ Supabase อยู่ใน `portfolio-admin/` และคู่มือ `SUPABASE_PORTFOLIO_APP.md`

## แหล่งข้อมูลที่ใช้

- `SAR 2568 พิชญานนท์ วัจนสุนทร.xlsx`
- `พิชญานนท์ แบบประเมิน เลื่อนเงินเดือน (ครูชำนาญการ).docx`
- รายละเอียดไฟล์เพิ่มเติมอยู่ใน `DATA_SOURCES.md`
- Google Drive หลักฐานกลาง: `https://drive.google.com/drive/folders/1ELZQjnW-w_DBmxFeGt-btZoV7nbDqtgM`

## AI Lesson Reflection ด้วย Gemini

ฟีเจอร์นี้เพิ่มปุ่มวิเคราะห์บันทึกหลังสอนในหน้า `quick-record.html#ai-reflection`
โดย frontend จะเรียก serverless function ที่ `api/lesson-reflection.js`
เพื่อไม่ให้ `GEMINI_API_KEY` หลุดไปอยู่ใน HTML หรือ JavaScript ฝั่งผู้ใช้

### Environment variables

ตั้งค่าในระบบ deploy ของ backend/serverless:

```text
GEMINI_API_KEY=ใส่ API key ของ Gemini
GEMINI_MODEL=gemini-2.5-flash
ALLOWED_ORIGIN=https://pichayanon89.github.io
```

`GEMINI_MODEL` ไม่ใส่ก็ได้ ระบบจะใช้ค่าเริ่มต้น `gemini-2.5-flash`

### Deploy แบบ Vercel

1. นำ repo นี้ไป deploy บน Vercel
2. ไปที่ Project Settings > Environment Variables
3. เพิ่ม `GEMINI_API_KEY`
4. Deploy ใหม่
5. ทดสอบ endpoint:

```bash
curl -X POST https://YOUR_VERCEL_DOMAIN.vercel.app/api/lesson-reflection \
  -H "Content-Type: application/json" \
  -d "{\"subject\":\"วิทยาศาสตร์และเทคโนโลยี\",\"gradeLevel\":\"ป.4/2 SMT\",\"note\":\"วันนี้นักเรียนส่วนใหญ่เข้าใจการใช้บล็อกคำสั่ง Scratch แต่ยังมีบางกลุ่มสับสนเรื่องลำดับคำสั่ง จึงให้เพื่อนช่วยอธิบายและสรุปขั้นตอนร่วมกัน\"}"
```

### ใช้ร่วมกับ GitHub Pages

GitHub Pages รัน serverless function ไม่ได้ จึงต้อง deploy `api/lesson-reflection.js`
บน Vercel/Netlify/Cloudflare ก่อน แล้วตั้ง endpoint ให้หน้าเว็บเรียก backend นั้น

เพิ่ม meta tag นี้ใน `quick-record.html` ถ้า endpoint ไม่ได้อยู่ domain เดียวกัน:

```html
<meta name="lesson-ai-endpoint" content="https://YOUR_BACKEND_DOMAIN/api/lesson-reflection" />
```

### วิธีทดสอบด้วยมือ

1. เปิด `quick-record.html#ai-reflection`
2. กรอกวันที่ วิชา ชั้นเรียน และบันทึกหลังสอนอย่างน้อย 20 ตัวอักษร
3. กด `วิเคราะห์บันทึกด้วย AI`
4. ระหว่างรอ ปุ่มต้องเปลี่ยนเป็น `กำลังวิเคราะห์...`
5. ถ้า serverless ทำงานถูกต้อง จะเห็นผลสรุป 5 หัวข้อ
6. ระบบจะเก็บ `บันทึกต้นฉบับ` และ `ผลวิเคราะห์ AI` ไว้ใน `localStorage` ของเครื่องผู้ใช้
7. ถ้ายังไม่ได้ตั้ง `GEMINI_API_KEY` หรือ endpoint จะเห็นข้อความ error แทน โดย API key จะไม่ปรากฏใน frontend
