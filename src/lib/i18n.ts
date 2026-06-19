export type Lang = "en" | "th";

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.home": "Home",
  "nav.insights": "Insights",
  "nav.settings": "Settings",
  // common
  "signout": "Sign out",
  // settings groups
  "settings.title": "Settings",
  "pref.title": "Preferences",
  "pref.appearance": "Appearance",
  "pref.language": "Language",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  // wallet
  "wallet.title": "Wallet",
  "wallet.name": "Name",
  "wallet.balance": "Starting balance",
  "wallet.startsAt": "Balance starts at",
  "wallet.save": "Save wallet",
  "wallet.saved": "Wallet saved.",
  "wallet.nameError": "Name your wallet.",
  // categories
  "cat.title": "Categories",
  "cat.expense": "Expense",
  "cat.income": "Income",
  "cat.newName": "New category name",
  "cat.add": "Add category",
  "cat.nameError": "Name your category.",
  "cat.confirmDelete": "Delete this category?",
  // data
  "data.title": "Data",
  "import.desc":
    "Bulk-add expenses from a monthly CSV snapshot — one or many months at once. Rows are added, never overwritten.",
  "export.title": "Export data",
  "export.desc":
    "Copy your transactions as a lightweight CSV — paste it into Gemini, ChatGPT, or a spreadsheet to analyse.",
  "export.thisMonth": "This month",
  "export.3m": "3 months",
  "export.6m": "6 months",
  "export.1y": "1 year",
};

const th: Dict = {
  // nav
  "nav.home": "หน้าหลัก",
  "nav.insights": "วิเคราะห์",
  "nav.settings": "ตั้งค่า",
  // common
  "signout": "ออกจากระบบ",
  // settings groups
  "settings.title": "ตั้งค่า",
  "pref.title": "ค่ากำหนด",
  "pref.appearance": "ธีม",
  "pref.language": "ภาษา",
  "theme.system": "ตามระบบ",
  "theme.light": "สว่าง",
  "theme.dark": "มืด",
  // wallet
  "wallet.title": "กระเป๋าเงิน",
  "wallet.name": "ชื่อ",
  "wallet.balance": "ยอดเริ่มต้น",
  "wallet.startsAt": "ยอดตั้งต้น",
  "wallet.save": "บันทึกกระเป๋าเงิน",
  "wallet.saved": "บันทึกแล้ว",
  "wallet.nameError": "ตั้งชื่อกระเป๋าเงิน",
  // categories
  "cat.title": "หมวดหมู่",
  "cat.expense": "รายจ่าย",
  "cat.income": "รายรับ",
  "cat.newName": "ชื่อหมวดหมู่ใหม่",
  "cat.add": "เพิ่มหมวดหมู่",
  "cat.nameError": "ตั้งชื่อหมวดหมู่",
  "cat.confirmDelete": "ลบหมวดหมู่นี้?",
  // data
  "data.title": "ข้อมูล",
  "import.desc":
    "เพิ่มรายจ่ายจากไฟล์ CSV สรุปรายเดือน ทีละเดือนหรือหลายเดือนก็ได้ เป็นการเพิ่มเข้าไป ไม่เขียนทับของเดิม",
  "export.title": "ส่งออกข้อมูล",
  "export.desc":
    "คัดลอกรายการเป็น CSV แบบเบา ๆ ไปวางใน Gemini, ChatGPT หรือสเปรดชีตเพื่อวิเคราะห์ต่อ",
  "export.thisMonth": "เดือนนี้",
  "export.3m": "3 เดือน",
  "export.6m": "6 เดือน",
  "export.1y": "1 ปี",
};

export const dictionaries: Record<Lang, Dict> = { en, th };

export function translate(lang: Lang, key: string): string {
  return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
}
