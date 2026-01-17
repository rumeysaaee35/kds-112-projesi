# KDS 112 Karar Destek Sistemi Projesi


## 📌 Proje Tanımı
Bu proje, **112 Acil Komuta Merkezleri** için geliştirilmiş, **veriye dayalı karar verme süreçlerini destekleyen** bir sunucu tabanlı yazılım uygulamasıdır.  
Sistem; acil vaka kayıtları, ekip performansları, hastane doluluk oranları ve ulaşım süreleri gibi kritik verileri analiz ederek yöneticilerin **hızlı ve doğru kararlar almasını** amaçlar.

Uygulama, **Node.js (Express.js)** kullanılarak geliştirilmiş olup **MVC (Model–View–Controller)** mimarisine **katı biçimde** uygun olarak tasarlanmıştır.

---

## 🎯 Projenin Amacı
Bu projenin amacı;

- Sunucu taraflı yazılım geliştirme becerisi kazanmak  
- MVC mimarisini doğru ve tutarlı biçimde uygulamak  
- REST prensiplerine uygun API tasarlamak  
- Veri modeli, iş mantığı ve uç noktaları ayrıştırmak  
- Okunabilir, sürdürülebilir ve ölçeklenebilir bir yazılım geliştirmek  

---

## 🧱 Kullanılan Teknolojiler
- **Backend:** Node.js (Express.js)
- **Veritabanı:** MySQL
- **Frontend:** EJS (Embedded JavaScript Templates), CSS3
- **Mimari:** MVC (Model – View – Controller)

---

## 🧠 Sistem Senaryosu
Sisteme gelen her **acil vaka kaydı**, mahalle, istasyon, hastane ve ekip bilgileriyle birlikte değerlendirilir.  
Ulaşım süresi, ekip performansı ve hastane doluluk oranları analiz edilerek:

- Kritik vakalar tespit edilir  
- Harita üzerinde yoğunluk analizleri yapılır  
- Ekip ve hastane performansları raporlanır  
- Geçmiş veriler korunarak sağlıklı analizler üretilir  

---

## ⚙️ İş Kuralları (Business Rules)

### 1️⃣ Ulaşım Süresi Doğrulama Kuralı
- Bir vakanın **ulaşım süresi 0–300 dakika aralığı dışında** ise kayıt işlemi **reddedilir**.
- Amaç: Mantıksız ve hatalı veri girişlerini engellemek.

➡️ HTTP Yanıt: `400 Bad Request`

---

### 2️⃣ Kritik Veri Koruma Kuralı
- **“Kritik” statüsünde** olan ve **ulaşım süresi 60 dakikayı aşan** vaka kayıtları **sistemden silinemez**.
- Amaç: Geçmiş analizlerin güvenilirliğini korumak.

➡️ HTTP Yanıt: `409 Conflict`

---

## 🔁 CRUD İşlemleri
Sistem, **Kaza_Kayitlari (Vaka)** kaynağı üzerinde tam CRUD işlemlerini destekler:

| İşlem | Endpoint |
|-----|--------|
| Create | POST `/api/vaka` |
| Read (Liste) | GET `/api/vaka` |
| Read (Detay) | GET `/api/vaka/:id` |
| Update | PUT `/api/vaka/:id` |
| Delete | DELETE `/api/vaka/:id` |

---

## 🌐 API Endpoint Listesi (RESTful)

### 📊 Analiz & Dashboard
- **GET** `/api/ekip-performans` – Ekip performans verileri
- **GET** `/api/hastane-doluluk` – Hastane doluluk oranları
- **GET** `/api/graphs` – Grafiksel analiz verileri
- **GET** `/api/simulation` – Simülasyon ve karar destek çıktıları
- **GET** `/api/map-data` – Harita yoğunluk verileri
- **GET** `/api/records` – Son vaka kayıtları

### 🚑 Vaka Yönetimi (CRUD)
- **POST** `/api/vaka` – Yeni vaka oluşturur (İş Kuralı 1 uygulanır)
- **GET** `/api/vaka` – Tüm vakaları listeler
- **GET** `/api/vaka/:id` – Tekil vaka detayı
- **PUT** `/api/vaka/:id` – Vaka günceller
- **DELETE** `/api/vaka/:id` – Vaka siler (İş Kuralı 2 uygulanır)

---

##  Proje Klasör Yapısı
project-root/
│
├── config/
│ └── db.js
│
├── controllers/
│ └── kdsController.js
│
├── models/
│ └── (Veri modelleri)
│
├── routes/
│ └── kdsRoutes.js
│
├── views/
│ └── (EJS dosyaları)
│
├── public/
│ ├── css/
│ ├── js/
│ └── er_diagram2.png
│
├── .env.example
├── server.js
├── package.json
└── README.md

---


## ER Diyagramı
![ER Diyagramı](./public/er_diagram2.jpg)

###  Kurulum
1. Projeyi bilgisayarınıza indirin.
2. Terminalde `npm install` komutu ile gerekli paketleri yükleyin.
3. `config/db.js` dosyasındaki veritabanı bilgilerini kendi yerel ayarlarınıza göre güncelleyin.
4. `node server.js` komutu ile uygulamayı başlatın.

##  Ortam Değişkenleri (.env)
Proje, ortam değişkenleri ile yapılandırılmıştır.

### `.env.example`
```env
PORT=8081

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=kds_112
DB_PORT=8889


