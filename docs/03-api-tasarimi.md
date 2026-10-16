# TASKFLOW — REST API Tasarımı

## Genel sözleşme

Yönerge beş CRUD işlemini zorunlu tutar. Aşağıdaki yollar, güncelleme yöntemi, yanıt biçimleri ve hata davranışları tasarım kararıdır. Yönergedeki `/tasks` örnekleriyle uyumlu olarak Task yollarında ek `/api` veya sürüm öneki kullanılmaz.

Aşama 2 kullanıcı talebiyle bağımsız `GET /api/health` altyapı endpoint'i eklenmiştir. HTTP `200` ve `{"status":"ok"}` döndürür; Task yollarını değiştirmez ve veri dosyasının sağlığını doğrulamaz. JSON ayrıştırıcının boyut sınırı aşılırsa altyapı `413 PAYLOAD_TOO_LARGE` döndürür.

İstek gövdeleri JSON nesnesidir; gövdeli istekler `Content-Type: application/json` kullanır. Başarılı yanıtlar doğrudan Task nesnesi veya Task dizisidir. `204` yanıtının gövdesi yoktur. Task alanlarının ayrıntıları [veri modelinde](02-veri-modeli.md) tanımlanmıştır.

| İşlem | Method | Endpoint | Başarı | Temel hata |
|---|---|---|---|---|
| Görev oluşturma | POST | `/tasks` | `201 Created`, oluşturulan Task | `400`, `415`, `500` |
| Tüm görevleri listeleme | GET | `/tasks` | `200 OK`, Task dizisi | `500` |
| Görev detayı | GET | `/tasks/:id` | `200 OK`, Task | `404`, `500` |
| Kısmi güncelleme | PUT | `/tasks/:id` | `200 OK`, güncel Task | `400`, `404`, `415`, `500` |
| Kalıcı silme | DELETE | `/tasks/:id` | `204 No Content` | `404`, `500` |

Güncelleme için PUT seçilir; gönderilmeyen alanlar korunur. Ayrı PATCH veya durum değiştirme endpoint'i gerekmez. `:id` sunucunun ürettiği kimliktir; eşleşmeyen her değer `404` döndürür. Liste boşsa yanıt `[]` olur; kayıtlar dosyadaki eklenme sırasıyla döner. Bu kapsamda query parametreleri işlenmez; filtreleme/sayfalama sözleşmesi yoktur.

## Oluşturma

`POST /tasks` örnek gövde:

```json
{
  "title": "Müşteri giriş hatasını düzelt",
  "description": "Geçerli bilgilerle giriş yapılamamasını gider.",
  "assignee": "musa",
  "priority": "high"
}
```

`title` zorunludur. Diğer yazılabilir alanların varsayılanları veri modelinde verilmiştir. `status` gönderilebilir. Yanıt `201` ve veri modelindeki sekiz alanlı Task nesnesidir; `Location: /tasks/<oluşturulan-id>` başlığı eklenir.

## Liste ve detay

`GET /tasks` yanıtı, veri modelindeki Task nesnelerinden oluşan dizidir. `GET /tasks/8e43f427-5cfa-4d84-9eb0-79aabc00b65f` aynı kaydın tamamını nesne olarak döndürür. İkisi de `200` kullanır.

## Güncelleme

`PUT /tasks/8e43f427-5cfa-4d84-9eb0-79aabc00b65f` örnek gövde:

```json
{
  "status": "in-progress",
  "assignee": "ayse"
}
```

Yanıt `200` ve sekiz alanlı güncel Task nesnesidir. `status`, `assignee` ve sunucunun belirlediği `updatedAt` değişir; diğer alanlar korunur. Her başarılı PUT, değerler aynı gönderilmiş olsa da `updatedAt` alanını yeniler. Geçersiz istek kaydı kısmen değiştirmez.

## Silme

`DELETE /tasks/8e43f427-5cfa-4d84-9eb0-79aabc00b65f` başarılıysa `204` döner ve yanıt gövdesi gönderilmez. Ardından aynı kimlikle detay, güncelleme veya silme isteği `404` döndürür.

## Hatalar

Tüm hata yanıtları şu ortak biçimi kullanır:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Görev bulunamadı."
  }
}
```

| HTTP | Kod | Koşul |
|---|---|---|
| 400 | `INVALID_JSON` | JSON gövdesi ayrıştırılamıyor |
| 400 | `INVALID_TASK_DATA` | Nesne olmayan/boş gövde veya veri modeli sözleşmesine aykırı alan |
| 404 | `TASK_NOT_FOUND` | Kimlikle eşleşen görev yok |
| 404 | `ROUTE_NOT_FOUND` | Tanımlanmayan method veya endpoint |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | POST/PUT isteği JSON içerik türünde değil |
| 500 | `INTERNAL_ERROR` | Beklenmeyen hata veya dosya okuma/yazma sorunu |

Veri hatalarında mesaj ilgili alanı açıklar. İstek işleme sırası: içerik türü, JSON ayrıştırma, PUT için kaydı bulma, alan sözleşmesi, değişiklik ve kalıcı yazma. Gövde ayrıştırılmadan oluşan hatalar da ortak JSON biçimine çevrilir. İstemciye dosya yolu, stack trace veya dahili hata ayrıntısı verilmez; teknik ayrıntı konsola kaydedilir.

## Sonraki aşama için doğrulama hedefi

Postman'de önce görev oluşturulacak; dönen kimlikle listeleme, detay, PUT ve DELETE doğrulanacaktır. Silinen kayıt için `404`, boş liste için `[]` ve yeniden başlatma sonrası kalıcılık kontrol edilecektir. Her isteğin logger çıktısında method, endpoint ve zaman damgası görülecektir. Bu kontroller henüz çalıştırılmamıştır; zorunlu Postman ekran görüntüleri Aşama 4'te üretilecektir.

Aşama 3 güncellemesi: Kullanıcı talebiyle güncelleme yöntemi PUT olarak değiştirildi. Önceki tasarımın gönderilmeyen alanları koruma davranışı sürer; bu API PUT ile kısmi alan güncellemesine izin verir. Durum değeri `in-progress` olarak güncellendi.
