// config/db.js
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // MAMP kullanıyorsan 'root', XAMPP ise boş '' olabilir
    database: 'kds_projesi',
    port: 8889
});

connection.connect((err) => {
    if (err) {
        console.error('Veri tabanı bağlantı hatası: ', err);
        return;
    }
    console.log('MySQL Veri Tabanına Başarıyla Bağlanıldı!');
});

export default connection;