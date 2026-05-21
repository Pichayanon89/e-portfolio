# Google Sheet CMS

ระบบนี้ใช้ Google Sheet เป็นหลังบ้านแบบง่ายสำหรับแก้ข้อมูลเว็บ e-Portfolio โดยไม่ต้องแก้ HTML

ไฟล์ CMS ที่สร้างไว้:
[e-Portfolio CMS - พิชญานนท์](https://docs.google.com/spreadsheets/d/1iBSKtjHWgBc8updly1yfe4fuzLpK5CJsl6kVOQLjkvo/edit)

## โครงสร้างชีต

ใช้ไฟล์ Google Sheet ชื่อ `e-Portfolio CMS - พิชญานนท์` และมีแท็บหลักดังนี้

- `config` ตั้งค่าพื้นฐานของเว็บ เช่น ชื่อเว็บ URL เจ้าของ และ URL ของ Apps Script
- `links` ลิงก์สำคัญ เช่น Teacher Cockpit, Quick Record, Google Drive, Facebook, TikTok
- `updates` รายการอัปเดตล่าสุดบนหน้าแรก
- `learning_media` เมนูสื่อการเรียนรู้และโฟลเดอร์ Drive
- `works` ผลงานดิจิทัลและสื่อเทคโนโลยี
- `certificates` รายการเกียรติบัตร
- `sar_standards` สรุป SAR รายมาตรฐาน
- `evidence` รายการหลักฐาน/แฟ้มสะสมงาน

แถวที่ต้องการเผยแพร่ให้ตั้ง `status` เป็น `show` ถ้ายังไม่ต้องการแสดงให้ตั้งเป็น `hide`

## วิธี deploy Apps Script

1. เปิดไฟล์ Google Sheet CMS
2. ไปที่ `Extensions` > `Apps Script`
3. ลบโค้ดเดิม แล้ววางโค้ดจาก `cms/google-apps-script/Code.gs`
4. กด `Deploy` > `New deployment`
5. เลือกชนิดเป็น `Web app`
6. ตั้งค่า:
   - `Execute as`: Me
   - `Who has access`: Anyone
7. กด Deploy แล้วคัดลอก Web app URL

## วิธีเชื่อมกับเว็บ

เปิด `data/site-data.json` แล้วใส่ URL ที่ได้ในช่องนี้

```json
"cmsApiUrl": "https://script.google.com/macros/s/AKfycbzs6_xUID9vc8KzdVb8viDHFgqzmzOH9gfD7LRmxC1zwT24oecYnSLfJ29wJW8ia1-b/exec"
```

หลังจากนั้น commit และ push ขึ้น GitHub Pages

ถ้าเปิด URL แล้วขึ้นข้อความ `ไม่พบฟังก์ชันของสคริปต์: doGet` ให้กลับไปที่ Apps Script แล้ววางโค้ดจาก `cms/google-apps-script/Code.gs` จากนั้นกด `Deploy` > `Manage deployments` > แก้ไข deployment เดิม > เลือก version ใหม่ > `Deploy`

## วิธีแก้ข้อมูลประจำวัน

หลังเชื่อมสำเร็จแล้ว ครูแก้ข้อมูลใน Google Sheet ได้โดยตรง เช่น

- เพิ่มอัปเดตล่าสุด: เพิ่มแถวในแท็บ `updates`
- เปลี่ยนลิงก์ Teacher Cockpit: แก้แถว `teacherCockpit` ในแท็บ `links`
- เพิ่มสื่อการเรียนรู้: เพิ่มแถวในแท็บ `learning_media`
- ซ่อนรายการ: เปลี่ยน `status` เป็น `hide`

หน้าเว็บจะโหลดข้อมูลจาก Google Sheet ก่อน ถ้าโหลดไม่ได้จะใช้ `data/site-data.json` เป็นข้อมูลสำรอง
