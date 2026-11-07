require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORTA || 3306),
  user: process.env.DB_USUARIO || 'root',
  password: process.env.DB_SENHA || '',
  database: process.env.DB_NOME || 'loja_tech',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
