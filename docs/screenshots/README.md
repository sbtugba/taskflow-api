# Manuel Postman test kanıtları

Testler kullanıcı tarafından yapılmış ve doğrulanmıştır. Altı ek görüntü 16 Ekim 2026 tarihinde orijinal PNG baytları değiştirilmeden buraya kopyalanmıştır. Kaynak ve hedef SHA-256 değerleri eşleşmektedir. Görüntüler düzenlenmemiş veya yeniden üretilmemiştir.

| İşlem | Görüntü | Görünen sonuç |
|---|---|---|
| POST `/tasks` | [01-post-tasks-201.png](01-post-tasks-201.png) | 201 Created |
| GET `/tasks` | [02-get-tasks-200.png](02-get-tasks-200.png) | 200 OK; görev dizisi |
| GET `/tasks/:id` | [03-get-task-200.png](03-get-task-200.png) | 200 OK; görev detayı |
| PUT `/tasks/:id` | [04-put-task-200.png](04-put-task-200.png) | 200 OK; completed ve değişen updatedAt |
| DELETE `/tasks/:id` | [05-delete-task-204.png](05-delete-task-204.png) | 204 No Content; boş yanıt alanı |
| Silinen göreve GET | [06-get-deleted-task-404.png](06-get-deleted-task-404.png) | 404 Not Found; TASK_NOT_FOUND |

Aynı görev kimliği altı görüntüde izlenebiliyor. Liste görüntüsünün altı dizi kapanışını tam göstermiyor; görev ve 200 durumu okunabiliyor. Kanıt olduğu gibi korunmuştur. Eksik görüntü yoktur. Logger ve kalıcılık ayrıca otomatik testlerle doğrulanır.
