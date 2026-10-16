# TASKFLOW — Mimari ve Klasör Planı

Aşama 2 güncellemesi: ES Modules ve Node.js 24 LTS seçildi. Kullanıcı talebiyle `healthRoutes.js` ve `healthController.js` üzerinden `GET /api/health` eklendi. `app.js` JSON ayrıştırıcı, health router, bulunamayan rota ve merkezi hata işleyiciyi bağlar. `server.js` portu doğrular ve dinlemeyi başlatır. `.env.example`, `.gitignore` ve çalıştırma notları oluşturuldu. `services/` şimdilik yalnızca `.gitkeep`, `data/tasks.json` ise `[]` içerir. Aşağıdaki Task dosyaları, logger ve Postman klasörü sonraki aşamaların planı olarak kalır; Aşama 2'de Task CRUD uygulanmaz.

## Katmanlar ve sorumluluklar

Teknolojiler: Node.js, Express.js ve JavaScript. Kalıcılık: yerel JSON dosyası. Harici bağımlılık olarak yalnızca Express planlanır; logger için ek paket, veri saklamak için veritabanı veya ORM gerekmez.

| Katman | Sorumluluk |
|---|---|
| Routes | HTTP method ve yollarını controller işlevlerine bağlar |
| Controllers | İstek verisini servise aktarır; başarı durum kodunu ve JSON yanıtını oluşturur |
| Services | Task iş kuralları, ID ve zaman üretimi, temel veri sözleşmesi kontrolleri, kayıt arama ve JSON okuma/yazma sırasını yönetir |
| Middleware | Tüm istekleri loglar; JSON ayrıştırma, bulunamayan rota ve merkezi hata yanıtlarını yönetir |
| Data | Kalıcı Task dizisini JSON dosyasında tutar; uygulama mantığı içermez |

Controller dosyaya erişmez; route iş kuralı içermez. Tek kaynak ve küçük kapsam nedeniyle ayrıca repository katmanı eklenmez. `app.js` Express yapılandırmasını, `server.js` dinlemeye başlamayı üstlenir.

## Planlanan klasör ağacı

Aşağıdaki uygulama dosyaları ve klasörleri tasarım önerisidir; Aşama 1'de yalnızca `docs/` dosyaları oluşturulur.

```text
taskflow/
├── docs/
│   ├── 01-proje-analizi.md
│   ├── 02-veri-modeli.md
│   ├── 03-api-tasarimi.md
│   └── 04-mimari-ve-klasor-yapisi.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── controllers/
│   │   └── taskController.js
│   ├── services/
│   │   └── taskService.js
│   ├── middleware/
│   │   ├── logger.js
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   └── data/
│       └── tasks.json
├── package.json
├── package-lock.json
├── README.md
└── postman/
    └── screenshots/
```

`postman/screenshots/` Aşama 4 teslim kanıtlarını, kök README ise gerçek kurulum ve çalıştırma adımlarını içerecektir. Dosya yolları çalışma dizininden bağımsız çözümlenecektir. Kurulum notu uygulama oluştuğunda doğrulanarak yazılacaktır.

## İstek akışı

```text
HTTP isteği
  → logger
  → JSON içerik türü kontrolü (POST/PATCH) ve Express JSON ayrıştırıcı
  → taskRoutes
  → taskController
  → taskService ↔ data/tasks.json
  → controller üzerinden HTTP yanıtı

Eşleşmeyen rota → notFound → errorHandler → JSON hata yanıtı
İşleme hatası → errorHandler → JSON hata yanıtı
```

Logger ayrıştırıcıdan ve rotalardan önce çalışır; başarısız JSON ve bulunamayan yollar dahil tüm API isteklerinde HTTP method, endpoint (`originalUrl`) ve ISO 8601 UTC zaman damgasını konsola yazar. İstek gövdesini kaydetmek gerekmez. Konsol seçimi yönergenin konsol veya dosya şartını karşılar.

`notFound` ve `errorHandler`, tutarlı HTTP hata yanıtları için seçilen basit altyapı parçalarıdır; yönergenin zorunlu tuttuğu middleware logger'dır. Gelişmiş validation middleware planlanmaz. Asenkron servis hataları merkezi hata işleyiciye aktarılır.

## Aşama sınırı ve devam planı

1. Aşama 1: Bu dört belgeyi kullanıcıya sun ve onay bekle.
2. Aşama 2: Onaydan sonra Node.js/Express projesini, uygulama klasörlerini ve routing altyapısını oluştur.
3. Aşama 3: Beş CRUD işlemini, JSON kalıcılığını ve temel logger'ı geliştir.
4. Aşama 4: Postman testlerini tamamla; README, ekran görüntüleri ve kaynak kodla teslimi hazırla.

GitHub reposunu public yapma ve push işlemleri bu tasarım aşamasında gerçekleştirilmez. İsteğe bağlı pratikler ayrıca kapsam kararı verilirse ele alınır.

## Aşama 3 uygulama durumu

Task routes/controller/service ve logger eklendi. Logger JSON ayrıştırıcıdan önce çalışır. Express 5 asenkron hataları merkezi işleyiciye aktarır. Güncelleme son kullanıcı talebiyle PUT `/tasks/:id`, durum değeri `in-progress` oldu. Temel alan kontrolleri servistedir; ayrı validation middleware yoktur. Dosya işlemleri tek süreçte sıraya alınır; Windows geçici dosya kilitlerinde sınırlı yeniden deneme uygulanır.
