# KDS 112 Karar Destek Sistemi Projesi

Bu proje, bir Karar Destek Sistemi (KDS) prototipi olarak Node.js ortamında MVC (Model-View-Controller) mimarisi kullanılarak geliştirilmiştir. Proje, coğrafi verilerin analizi ve kullanıcı yönetimi gibi temel fonksiyonları içermektedir.

##  Kullanılan Teknolojiler
* **Backend:** Node.js, Express.js
* **Veritabanı:** MySQL
* **Frontend:** EJS (Embedded JavaScript Templates), CSS3
* **Mimari:** MVC (Model-View-Controller)

##  Dosya Yapısı
* `controllers/`: İş mantığının ve veri işleme süreçlerinin yönetildiği katman.
* `routes/`: Uygulama yönlendirmelerinin (URL yapılandırması) bulunduğu katman.
* `views/`: Kullanıcı arayüzü (Dashboard, Grafik ekranları vb.) şablonları.
* `public/`: CSS, resimler ve istemci tarafı JavaScript dosyaları.
* `config/`: Veritabanı bağlantı ayarları.

##  Kurulum
1. Projeyi bilgisayarınıza indirin.
2. Terminalde `npm install` komutu ile gerekli paketleri yükleyin.
3. `config/db.js` dosyasındaki veritabanı bilgilerini kendi yerel ayarlarınıza göre güncelleyin.
4. `node server.js` komutu ile uygulamayı başlatın.