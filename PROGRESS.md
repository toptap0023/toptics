# PROGRESS - TOPtics (spendee-clone)

อัปเดตล่าสุด: 2 สิงหาคม 2026

แอปบันทึกรายรับรายจ่ายส่วนตัว (Next.js 15 + React 19 + Tailwind 3 + Supabase)
เจ้าของใช้งานจริงทุกวัน แต่มักบันทึกข้อมูลเป็นรอบ ประมาณเดือนละครั้ง ซึ่งเป็น
ข้อจำกัดสำคัญที่กำหนดการตัดสินใจหลายอย่างในเซสชันนี้

Repo: https://github.com/toptap0023/TOPtics (branch หลัก `main`)

---

## สถานะ ณ ตอนนี้

ทุกอย่างที่เริ่มในเซสชันนี้ทำเสร็จ ผ่านการตรวจสอบกับของจริง และ push ขึ้น `main` แล้ว
ไม่มีงานค้าง ไม่มีอะไรถูก block

`main` ล่าสุด: `e4fd4ea`

---

## งานที่ทำในเซสชันนี้

### 1. ช่อง Note ในหน้าบันทึกรายการ

ปัญหาเดิม: ช่อง note เป็น `<input type="text">` บรรทัดเดียว และจำกัด 120 ตัวอักษร
ผู้ใช้เก็บรายละเอียดยาว (เช่น breakdown รายการซื้ออุปกรณ์กอล์ฟ) จึงอ่านไม่ครบและถูกตัดทิ้ง

สิ่งที่แก้ (รายละเอียด diff ดูที่ commit `94868e7`, merge ผ่าน PR #1 = `d94f4cb`):

- เปลี่ยนเป็น `<textarea>` 4 บรรทัด สูงต่ำสุด 104px สูงสุด 240px scroll ในตัว ลากขยายแนวตั้งได้
- เอา `maxLength={120}` ออกทั้งหมด
- เพิ่มปุ่มไอคอนขยายข้าง label เปิดหน้าอ่าน/แก้โน้ตแบบเต็มจอ ปิดด้วยปุ่ม X หรือ Escape
- เพิ่ม `ExpandIcon` และคีย์ i18n `tx.expandNote` / `tx.collapseNote` ครบทั้ง EN และ TH

ไฟล์หลัก: `src/components/TransactionSheet.tsx`, `src/components/icons.tsx`, `src/lib/i18n.ts`

### 2. แก้ปัญหา "ใช้ไปสักพักแล้วเด้งออกจาก login"

สิ่งที่ตรวจสอบและ**ตัดออกไปแล้ว**ว่าไม่ใช่สาเหตุ (อย่าเสียเวลาไล่ซ้ำ):

- cookie อายุ 400 วัน (ค่า default ของ `@supabase/ssr`) ไม่ได้สั้น
- middleware ใช้ `getClaims()` ซึ่งเรียก `getSession()` ต่อ และ auto-refresh token
  ที่หมดอายุผ่าน `_callRefreshToken` ยืนยันจากซอร์สของ `@supabase/auth-js` แล้ว
- auth เป็น server-side ล้วน ไม่มี browser client ที่จะทำให้ state หลุด

**สาเหตุจริง:** Supabase free plan จะ pause project ที่ไม่มี database activity พอในรอบ 7 วัน
พอ project หลับ การ refresh token จะ fail middleware จึงมองว่าไม่มี session แล้ว redirect ไป `/login`
เจ้าของบันทึกเดือนละครั้ง จึงเกิน 7 วันทุกรอบและโดนทุกรอบ

**ทางแก้ที่เลือก:** GitHub Actions ทำ `pg_dump` ทั้งฐานทุก 3 วัน แล้ว commit กลับเข้า repo
ได้ผลสองต่อคือกัน pause และได้ backup ข้อมูลการเงินไปในตัว (commit `e8f8e18`)

ไฟล์: `.github/workflows/backup.yml`, `backups/README.md`

**ยืนยันว่าใช้งานได้จริงแล้ว** รันครั้งแรกสำเร็จ ได้ commit `e4fd4ea` พร้อมไฟล์
`backups/toptics.sql` (981K) ตรวจแล้วมีข้อมูลจริง: `transactions` 273 แถว,
`categories` 37, `golf_shots` 473, `golf_sessions` 10, `golf_rounds` 5, `wallets` 2
และมี schema `auth` ติดมาด้วย จึงกู้ทั้งข้อมูลและ account ได้

---

## การตัดสินใจและเหตุผล

| เรื่อง | ที่เลือก | ทำไม / ทางเลือกที่ตกไป |
|---|---|---|
| ลิมิตความยาว note | เอาออก ไม่จำกัด | เจ้าของใช้ note เก็บรายละเอียดสำคัญไว้อ่านเอง ตรวจแล้วคอลัมน์ `note` ใน `supabase/schema.sql` เป็น `text` และ server action ใน `src/app/(app)/actions.ts` แค่ `.trim()` ไม่มี validate ความยาว จึงปลอดภัย |
| note state | เปลี่ยนจาก uncontrolled เป็น controlled | จำเป็นเพื่อให้ค่าที่พิมพ์ในหน้าเต็มจอกับช่องในฟอร์ม sync กัน state reset ตอนเปิด sheet |
| วิธีกัน Supabase pause | GitHub Actions dump ทุก 3 วัน | ตกไป: อัปเกรด Supabase Pro ($25/เดือน) แพงเกินสำหรับ side project / ตกไป: Vercel Cron เพราะ Hobby plan รันได้วันละครั้งเท่านั้น ซึ่งเฉียดเกณฑ์ "a few requests each day" ที่ Supabase ระบุ / เลือกแบบ dump เพราะได้ backup เป็นของแถม ซึ่งมีค่ามากกับข้อมูลที่บันทึกเดือนละครั้ง |
| ลอก pattern จาก TOPasset | ใช้ไฟล์เดียวกันเกือบทั้งดุ้น | `~/Projects/personal/top-asset/.github/workflows/backup.yml` พิสูจน์แล้วว่าใช้ได้จริง รวมถึงท่าแก้ปัญหา pg_dump เวอร์ชันไม่ตรงและ strip `\restrict` token |

---

## Gotchas ของ repo นี้ (สำคัญ อย่าพลาด)

1. **TOPtics กับ TOPasset ใช้คนละ Supabase project**
   TOPtics = project ref `vderzhxfenyvpwztedfb` / TOPasset = `kwpuufqcnivschzrwroe`
   backup workflow ของ TOPasset ไม่ได้ช่วย TOPtics เลย ทั้งสอง repo ต้องมี keep-alive ของตัวเอง
   เวลาตั้งค่า secret หรือ connect DB ต้องเช็ค ref ให้ตรง repo เสมอ

2. **Supabase อยู่บน free plan** จึงถูก pause ได้ถ้า cron หยุดทำงาน
   อาการที่จะเห็นคือ "เข้าแอปแล้วเด้งไป login" ไม่ใช่ error ตรง ๆ
   ถ้าเจออาการนี้อีก ให้เช็คก่อนเลยว่า project paused อยู่ไหม อย่าเพิ่งไปไล่แก้โค้ด auth
   เช็คเร็ว ๆ ได้ด้วย `curl -s -o /dev/null -w "%{http_code}" https://vderzhxfenyvpwztedfb.supabase.co/auth/v1/health`
   ได้ 401 = ตื่นอยู่ (ต้องมี apikey ถึงจะผ่าน) ถ้าได้ 503 หรือ timeout = น่าจะหลับ

3. **GitHub ปิด scheduled workflow อัตโนมัติเมื่อ repo ไม่มี activity 60 วัน**
   workflow นี้ commit ไฟล์ backup กลับเข้า repo เอง จึงต่ออายุตัวเองได้ตราบใดที่ข้อมูลเปลี่ยน
   แต่ถ้าไม่มีการบันทึกรายการเลยติดกันสองเดือน ข้อมูลจะไม่เปลี่ยน จะไม่มี commit และอาจโดนปิด
   วิธีแก้คือเข้า Actions tab กด Enable workflow

4. **Supabase รัน Postgres 17** แต่ GitHub runner มาพร้อม `pg_dump` 16 ซึ่งปฏิเสธการ dump server
   ที่ใหม่กว่า workflow จึงติดตั้ง `postgresql-client-17` จาก PGDG apt repo ก่อน อย่าลบขั้นตอนนี้

5. **`gh` CLI ในเครื่องยังไม่ได้ login** (`~/.config/gh` ไม่มี) ส่วน `git push` ผ่านได้เพราะใช้ token
   ใน macOS keychain คนละระบบกัน ถ้าจะสั่งเปิด PR ผ่าน `gh` ต้องให้เจ้าของทำ `gh auth login` ให้จบ flow ก่อน

6. **Supabase MCP ในเซสชันนี้ยังไม่ได้ authorize** จึงเข้า dashboard ดูค่า config ฝั่ง Supabase ไม่ได้
   ถ้าจำเป็นต้องตรวจค่า Auth session settings ต้องให้เจ้าของเปิดดูเอง

---

## งานที่ยังไม่ได้ทำ (ข้อเสนอ ไม่ใช่ของค้าง)

- **repo ยังไม่มี CLAUDE.md** ตามกติกากลางควรมี ควรสแกน codebase แล้วสร้าง โดยย้าย
  หัวข้อ Gotchas ข้างบนเข้าไปไว้ในนั้น (routing ที่ถูกต้องของ gotcha ระดับ repo คือ CLAUDE.md ไม่ใช่ PROGRESS.md)
- โน้ตเก่าที่ถูกตัดจบไว้ที่ 120 ตัวอักษรตั้งแต่ก่อนแก้ ยังคงสั้นอยู่ในฐานข้อมูล เป็นข้อมูลเดิม
  ถ้าอยากได้ครบต้องพิมพ์ใหม่เอง ไม่มีทางกู้ส่วนที่ถูกตัดไปแล้ว
- branch `feat/note-textarea-expand` ยังค้างอยู่บน GitHub (local ลบแล้ว)
  ลบได้ด้วย `git push origin --delete feat/note-textarea-expand` รอเจ้าของสั่ง

---

## Suggested skills สำหรับเซสชันถัดไป

| ถ้างานคือ | ให้เรียก |
|---|---|
| แก้หรือเพิ่ม UI ทุกชนิดในแอปนี้ | `ui-ux-pro-max` (เรียกอัตโนมัติ ไม่ต้องรอสั่ง เพราะเป็น side project ไม่ใช่ SellCoda) |
| ตรวจงาน UI ก่อนส่ง | `review-prototype` พร้อม args `{file, app: "web"}` รันครั้งเดียวตอนเสร็จ ห้ามรันซ้ำทุกรอบที่แก้ |
| งานฟีเจอร์ใหม่ หน้าจอใหม่ หรือ scope ยังกำกวม | `grill-me` ก่อนเสมอ ห้ามลงมือสร้างทันที |
| สร้าง CLAUDE.md ให้ repo นี้ | `init` หรือ `claude-md-management:claude-md-improver` |
| แตะฟีเจอร์ Investment | `toptics-investment` (มี design decision ที่สรุปไว้แล้ว ให้ทำตามนั้น) |
| ไล่บั๊กที่ยังไม่รู้สาเหตุ | `superpowers:systematic-debugging` |

หมายเหตุเรื่อง viewport ตอนตรวจงาน: แอปนี้เป็น web app ที่ใช้จริงบนมือถือเป็นหลัก
ตามกติกากลางให้ตรวจทั้ง 1440x900 และ 390x844

---

## วิธีรันโปรเจกต์

dev server มี config อยู่แล้วใน `.claude/launch.json` ชื่อ `spendee-dev` (port 3000)
ให้เปิดผ่าน preview tool เท่านั้น ห้ามรันผ่าน Bash

ตัวแปรที่ต้องมีใน `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(ดูรูปแบบที่ `.env.local.example`)
