# TODO: إصلاح index.html - مكتمل ✅

## الخطوات المنجزة:
- [x] إنشاء TODO.md
- [x] تعديل index.html: إضافة onsubmit="sendForm(event)" لـ #contactForm
- [x] تعديل index.html: حذف Firebase v8 القديم من النهاية

## النتيجة:
- تم حذف Firebase v8 scripts و initializers من نهاية index.html
- تم ربط نموذج التواصل (#contactForm) بدالة sendForm (v10 compatible)
- الصفحة جاهزة للاختبار: املأ النموذج → تحقق console logs → Firestore entry

## اقتراح اختبار:
افتح index.html في المتصفح، املأ نموذج "اطلب تصميم خاص"، أرسل → تحقق:
1. Console: "STEP 0: FORM WORKING" ... "Saved to Firestore ID"
2. Toast: رسالة نجاح
3. Firestore: مجموعة "forms" (إذا سمحت القواعد)

مهمة مكتملة!
