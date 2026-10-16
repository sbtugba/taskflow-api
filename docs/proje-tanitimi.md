# TASKFLOW — Proje Tanıtım Dokümanı

Node.js ile Backend Programlama Bitirme Projesi · 16 Ekim 2026

## Amaç ve senaryo

TASKFLOW, bir yazılım şirketindeki görevlerin ve çalışan sorumluluklarının takip edilmesini sağlayan REST API projesidir. Amaç; Node.js ve Express.js ile routing, CRUD işlemleri, middleware ve JSON veri yönetimini katmanlı bir uygulamada bir araya getirmektir.

Ekip lideri, “Login API geliştirme” görevini yapılacak işi anlatan açıklamasıyla oluşturur, Ahmet'e atar ve önceliğini yüksek olarak belirler. Görev varsayılan olarak bekleyen durumdadır. Ekip görevin detayını görüntüler; çalışmaya başlandığında durumunu `in-progress`, iş bittiğinde `completed` olarak günceller. Ekip lideri tüm görevleri listeler, gerektiğinde açıklamayı veya atanan kişiyi değiştirir ve artık gerekli olmayan görevi siler.

Atanan kişi metin olarak tutulur. Ayrı kullanıcı hesabı, yetkilendirme veya proje kaynağı bu zorunlu görev modülünün kapsamında değildir. Sistem HTTP üzerinden JSON yanıtları verir; bir kullanıcı arayüzü gerektirmez.

## Veri ve temel özellikler

Her görev sekiz alan içerir: benzersiz `id`, başlık `title`, açıklama `description`, atanan kişi `assignee`, durum `status`, öncelik `priority`, oluşturulma zamanı `createdAt` ve güncellenme zamanı `updatedAt`. Kimlik UUID olarak sunucuda üretilir; zamanlar UTC biçiminde tutulur. Başlık zorunludur. Durumlar `pending`, `in-progress`, `completed`; öncelikler `low`, `medium`, `high` değerleridir. Varsayılan durum `pending`, öncelik `medium` olur.

POST `/tasks` görev oluşturur; GET `/tasks` tüm görevleri, GET `/tasks/:id` belirli görevi döndürür. PUT `/tasks/:id` gönderilen alanları günceller, gönderilmeyen alanları korur. DELETE `/tasks/:id` görevi kalıcı siler. Başarılı oluşturma 201, okuma/güncelleme 200, silme gövdesiz 204 döndürür. Bulunamayan görev 404, geçersiz temel istek 400, beklenmeyen hata 500 döndürür. Hatalar tutarlı JSON biçimindedir.

## Teknik yapı ve veri yönetimi

Node.js, Express.js ve JavaScript kullanılır; modül sistemi ES Modules'dür. Routes HTTP yollarını, controllers istek ve yanıtları, services iş kuralları ve veri erişimini, middleware logger ve hata yönetimini, data kalıcı JSON dosyasını içerir. Express tek doğrudan bağımlılıktır; veritabanı veya ORM kullanılmaz.

Görevler `src/data/tasks.json` dosyasında saklanır. Değişiklikler sıraya alınarak önce geçici dosyaya yazılır, ardından asıl dosya değiştirilir. Yazılan veriler yeniden başlatma sonrasında korunur. Eksik, boş veya bozuk dosya sessizce sıfırlanmaz. Çözüm küçük eğitim projesi ve tek Node.js süreci içindir; çok süreçli yazma ve tam yedekleme garantisi sunmaz.

Logger middleware tüm istekleri HTTP method, endpoint ve zaman damgasıyla konsola kaydeder. Merkezi hata işleyicisi dahili hata ayrıntılarını istemciye iletmeden ortak yanıt üretir. GET `/api/health`, uygulamanın HTTP yanıtı verdiğini gösterir.

## Doğrulama ve teslim

Manuel Postman testleri kullanıcı tarafından tamamlanmış ve doğrulanmıştır. Oluşturma 201, listeleme/detay/güncelleme 200, silme 204 ve silinen görevin sorgulanması 404 sonuçları altı orijinal ekran görüntüsüyle belgelenmiştir. Otomatik entegrasyon testleri ayrıca CRUD, logger, yeniden başlatma sonrası kalıcılık, eşzamanlı dosya işlemleri ve hata durumlarını kontrol eder.

Teslim; bu kısa tanıtım belgesini, kurulum/çalıştırma ve endpoint bilgilerini içeren README'yi, Postman ekran görüntülerini ve package dosyaları dahil tüm kaynak kodları kapsar. Filtreleme, arama, sayfalama, gelişmiş validation middleware ve raporlama isteğe bağlı olduğundan eklenmemiştir. Son teslim tek public GitHub reposuyla yapılacaktır; repo oluşturma ve push henüz gerçekleştirilmemiştir.
