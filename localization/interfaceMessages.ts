/** Istima interface localization - wave 1. Sacred source content is excluded. */
export const interfaceLocales = ['ar', 'en', 'ur', 'id', 'ms'] as const;
export type InterfaceLocale = (typeof interfaceLocales)[number];
export const rtlInterfaceLocales: readonly InterfaceLocale[] = ['ar', 'ur'];
export const interfaceMessages = {
  en: {appName:'Istima',home:'Home',search:'Search',library:'Library',settings:'Settings',language:'Language',play:'Play',pause:'Pause',download:'Download',downloads:'Downloads',favorites:'Favorites',retry:'Try again',cancel:'Cancel',save:'Save',close:'Close',loading:'Loading...',offline:'You are offline',error:'Something went wrong',noResults:'No results found'},
  ar: {appName:'Istima',home:'الرئيسية',search:'بحث',library:'المكتبة',settings:'الإعدادات',language:'اللغة',play:'تشغيل',pause:'إيقاف مؤقت',download:'تنزيل',downloads:'التنزيلات',favorites:'المفضلة',retry:'حاول مجددا',cancel:'إلغاء',save:'حفظ',close:'إغلاق',loading:'جار التحميل...',offline:'أنت غير متصل بالإنترنت',error:'حدث خطأ ما',noResults:'لم يتم العثور على نتائج'},
  ur: {appName:'Istima',home:'صفحہ اول',search:'تلاش',library:'کتب خانہ',settings:'ترتیبات',language:'زبان',play:'چلائیں',pause:'روکیں',download:'ڈاؤن لوڈ',downloads:'ڈاؤن لوڈز',favorites:'پسندیدہ',retry:'دوبارہ کوشش کریں',cancel:'منسوخ کریں',save:'محفوظ کریں',close:'بند کریں',loading:'لوڈ ہو رہا ہے...',offline:'آپ انٹرنیٹ سے منسلک نہیں ہیں',error:'کچھ غلط ہو گیا',noResults:'کوئی نتیجہ نہیں ملا'},
  id: {appName:'Istima',home:'Beranda',search:'Cari',library:'Pustaka',settings:'Pengaturan',language:'Bahasa',play:'Putar',pause:'Jeda',download:'Unduh',downloads:'Unduhan',favorites:'Favorit',retry:'Coba lagi',cancel:'Batal',save:'Simpan',close:'Tutup',loading:'Memuat...',offline:'Anda sedang offline',error:'Terjadi kesalahan',noResults:'Tidak ada hasil'},
  ms: {appName:'Istima',home:'Laman utama',search:'Cari',library:'Pustaka',settings:'Tetapan',language:'Bahasa',play:'Main',pause:'Jeda',download:'Muat turun',downloads:'Muat turun',favorites:'Kegemaran',retry:'Cuba lagi',cancel:'Batal',save:'Simpan',close:'Tutup',loading:'Memuatkan...',offline:'Anda di luar talian',error:'Sesuatu tidak kena',noResults:'Tiada hasil ditemui'}
} as const;
export function getInterfaceMessages(locale: string) {
  const code = locale.toLowerCase().split(/[-_]/)[0] as InterfaceLocale;
  return interfaceMessages[code] ?? interfaceMessages.en;
}
