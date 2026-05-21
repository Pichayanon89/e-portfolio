# คู่มือแก้ไขเว็บ e-Portfolio

ไฟล์ที่ควรแก้บ่อยที่สุดคือ `data/site-data.json`

ถ้าต้องการแก้ผ่าน Google Sheet ให้ดูคู่มือ `GOOGLE_SHEET_CMS.md`

## แก้ลิงก์ระบบ

เปิด `data/site-data.json` แล้วแก้ในส่วน `links`

```json
"links": {
  "teacherCockpit": "https://pichayanon89.github.io/SMT_2-4/",
  "quickRecord": "https://pichayanon89.github.io/lesson-records/index.html",
  "learningMediaDrive": "https://drive.google.com/drive/folders/..."
}
```

หลังแก้แล้วหน้าเว็บจะอัปเดตลิงก์ที่มี `data-link` ตรงกันโดยอัตโนมัติบน GitHub Pages

## เพิ่มโฟลเดอร์สื่อการเรียนรู้

เพิ่มรายการใน `learningMediaFolders`

```json
{
  "title": "ชื่อโฟลเดอร์",
  "url": "https://drive.google.com/drive/folders/..."
}
```

## เพิ่มรายการอัปเดตล่าสุด

เพิ่มรายการใหม่ไว้บนสุดใน `latestUpdates`

```json
{
  "date": "2026-05-21",
  "title": "หัวข้อที่อัปเดต",
  "detail": "รายละเอียดสั้น ๆ"
}
```

## เพิ่มรูปใหม่

- ตารางสอน: `assets/teaching/`
- เกียรติบัตร: `assets/certificates/`
- หลักฐาน PA/SAR: `assets/evidence/`

ถ้าเป็นรูปใหญ่ ควรย่อให้ไม่เกินประมาณ 1-1.5 MB ก่อนนำขึ้นเว็บ

## คำสั่งบันทึกขึ้น GitHub

```powershell
git add .
git commit -m "Update portfolio content"
git push
```

## ตรวจเว็บก่อน push

รัน local server จากโฟลเดอร์เว็บ

```powershell
python -m http.server 8090 --bind 127.0.0.1
```

แล้วเปิด

```text
http://127.0.0.1:8090/index.html
```
