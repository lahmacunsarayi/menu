# Lahmacun Sarayı QR Menü Sistemi

Bu proje, Lahmacun Sarayı için QR kod ile erişilebilen modern bir menü ve sipariş sistemi içerir.

## Kurulum Adımları

1. Firebase Kurulumu:
   - [Firebase Console](https://console.firebase.google.com)'a gidin
   - Yeni bir proje oluşturun
   - Web uygulaması ekleyin
   - Verilen Firebase yapılandırma kodunu `app.js` dosyasındaki `firebaseConfig` değişkenine ekleyin

2. Google Sheets ve Apps Script Kurulumu:
   - Yeni bir Google Sheets oluşturun
   - İki sayfa ekleyin: "Menu" ve "DiscountCodes"
   - Menu sayfası sütunları: id, name, description, price, image
   - DiscountCodes sayfası sütunları: code, discount_percentage, valid_until

3. Apps Script Kurulumu:
   - Google Sheets'te Tools > Script editor'e tıklayın
   - Aşağıdaki Apps Script kodunu ekleyin ve deploy edin
   - Oluşturulan web app URL'sini `app.js` dosyasındaki `YOUR_APPS_SCRIPT_URL` ile değiştirin

4. WhatsApp Entegrasyonu:
   - `app.js` dosyasında `RESTAURANT_PHONE_NUMBER` değişkenini restoranın WhatsApp numarası ile güncelleyin
   - Numara uluslararası formatta olmalıdır (örn: 905xxxxxxxxx)

## Özellikler

- Modern ve responsive tasarım
- Konum bazlı menü görüntüleme
- WhatsApp üzerinden sipariş verme
- İndirim kodu sistemi
- Sepet yönetimi

## Teknolojiler

- Firebase (ücretsiz plan)
- Google Sheets
- Google Apps Script
- HTML5/CSS3
- JavaScript
- Bootstrap 5
