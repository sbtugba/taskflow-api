# Aşama 3 — Sonuç raporu

Görev detay, güncelleme ve silme yollarında kimlik parametresi `:id` olarak tamamlandı. Son kullanıcı talebi önceki tasarımın PATCH ve `in_progress` kararlarının yerini aldı: artık PUT ve `in-progress` kullanılır. PUT gönderilmeyen alanları korur.

## Dosyalar

Yeni: `src/routes/taskRoutes.js`, `src/controllers/taskController.js`, `src/services/taskService.js`, `src/middleware/logger.js`, `tests/stage3.integration.js` ve bu rapor.

Değişen: `src/app.js`, `README.md`, `docs/01-proje-analizi.md`, `docs/02-veri-modeli.md`, `docs/03-api-tasarimi.md`, `docs/04-mimari-ve-klasor-yapisi.md`.

## Gerçek doğrulama

Komut: `node tests/stage3.integration.js`. Test Node.js ile gerçek `src/server.js` alt süreçlerini başlatır, HTTP istekleri gönderir, sunucuyu durdurup yeniden başlatır ve disk içeriğini kontrol eder. Ek bağımlılık kurulmadı.

Başarılı kontroller: oluşturma 201 ve varsayılanlar; liste ve detay 200; güncelleme 200 ve değişmeyen oluşturma zamanı; yeniden başlatma sonrası aynı kayıt; silme 204 ve boş gövde; silinen kayıtta GET/PUT/DELETE 404; geçersiz alan/tip/enum için 400; yanlış içerik türü 415; bozuk JSON 400; 20 eşzamanlı oluşturmada benzersiz kimlikler ve kayıpsız disk yazımı; eşzamanlı silme; eksik/boş/bozuk dosyada kontrollü 500 ve içeriğin korunması; hata sonrasında kuyruğun çalışmaya devam etmesi; health, CRUD ve hatalı isteklerin method/endpoint/zaman damgasıyla loglanması.

İlk turlarda başarısız olanlar: JSON `null` için hata kodu beklenenden farklıydı; parser ayarı ile servis sözleşmesi uyumlu hale getirildi. Testin ikinci kapatma çağrısı tamamlanmıyordu; test süreç yönetimi düzeltildi. Eşzamanlı silmede dosya değiştirme 500 üretti; Windows geçici kilitleri için sınırlı yeniden deneme eklendi. Son tam tur: dokuz kontrol grubu başarılı, başarısız kontrol 0. Düzeltmeler sonrası tam tur tekrarlandı.

Testler sonrasında sunucu durduruldu ve veri dosyasının test öncesi içeriği geri yüklendi. Postman testleri ve ekran görüntüleri Aşama 4 kapsamındadır.

## Örnek sözleşme

POST `/tasks` isteği:

```json
{"title":"Giriş hatasını düzelt","assignee":"musa"}
```

201 yanıtı (kimlik ve zamanlar temsili):

```json
{
  "id":"8e43f427-5cfa-4d84-9eb0-79aabc00b65f",
  "title":"Giriş hatasını düzelt",
  "description":"",
  "assignee":"musa",
  "status":"pending",
  "priority":"medium",
  "createdAt":"2026-10-16T14:00:00.000Z",
  "updatedAt":"2026-10-16T14:00:00.000Z"
}
```

PUT `/tasks/:id` isteği: `{"status":"in-progress","priority":"high"}`. Yanıt 200 ve tüm güncel alanlardır; ID ve createdAt korunur, updatedAt yenilenir. DELETE yanıtı 204 ve boş gövdedir. Silinen kaydın GET yanıtı:

```json
{"error":{"code":"TASK_NOT_FOUND","message":"Görev bulunamadı."}}
```

## Sınırlar

Dosya kuyruğu tek Node.js süreci içindir; birden çok süreçle ortak dosyaya yazılmaz. Geçici dosya ve rename tam yedekleme veya güç kesintisine dayanıklılık garantisi sağlamaz. Kalıcı dosya erişim hataları 500 döndürür. Eksik/boş/bozuk dosya otomatik sıfırlanmaz; veri korunarak müdahale beklenir. Filtreleme, arama, sayfalama, gelişmiş validation middleware ve raporlama eklenmedi. Aşama 4 kullanıcı onayını bekler.
