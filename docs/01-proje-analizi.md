# TASKFLOW — Proje Tanıtımı ve İhtiyaç Analizi

Tarih: 16 Ekim 2026 · Durum: Aşama 1 tamamlandı; kullanıcı Aşama 2'ye geçişi onayladı.

## Kaynak ve kapsam

Kaynak: [Backend Geliştirme Proje Yönergesi](https://drive.google.com/file/d/1kvPtJDxPpr8-dY-d_EIq0HSCuLYsq3zb/view). Özellikle “Aşama 01–02”, “Aşama 03”, “Aşama 04” ve “İsteğe Bağlı” bölümleri esas alınmıştır.

Bu aşamada yalnızca senaryo, veri modeli, endpoint sözleşmesi ve mimari plan hazırlanır. Node.js projesinin başlatılması, Express kurulumu, uygulama klasörlerinin oluşturulması ve kodlama sonraki aşamalardadır.

## Amaç ve senaryo

Bir yazılım şirketinin ekip lideri, ekip üyelerinin sorumluluklarını ve görevlerin ilerleyişini ortak bir sistemden takip etmek ister. TASKFLOW bu ihtiyacı JSON üzerinden iletişim kuran bir REST API ile karşılar.

Ekip lideri “Müşteri giriş hatasını düzelt” başlıklı bir görev oluşturur, açıklamasını yazar, görevi Musa'ya atar ve yüksek öncelik belirler. Ekip üyesi görevin detayını görüntüler; çalışmaya başladığında durumunu `in-progress`, bitirdiğinde `completed` olarak günceller. Ekip lideri tüm görevleri listeler, gerektiğinde görev bilgilerini veya atanan kişiyi değiştirir ve artık ihtiyaç duyulmayan görevi siler.

Bu roller senaryoyu anlatır; kimlik doğrulama veya yetkilendirme modülü gerektirmez. Çalışan ataması `assignee` metin alanıyla temsil edilir. Yönergenin genel başlığında projeler geçse de zorunlu modül görev yönetimidir; ayrı Project veya User kaynağı tasarlanmamıştır.

## Gereksinimlerin izlenebilirliği

| Gereksinim | Kaynak | Planlanan karşılık |
|---|---|---|
| Senaryo, veri yapısı, API mimarisi ve endpoint listesi | Yönerge Aşama 1 | Bu belge ve diğer üç tasarım belgesi |
| Node.js ve Express routing altyapısı | Yönerge Aşama 2 | Mimari plan; uygulama onay sonrasında |
| Ekleme, listeleme, detay, güncelleme, silme | Yönerge Aşama 3 | Beş `/tasks` endpoint'i |
| Çalışana atama, durum ve öncelik takibi | Yönerge senaryosu | `assignee`, `status`, `priority` |
| Her isteğin method, endpoint ve zaman damgasını kaydetme | Yönerge Aşama 3 | Konsola yazan temel logger |
| CRUD işlemlerinin Postman ile gösterilmesi | Yönerge Aşama 4 | Sonraki aşamada beş işlemin ekran görüntüsü |
| Tanıtım belgesi, README, test ekran görüntüleri ve kaynak kod | Yönerge teslim bölümü | Tanıtım burada; diğer çıktılar ilgili aşamada |
| Tek public GitHub reposuyla teslim | Yönerge teslim formatı | Son teslim adımı; bu aşamada yayınlama yapılmaz |
| JavaScript, JSON saklama ve belirtilen beş mimari katman | Kullanıcı talebi | Veri modeli ve mimari belgesi |
| Sekiz Task alanı | Kullanıcı talebi | Veri modeli belgesi |

## Kapsam sınırları

Zorunlu hedef: görev CRUD işlemleri, Express routing, temel logger, kalıcı JSON saklama ve sonraki aşamada Postman doğrulaması.

Yönergede isteğe bağlı olan filtreleme, arama, sayfalama, sıralama, kullanıcı bazlı listeleme, validation middleware, rapor servisleri ve kapsamlı kullanım/test kılavuzları temel kapsama alınmamıştır. Bu aşamadaki API tasarım belgesi Aşama 1 çıktısıdır.

Veritabanı, ORM, TypeScript, frontend, kimlik doğrulama, Docker ve ek çatı/servis planlanmaz. Tek harici çalışma zamanı bağımlılığı Express olacaktır; dosya işlemleri ve kimlik üretimi Node.js yerleşik modülleriyle karşılanır.

## Aşama 1 tamamlanma ölçütü

Senaryo tanımlanmış, sekiz alanın veri sözleşmesi belirlenmiş, beş CRUD endpoint'i hazırlanmış ve katman sorumluluklarıyla klasör ağacı belgelenmiş olmalıdır. Uygulama ve test sonuçları bu aşamanın çıktısı değildir. Aşama 2'ye ancak kullanıcı onayından sonra geçilir.
