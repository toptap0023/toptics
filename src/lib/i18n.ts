export type Lang = "en" | "th";

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.home": "Home",
  "nav.insights": "Insights",
  "nav.settings": "Settings",
  // common
  "signout": "Sign out",
  "common.income": "Income",
  "common.expense": "Expense",
  "common.net": "Net",
  "common.close": "Close",
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

  // home
  "home.viewInsights": "View {month} insights",
  "home.noTx": "No transactions this month",
  "home.noTxDesc": "Tap the + button to add one, or pick another month above.",

  // transaction sheet
  "tx.add": "Add transaction",
  "tx.new": "New transaction",
  "tx.edit": "Edit transaction",
  "tx.amount": "Amount",
  "tx.category": "Category",
  "tx.date": "Date",
  "tx.yesterday": "Yesterday",
  "tx.lastMonth": "Last month",
  "tx.note": "Note",
  "tx.optional": "(optional)",
  "tx.notePlaceholder": "e.g. Lunch with team",
  "tx.saving": "Saving…",
  "tx.saveChanges": "Save changes",

  // insights
  "ins.title": "Insights",
  "ins.allTime": "All time",
  "ins.overview": "Overview",
  "ins.totalBalance": "Total balance",
  "ins.accountStatus": "Account status",
  "ins.status.healthy": "Healthy",
  "ins.status.watch": "Watch",
  "ins.status.attention": "Needs attention",
  "ins.summary.healthy": "Your finances look healthy.",
  "ins.summary.watch": "A few things worth keeping an eye on.",
  "ins.summary.attention": "Your spending needs attention.",
  "ins.sig.savings": "Savings rate",
  "ins.sig.trend": "Spending trend",
  "ins.sig.topCat": "Top category",
  "ins.val.noIncome": "No income",
  "ins.val.saving": "Saving {pct}%",
  "ins.val.overspending": "Overspending {pct}%",
  "ins.val.trendUp": "Trending up",
  "ins.val.trendDown": "Trending down",
  "ins.val.steady": "Steady",
  "ins.val.notEnough": "Not enough data",
  "ins.recommended": "Recommended",
  "ins.act.overspend":
    "You spent {amt} more than you earned — trim non-essentials first.",
  "ins.act.rising":
    "Spending is trending up (≈ {amt} next month). Set a tighter budget.",
  "ins.act.concentration":
    "{label} is {pct}% of spending — your biggest lever to cut.",
  "ins.act.saver":
    "Nice — you kept {pct}% of income. Consider moving it to savings.",
  "ins.act.onTrack":
    "On track. Keep logging transactions to sharpen your trends.",
  "ins.coach": "AI Coach",
  "ins.coachDesc":
    "A ready-made prompt with your stats built in — paste into Gemini, ChatGPT, or Claude for an analysis and a personalized plan.",
  "ins.coachCopy": "Copy AI Coach prompt",
  "ins.copied": "Copied!",
  "ins.totalSpending": "Total spending",
  "ins.spendingMonth": "Spending this month",
  "ins.avg": "Avg",
  "ins.day": "day",
  "ins.soFar": "so far",
  "ins.comparison": "Comparison",
  "ins.vsLast": "vs last month",
  "ins.vs3": "vs 3-month avg",
  "ins.vs6": "vs 6-month avg",
  "ins.vs12": "vs 12-month avg",
  "ins.avgWord": "avg",
  "ins.noData": "No data",
  "ins.tapRow": "Tap a row to see the change per category.",
  "ins.noCatBreakdown": "No category breakdown.",
  "ins.byCategory": "By category",
  "ins.forecast": "Forecast",
  "ins.nextMonth": "Next month",
  "ins.next3": "Next 3 months",
  "ins.conf.high": "High",
  "ins.conf.medium": "Medium",
  "ins.conf.low": "Low",
  "ins.confidence": "confidence",
  "ins.mo": "mo",
  "ins.seasonal": "Seasonally adjusted",
  "ins.projectedByCat": "Projected by category",
  "ins.new": "New",
  "ins.empty.noTx": "No transactions yet",
  "ins.empty.noMonth": "No data this month",
  "ins.empty.desc": "Add transactions and your insights will appear here.",

  // import sheet
  "imp.title": "Import data",
  "imp.sheetDesc":
    "Paste a CSV ({fmt}). Spend = budget − remaining. Add a leading {month} column to import several months at once. Rows are added, never overwritten.",
  "imp.copyPrompt": "Copy AI prompt",
  "imp.promptHint":
    "Paste this into Gemini (or any AI) with your budgeting-app screenshot to get the CSV. Categories you don’t have yet are created automatically.",
  "imp.defaultMonth": "Default month",
  "imp.defaultMonthHint": "(for rows without a month)",
  "imp.preview": "Preview",
  "imp.errNoRows": "Couldn’t read any rows. Expected: category,budget,remaining",
  "imp.errNothing": "Nothing selected to import.",
  "imp.create": "＋ Create “{raw}”",
  "imp.skip": "Skip",
  "imp.budgetLeft": "budget {budget} · left {remaining}",
  "imp.adding": "Adding…",
  "imp.addN": "Add {n} transactions",

  // investment
  "common.investment": "Investment",
  "net.leftover": "Leftover",
  "net.drawdown": "From savings",
  "cat.investment": "Investment",
  "cat.isInvestment": "Investment category",
  "cat.isInvestmentHint":
    "Money moved into investments — deducted from your wallet but kept out of spending analysis.",
  "ins.allocation": "Income · Spending · Investing",
  "ins.leftoverNote": "income − spending − investing",
  "ins.investSummary": "Investment summary",
  "ins.investedTotal": "Invested",
  "ins.ofOutflow": "{pct}% of money out",
  "ins.timesIncome": "= {x}× income this month",
  "ins.investByType": "By type",
  "ins.recentInvest": "Recent",
  "ins.viewPortfolio": "View full portfolio in TOPasset →",
  "ins.noInvest": "No investments this period.",
  "ins.act.investing": "You invested {amt} this period — keep building wealth.",
  "ins.taxExport": "Export tax-fund CSV (this year)",
  "ins.taxExportOk": "Copied {n} rows — paste into TOPasset.",
  "ins.taxExportNone": "No tax-fund buys yet this year.",
  "toast.added": "Added",
  "toast.saved": "Saved",
  "toast.deleted": "Deleted",
  "toast.copied": "Copied",
};

const th: Dict = {
  // nav
  "nav.home": "หน้าหลัก",
  "nav.insights": "วิเคราะห์",
  "nav.settings": "ตั้งค่า",
  // common
  "signout": "ออกจากระบบ",
  "common.income": "รายรับ",
  "common.expense": "รายจ่าย",
  "common.net": "คงเหลือ",
  "common.close": "ปิด",
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

  // home
  "home.viewInsights": "ดูบทวิเคราะห์ {month}",
  "home.noTx": "เดือนนี้ยังไม่มีรายการ",
  "home.noTxDesc": "กดปุ่ม + เพื่อเพิ่มรายการ หรือเลือกเดือนอื่นด้านบน",

  // transaction sheet
  "tx.add": "เพิ่มรายการ",
  "tx.new": "รายการใหม่",
  "tx.edit": "แก้ไขรายการ",
  "tx.amount": "จำนวนเงิน",
  "tx.category": "หมวดหมู่",
  "tx.date": "วันที่",
  "tx.yesterday": "เมื่อวาน",
  "tx.lastMonth": "เดือนก่อน",
  "tx.note": "โน้ต",
  "tx.optional": "(ไม่บังคับ)",
  "tx.notePlaceholder": "เช่น ข้าวเที่ยงกับทีม",
  "tx.saving": "กำลังบันทึก…",
  "tx.saveChanges": "บันทึกการแก้ไข",

  // insights
  "ins.title": "วิเคราะห์",
  "ins.allTime": "ทั้งหมด",
  "ins.overview": "ภาพรวม",
  "ins.totalBalance": "ยอดเงินรวม",
  "ins.accountStatus": "สถานะบัญชี",
  "ins.status.healthy": "แข็งแรง",
  "ins.status.watch": "เฝ้าระวัง",
  "ins.status.attention": "ต้องระวัง",
  "ins.summary.healthy": "การเงินของคุณดูแข็งแรงดี",
  "ins.summary.watch": "มีบางอย่างที่ควรจับตาดู",
  "ins.summary.attention": "การใช้จ่ายของคุณต้องระวัง",
  "ins.sig.savings": "อัตราการออม",
  "ins.sig.trend": "แนวโน้มการใช้จ่าย",
  "ins.sig.topCat": "หมวดที่ใช้มากสุด",
  "ins.val.noIncome": "ไม่มีรายรับ",
  "ins.val.saving": "ออม {pct}%",
  "ins.val.overspending": "ใช้เกิน {pct}%",
  "ins.val.trendUp": "เพิ่มขึ้น",
  "ins.val.trendDown": "ลดลง",
  "ins.val.steady": "คงที่",
  "ins.val.notEnough": "ข้อมูลไม่พอ",
  "ins.recommended": "คำแนะนำ",
  "ins.act.overspend":
    "คุณใช้จ่ายเกินรายรับ {amt} — ลองตัดของไม่จำเป็นออกก่อน",
  "ins.act.rising":
    "การใช้จ่ายมีแนวโน้มเพิ่มขึ้น (≈ {amt} เดือนหน้า) ตั้งงบให้รัดกุมขึ้น",
  "ins.act.concentration":
    "{label} คิดเป็น {pct}% ของรายจ่าย — จุดที่ลดได้มากสุด",
  "ins.act.saver":
    "เยี่ยม — คุณเก็บได้ {pct}% ของรายรับ ลองโยกไปบัญชีออมทรัพย์",
  "ins.act.onTrack": "ไปได้ดี บันทึกรายการต่อไปเพื่อให้แนวโน้มแม่นขึ้น",
  "ins.coach": "AI โค้ช",
  "ins.coachDesc":
    "พรอมต์สำเร็จรูปที่ฝังตัวเลขของคุณไว้ — วางใน Gemini, ChatGPT หรือ Claude เพื่อขอบทวิเคราะห์และแผนเฉพาะตัว",
  "ins.coachCopy": "คัดลอกพรอมต์ AI โค้ช",
  "ins.copied": "คัดลอกแล้ว!",
  "ins.totalSpending": "รายจ่ายทั้งหมด",
  "ins.spendingMonth": "รายจ่ายเดือนนี้",
  "ins.avg": "เฉลี่ย",
  "ins.day": "วัน",
  "ins.soFar": "จนถึงตอนนี้",
  "ins.comparison": "เปรียบเทียบ",
  "ins.vsLast": "เทียบเดือนก่อน",
  "ins.vs3": "เทียบเฉลี่ย 3 เดือน",
  "ins.vs6": "เทียบเฉลี่ย 6 เดือน",
  "ins.vs12": "เทียบเฉลี่ย 12 เดือน",
  "ins.avgWord": "เฉลี่ย",
  "ins.noData": "ไม่มีข้อมูล",
  "ins.tapRow": "แตะที่แถวเพื่อดูการเปลี่ยนแปลงรายหมวด",
  "ins.noCatBreakdown": "ไม่มีรายละเอียดรายหมวด",
  "ins.byCategory": "แยกตามหมวด",
  "ins.forecast": "พยากรณ์",
  "ins.nextMonth": "เดือนหน้า",
  "ins.next3": "3 เดือนหน้า",
  "ins.conf.high": "สูง",
  "ins.conf.medium": "กลาง",
  "ins.conf.low": "ต่ำ",
  "ins.confidence": "ความเชื่อมั่น",
  "ins.mo": "เดือน",
  "ins.seasonal": "ปรับตามฤดูกาล",
  "ins.projectedByCat": "คาดการณ์รายหมวด",
  "ins.new": "ใหม่",
  "ins.empty.noTx": "ยังไม่มีรายการ",
  "ins.empty.noMonth": "เดือนนี้ไม่มีข้อมูล",
  "ins.empty.desc": "เพิ่มรายการแล้วบทวิเคราะห์จะแสดงที่นี่",

  // import sheet
  "imp.title": "นำเข้าข้อมูล",
  "imp.sheetDesc":
    "วาง CSV ({fmt}) — ยอดใช้ = งบ − คงเหลือ เพิ่มคอลัมน์ {month} ไว้หน้าสุดเพื่อนำเข้าหลายเดือนพร้อมกัน เป็นการเพิ่มเข้าไป ไม่เขียนทับของเดิม",
  "imp.copyPrompt": "คัดลอกพรอมต์ AI",
  "imp.promptHint":
    "วางข้อความนี้ใน Gemini (หรือ AI ตัวไหนก็ได้) พร้อมภาพหน้าจอแอปบันทึกเงิน เพื่อให้มันสร้าง CSV ให้ หมวดที่ยังไม่มีจะถูกสร้างให้อัตโนมัติ",
  "imp.defaultMonth": "เดือนเริ่มต้น",
  "imp.defaultMonthHint": "(สำหรับแถวที่ไม่ระบุเดือน)",
  "imp.preview": "ดูตัวอย่าง",
  "imp.errNoRows": "อ่านข้อมูลไม่ได้ ต้องเป็นรูปแบบ: category,budget,remaining",
  "imp.errNothing": "ยังไม่ได้เลือกรายการที่จะนำเข้า",
  "imp.create": "＋ สร้าง “{raw}”",
  "imp.skip": "ข้าม",
  "imp.budgetLeft": "งบ {budget} · เหลือ {remaining}",
  "imp.adding": "กำลังเพิ่ม…",
  "imp.addN": "เพิ่ม {n} รายการ",

  // investment
  "common.investment": "ลงทุน",
  "net.leftover": "เหลือเก็บ",
  "net.drawdown": "ดึงเงินสะสม",
  "cat.investment": "ลงทุน",
  "cat.isInvestment": "เป็นการลงทุน",
  "cat.isInvestmentHint":
    "เงินที่ย้ายไปลงทุน — หักจากกระเป๋าเงิน แต่ไม่ถูกนับรวมในบทวิเคราะห์การใช้จ่าย",
  "ins.allocation": "รายรับ · รายจ่าย · ลงทุน",
  "ins.leftoverNote": "รายรับ − รายจ่าย − ลงทุน",
  "ins.investSummary": "สรุปการลงทุน",
  "ins.investedTotal": "ลงทุนไป",
  "ins.ofOutflow": "{pct}% ของเงินที่จ่ายออก",
  "ins.timesIncome": "= {x} เท่าของรายรับเดือนนี้",
  "ins.investByType": "แยกตามประเภท",
  "ins.recentInvest": "ล่าสุด",
  "ins.viewPortfolio": "ดูพอร์ตเต็มใน TOPasset →",
  "ins.noInvest": "ช่วงนี้ยังไม่มีการลงทุน",
  "ins.act.investing": "คุณลงทุนไป {amt} ช่วงนี้ — สร้างความมั่งคั่งต่อไป",
  "ins.taxExport": "Export CSV กองทุนลดหย่อน (ปีนี้)",
  "ins.taxExportOk": "คัดลอก {n} รายการ — วางใน TOPasset ได้เลย",
  "ins.taxExportNone": "ปีนี้ยังไม่มีรายการกองทุนลดหย่อน",
  "toast.added": "เพิ่มแล้ว",
  "toast.saved": "บันทึกแล้ว",
  "toast.deleted": "ลบแล้ว",
  "toast.copied": "คัดลอกแล้ว",
};

export const dictionaries: Record<Lang, Dict> = { en, th };

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  let s = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}
