# Supabase Portfolio Records

ระบบนี้เป็นหลังบ้านสำหรับบันทึกผลงานครูรายปี เพื่อใช้ค้นหลักฐานตอนเลื่อนเงินเดือน PA/SAR และเลือกเผยแพร่บางรายการใน e-Portfolio

## ไฟล์สำคัญ

- `portfolio-admin/index.html` หน้าเว็บแอปหลังบ้าน
- `portfolio-admin/app.js` logic login, บันทึก, ค้นหา, แก้ไข, ลบ
- `portfolio-admin/styles.css` หน้าตาระบบ
- `portfolio-admin/supabase-config.example.js` ตัวอย่าง config
- `supabase/portfolio_schema.sql` schema และ Row Level Security

## ขั้นตอนสร้าง Supabase

1. เข้า https://supabase.com แล้วสร้าง Project ใหม่
2. ไปที่ `SQL Editor`
3. วาง SQL จาก `supabase/portfolio_schema.sql`
4. กด Run
5. ไปที่ `Authentication` > `Providers`
6. เปิด Email login
7. ไปที่ `Authentication` > `Users`
8. เพิ่ม user อีเมลของครู: `pichayanon@udonthani3.go.th`
9. ไปที่ `Project Settings` > `API`
10. คัดลอก:
    - Project URL
    - anon public key

## ตั้งค่าเว็บแอป

คัดลอกไฟล์:

```text
portfolio-admin/supabase-config.example.js
```

เป็น:

```text
portfolio-admin/supabase-config.js
```

แล้วแก้ค่า:

```js
window.PORTFOLIO_SUPABASE = {
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

หลังแก้แล้ว commit และ push ขึ้น GitHub

## อัปเดตด้านความปลอดภัย

หลังอัปเดตโค้ด ให้รัน `supabase/portfolio_schema.sql` ใน Supabase SQL Editor อีกครั้ง เพื่อเพิ่มคอลัมน์และตารางด้านความปลอดภัย:

- `deleted_at`, `deleted_by` สำหรับ soft delete
- `portfolio_audit_logs` สำหรับบันทึก create, update และ soft delete
- `role` ใน `portfolio_profiles` สำหรับต่อยอด RBAC ในระยะถัดไป

ระบบ admin จะรับลิงก์หลักฐานและลิงก์ภาพปกเฉพาะ URL ที่ขึ้นต้นด้วย `http://` หรือ `https://` เท่านั้น เพื่อลดความเสี่ยง XSS จาก URL ที่ไม่ปลอดภัย

## การส่งรหัสผ่าน/ตั้งรหัสผ่าน

ไม่ควรส่งรหัสผ่านจริงทางอีเมล ให้ใช้วิธีส่งลิงก์ตั้งรหัสผ่านแทน

ทำได้ 2 วิธี:

1. ใน Supabase ไปที่ `Authentication` > `Users` แล้วใช้เมนู Invite/Send recovery email
2. เปิดหน้า `portfolio-admin/` กรอกอีเมล แล้วกด `ส่งลิงก์ตั้งรหัสผ่านทางอีเมล`

ถ้าใช้ปุ่มในหน้าเว็บ ต้องตั้งค่า Supabase ให้เรียบร้อยก่อน และควรเพิ่ม URL ของเว็บใน `Authentication` > `URL Configuration` > `Redirect URLs`

## วิธีเปิดใช้งาน

เมื่อ deploy แล้ว เปิด:

```text
https://pichayanon89.github.io/SMT_2-4/portfolio-admin/
```

หรือถ้าเว็บอยู่ repo `e-portfolio` ให้ใช้:

```text
https://pichayanon89.github.io/e-portfolio/portfolio-admin/
```

## หลักการใช้งานประจำปี

1. Login ด้วยอีเมลครู
2. เพิ่มผลงานใหม่ทุกครั้งที่มีหลักฐาน
3. ใส่ปีการศึกษา ภาคเรียน ประเภทผลงาน ตัวชี้วัด PA และมาตรฐาน SAR
4. วางลิงก์ Google Drive หรือ URL หลักฐาน โดยใช้เฉพาะ `http://` หรือ `https://`
5. ตั้งสถานะ:
   - `draft` ร่าง
   - `ready` พร้อมใช้ตอนประเมิน
   - `published` เผยแพร่ใน e-Portfolio
   - `archived` เก็บถาวร
6. ติ๊ก `เผยแพร่รายการนี้ใน e-Portfolio` เฉพาะผลงานที่ต้องการแสดงหน้าเว็บ

## คำแนะนำการจัดหมวด

ประเภทผลงานควรใช้ให้สม่ำเสมอ:

- งานสอนและการจัดการเรียนรู้
- นวัตกรรม/สื่อเทคโนโลยี
- วิจัยในชั้นเรียน
- ระบบดูแลช่วยเหลือผู้เรียน
- PLC/นิเทศ/ชุมชนการเรียนรู้
- อบรม/พัฒนาตนเอง
- เกียรติบัตร/รางวัล
- งานพิเศษ/พัสดุ/งบประมาณ

คำค้นควรใส่เพื่อให้ค้นง่าย เช่น:

```text
PA1, PA2, SAR3, SMT, วิทยาการคำนวณ, เลื่อนเงินเดือน, เกียรติบัตร
```

## เชื่อมแสดงใน e-Portfolio

ตาราง `portfolio_works` เปิด policy ให้คนทั่วไปอ่านเฉพาะรายการที่:

```text
status = published
public_on_profile = true
deleted_at is null
```

ดังนั้น e-Portfolio สามารถดึงข้อมูล published มาแสดงได้ภายหลัง โดยไม่เปิดข้อมูล draft หรือ ready สู่สาธารณะ

## หมายเหตุเรื่องไฟล์หลักฐาน

เวอร์ชันแรกแนะนำให้เก็บไฟล์จริงใน Google Drive แล้ววางลิงก์ในช่อง `ลิงก์หลักฐาน` เพราะไฟล์เดิมของครูอยู่ใน Drive อยู่แล้วและจัดการสิทธิ์ง่ายกว่า

ถ้าต้องการอัปโหลดไฟล์เข้า Supabase Storage โดยตรง สามารถเพิ่มภายหลังได้
