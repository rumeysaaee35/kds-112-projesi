import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('Veri tabanı bağlantı hatası: ', err);
        return;
    }
    console.log('MySQL Veri Tabanına Başarıyla Bağlanıldı!');
});

export default connection;
