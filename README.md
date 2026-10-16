# TASKFLOW

Node.js, Express.js ve JavaScript ile geliştirilen REST API. Geliştirme ve kullanıcı tarafından doğrulanan manuel Postman testleri tamamlandı. Proje GitHub’da public olarak yayınlanmıştır. Teslim bağlantısı: [sbtugba/taskflow-api](https://github.com/sbtugba/taskflow-api).

## Kurulum ve çalıştırma

Node.js 24 LTS ve npm gerekir. Public [sbtugba/taskflow-api](https://github.com/sbtugba/taskflow-api) reposundan projeyi ZIP olarak indirin veya git clone https://github.com/sbtugba/taskflow-api.git komutuyla klonlayın; taskflow-api klasörüne geçip package.json bulunan konumda terminal açın. Proje klasöründe:

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

`npm ci` kilit dosyasındaki bağımlılıkları kurar; alternatif olarak `npm install` kullanılabilir. `.env` isteğe bağlıdır. Varsayılan port `3000` olur; `PORT` ile değiştirilebilir. `NODE_ENV` örnekte `development` olarak verilmiştir. Node.js `.env` dosyasını yerleşik desteğiyle yükler; mevcut ortam değişkenleri önceliklidir. Geçersiz portta süreç hata ile sonlanır.

Geliştirme sırasında dosya değişikliklerinde yeniden başlatmak için `npm run dev` kullanılır. Sunucuyu durdurmak için `Ctrl+C` kullanılır.

## Sağlık kontrolü

```powershell
Invoke-WebRequest http://localhost:3000/api/health
```

Beklenen: HTTP `200`, `Content-Type: application/json` ve `{"status":"ok"}`. Bu endpoint yalnızca HTTP uygulamasının yanıt verdiğini gösterir; veri dosyası kontrolü yapmaz.

Tanımlanmayan yollar ortak JSON biçiminde `404 ROUTE_NOT_FOUND` döndürür. Hatalı JSON `400 INVALID_JSON`, beklenmeyen sunucu hataları ayrıntı sızdırmadan `500 INTERNAL_ERROR` döndürür.

## Mimari

ES Modules kullanılır. `src/app.js` Express yapılandırmasını dışa aktarır; port dinlemez. `src/server.js` ortamdan portu okuyup sunucuyu başlatır. Health isteği router üzerinden controller'a gider. Health kontrolünde iş kuralı veya veri erişimi olmadığından servis gerekmez. `src/services/taskService.js` iş kurallarını ve dosya işlemlerini yönetir; `src/data/tasks.json` başlangıçta boş dizidir.

Task yolları: POST/GET `/tasks`, GET/PUT/DELETE `/tasks/:id`. PUT gönderilmeyen alanları korur. Durumlar: `pending`, `in-progress`, `completed`. Öncelikler: `low`, `medium`, `high`. `/api/health`, Aşama 2 talebiyle eklenen bağımsız altyapı yoludur. Filtreleme, raporlama ve validation middleware eklenmemiştir.

Analiz ve tasarım belgeleri [docs/](docs/) altındadır. Kaynak kodlar ve teslim belgeleri public [sbtugba/taskflow-api](https://github.com/sbtugba/taskflow-api) reposunda yayınlanmıştır.

## Otomatik doğrulama

`npm test` (veya `node tests/stage3.integration.js`) gerçek sunucu süreçleriyle entegrasyon testlerini çalıştırır. Test yerel `tasks.json` dosyasını geçici değiştirir ve `finally` içinde yedeklediği içeriği geri yükler. Yalnızca geliştirme ortamında, başka TASKFLOW süreci dosyayı kullanmıyorken çalıştırın. Test için 31947 portu kullanılır.

JSON saklama tek süreç içindir. Okuma/değiştirme/yazma işlemleri sıraya alınır, geçici dosya rename ile değiştirilir. Windows geçici kilitlerinde en fazla dört yeniden deneme yapılır. Eksik, boş ve bozuk dosya 500 üretir; otomatik sıfırlanmaz. İlk kurulumda depodaki `[]` içeren tasks.json kullanılmalıdır. Çok süreçli yazma ve tam yedekleme desteklenmez.

## Endpoint listesi

POST/PUT istekleri Content-Type: application/json kullanır. :id yerine görev kimliği yazılır.

| Method | Yol | Başarı |
|---|---|---|
| GET | /api/health | 200 |
| POST | /tasks | 201 |
| GET | /tasks | 200 |
| GET | /tasks/:id | 200 |
| PUT | /tasks/:id | 200 |
| DELETE | /tasks/:id | 204, boş gövde |

POST örneği:

```json
{"title":"Login API geliştirme","assignee":"Ahmet","priority":"high"}
```

Yanıt id, title, description, assignee, status, priority, createdAt ve updatedAt alanlarını içerir. title zorunludur; description ve assignee varsayılan olarak boş metindir. Durum pending, öncelik medium varsayılır. PUT örneği: {"status":"completed"}. Kimlik ve createdAt değişmez, updatedAt sunucuda yenilenir. Liste boşsa [] döner. Yanlış içerik türü 415, büyük gövde 413 döndürür.

## Teslim dosyaları ve manuel testler

- [Kısa proje tanıtımı](docs/proje-tanitimi.md)
- Kurulum notu: bu README
- [Altı orijinal Postman ekran görüntüsü](docs/screenshots/README.md)
- src/, tests/, package.json ve package-lock.json
- [100 puanlık ölçütlere göre teslim kontrol raporu](docs/07-teslim-kontrol-raporu.md)

Manuel Postman sonuçları kullanıcı tarafından doğrulanmıştır: POST 201, liste/detay/PUT 200, DELETE 204, silinen göreve GET 404. Görüntüler değiştirilmeden saklanmıştır. Otomatik kontroller ayrı raporlanır.

.env, node_modules/, .npm-cache/, loglar, yedek ve geçici dosyalar .gitignore ile dışlanır. src/data/tasks.json teslim başlangıcı için [] içerir; gerçek kişi veya görev verilerini public depoya eklemeyin.
