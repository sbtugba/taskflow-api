# TASKFLOW — Task Veri Modeli

## Tasarım kararlarının kaynağı

Alan adları kullanıcı tarafından verilmiştir. Yönerge alan tiplerini, enum değerlerini, varsayılanları veya ID biçimini zorunlu tutmaz. Aşağıdaki ayrıntılar uygulama için önerilen tasarım sözleşmesidir; yönerge zorunluluğu olarak yorumlanmamalıdır.

| Alan | JSON tipi | Oluşturma davranışı | Güncelleme davranışı |
|---|---|---|---|
| `id` | string, UUID | Sunucu `crypto.randomUUID()` ile üretir | Değişmez |
| `title` | string | İstemci sağlar, kırpıldıktan sonra boş olamaz | Gönderilirse değiştirilir |
| `description` | string | Gönderilmezse `""` | Gönderilirse değiştirilir; boş olabilir |
| `assignee` | string | Gönderilmezse `""` (atanmamış) | Gönderilirse değiştirilir; boş değer atamayı kaldırır |
| `status` | string | Gönderilmezse `pending` | Gönderilirse değiştirilir |
| `priority` | string | Gönderilmezse `medium` | Gönderilirse değiştirilir |
| `createdAt` | string, ISO 8601 UTC | Sunucu oluşturur | Değişmez |
| `updatedAt` | string, ISO 8601 UTC | İlk anda `createdAt` ile aynı | Her başarılı güncellemede sunucu yeniler |

`status`: `pending`, `in-progress`, `completed`.

`priority`: `low`, `medium`, `high`.

Durumlar arasında ek geçiş kısıtı yoktur; tamamlanan görev yeniden açılabilir. Atanan kişi bir kullanıcı tablosuna bağlı değildir. Başlıklar benzersiz olmak zorunda değildir.

Yazılabilir metinler kırpılır; otomatik tip dönüşümü yapılmaz. `null`, yanlış tipler, tanımsız enum değerleri, bilinmeyen alanlar ve sunucunun yönettiği alanların istek gövdesinde gönderilmesi `400` ile reddedilir. Bunlar veri sözleşmesini koruyan temel servis kontrolleridir. Ayrı ve gelişmiş validation middleware isteğe bağlı kalır. Güncelleme en az bir yazılabilir alan içermelidir.

## Örnek kayıt

Bu JSON yalnızca doküman örneğidir; üretim verisi değildir. Aşama 2’de başlangıç veri dosyası oluşturulmuştur.

```json
{
  "id": "8e43f427-5cfa-4d84-9eb0-79aabc00b65f",
  "title": "Müşteri giriş hatasını düzelt",
  "description": "Geçerli bilgilerle giriş yapılamamasını gider.",
  "assignee": "musa",
  "status": "pending",
  "priority": "high",
  "createdAt": "2026-10-16T09:00:00.000Z",
  "updatedAt": "2026-10-16T09:00:00.000Z"
}
```

## Saklama ve bütünlük

Planlanan `src/data/tasks.json` dosyasının kökü Task kayıtlarından oluşan bir dizidir; başlangıç içeriği `[]` olacaktır. Başarılı oluşturma, güncelleme ve silme işlemleri diske yazılır; sunucu yeniden başlatıldığında kayıtlar korunur. Silme kalıcıdır; soft delete alanı eklenmez.

Servis dosyanın okuma ve yazma işlemlerini Node.js `fs/promises` ve `path` ile yönetir. Aynı süreçteki tüm değişiklikler, okuma–değiştirme–yazma adımlarının tamamını kapsayan sırada yürütülür. Önce aynı klasörde geçici dosyaya yazılır, ardından asıl dosya değiştirilir. HTTP başarısı yalnızca disk yazımı başarılıysa döner.

Beklenmeyen eksik, okunamayan veya bozuk veri dosyası sessizce boş diziye dönüştürülmez; veri kaybını önlemek için hata üretilir. İçerik JSON dizisi ve kayıt sözleşmesi açısından kontrol edilir. Geçici dosya yöntemi tam yedekleme veya elektrik kesintisine karşı dayanıklılık garantisi değildir.

Bu çözüm tek Node.js süreci ve küçük eğitim projesi içindir. Birden fazla sunucu sürecinin aynı dosyaya yazması desteklenmez; tüm kayıtları belleğe okuyarak çalışır.
