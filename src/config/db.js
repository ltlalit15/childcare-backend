
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// const pool = mysql.createPool({
//   host: 'yamabiko.proxy.rlwy.net',
//   user: 'root',
//   password: 'fgUqpTopJxyfUJpLehoKYVoTVImDmZso',
//   database: 'railway',
//   port: 19486,
//   waitForConnections: true,
//   connectionLimit: 10,
// });


const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'myapp_kids',
  multipleStatements: true
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected!");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to the database:", err.message);
  }
})();


export default pool;
