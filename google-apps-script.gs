/**
 * سُمو — مستقبِل بيانات المختبرين الداخليين
 * يُضيف كل تسجيل جديد كصفٍّ في Google Sheet.
 *
 * طريقة الاستخدام مشروحة في ملف SETUP-testers.md.
 */

// اسم ورقة العمل (التبويب) داخل الجدول التي ستُخزَّن فيها البيانات.
const SHEET_NAME = 'Testers';

function doPost(e) {
  try {
    const sheet = getSheet_();
    const params = (e && e.parameter) ? e.parameter : {};

    const name   = String(params.name   || '').trim();
    const email  = String(params.email  || '').trim();
    const device = String(params.device || '').trim();
    const source = String(params.source || '').trim();

    // تحقّق أساسي من صحة المدخلات.
    if (!name || !email || !device) {
      return json_({ result: 'error', message: 'حقول ناقصة' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ result: 'error', message: 'بريد غير صالح' });
    }

    // منع التكرار: لا نُضيف نفس البريد مرتين.
    const emails = sheet.getLastRow() > 1
      ? sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    if (emails.some(function (x) { return String(x).trim().toLowerCase() === email.toLowerCase(); })) {
      return json_({ result: 'success', message: 'مسجّل مسبقاً' });
    }

    sheet.appendRow([
      new Date(),   // التاريخ والوقت
      name,         // الاسم
      email,        // البريد الإلكتروني
      device,       // نوع الجهاز (Android / Apple)
      source        // مصدر التسجيل
    ]);

    return json_({ result: 'success' });
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  }
}

// اختبار سريع عند فتح الرابط في المتصفح.
function doGet() {
  return json_({ result: 'ok', message: 'Sumo testers endpoint is live.' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // أضِف صف العناوين إن كانت الورقة فارغة.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['التاريخ', 'الاسم', 'البريد الإلكتروني', 'نوع الجهاز', 'المصدر']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
