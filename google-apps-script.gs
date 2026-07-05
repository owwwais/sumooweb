/**
 * سُمو — مستقبِل بيانات المختبرين والملاحظات
 * يوجّه كل طلب حسب الحقل «form»:
 *   - form = feedback           → ورقة «Feedback» (الملاحظات)
 *   - غير ذلك (التسجيل الافتراضي) → ورقة «Testers»  (المختبرون)
 *
 * طريقة الاستخدام مشروحة في ملف SETUP-testers.md.
 * ملاحظة: بعد أي تعديل هنا، أعِد النشر (New version) حتى تسري التغييرات.
 */

const TESTERS_SHEET  = 'Testers';
const FEEDBACK_SHEET = 'Feedback';

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const form = String(params.form || '').trim().toLowerCase();

    if (form === 'feedback') {
      return handleFeedback_(params);
    }
    return handleTester_(params);
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  }
}

// اختبار سريع عند فتح الرابط في المتصفح.
function doGet() {
  return json_({ result: 'ok', message: 'Sumo endpoint is live.' });
}

/* ----------------------- المختبرون ----------------------- */
function handleTester_(params) {
  const name   = String(params.name   || '').trim();
  const email  = String(params.email  || '').trim();
  const device = String(params.device || '').trim();
  const source = String(params.source || '').trim();

  if (!name || !email || !device) {
    return json_({ result: 'error', message: 'حقول ناقصة' });
  }
  if (!isEmail_(email)) {
    return json_({ result: 'error', message: 'بريد غير صالح' });
  }

  const sheet = getSheet_(TESTERS_SHEET,
    ['التاريخ', 'الاسم', 'البريد الإلكتروني', 'نوع الجهاز', 'المصدر']);

  // منع التكرار: لا نُضيف نفس البريد مرتين (البريد في العمود 3).
  if (columnHasValue_(sheet, 3, email)) {
    return json_({ result: 'success', message: 'مسجّل مسبقاً' });
  }

  sheet.appendRow([new Date(), name, email, device, source]);
  return json_({ result: 'success' });
}

/* ----------------------- الملاحظات ----------------------- */
function handleFeedback_(params) {
  const name     = String(params.name     || '').trim();
  const email    = String(params.email    || '').trim();
  const device   = String(params.device   || '').trim();
  const category = String(params.category || '').trim();
  const rating   = String(params.rating   || '').trim();
  const message  = String(params.message  || '').trim();
  const source   = String(params.source   || '').trim();

  // الملاحظة نفسها إلزامية فقط؛ باقي الحقول اختيارية.
  if (!message) {
    return json_({ result: 'error', message: 'الملاحظة فارغة' });
  }
  if (email && !isEmail_(email)) {
    return json_({ result: 'error', message: 'بريد غير صالح' });
  }

  const sheet = getSheet_(FEEDBACK_SHEET,
    ['التاريخ', 'الاسم', 'البريد الإلكتروني', 'نوع الملاحظة', 'التقييم', 'الملاحظة', 'المصدر']);

  sheet.appendRow([new Date(), name, email, category, rating, message, source]);
  return json_({ result: 'success' });
}

/* ----------------------- أدوات مساعدة ----------------------- */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function columnHasValue_(sheet, col, value) {
  if (sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues().flat();
  const needle = value.toLowerCase();
  return values.some(function (x) { return String(x).trim().toLowerCase() === needle; });
}

function isEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
