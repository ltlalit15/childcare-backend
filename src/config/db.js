
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
  host: 'caboose.proxy.rlwy.net',           // ✅ Match CLI hostname
  user: 'root',                              // ✅ Same as CLI user
  password: 'hTbWPTjbfuQgKmyFUVrRlmLFCDIDxKGr', // ✅ Password from CLI
  database: 'railway',                       // ✅ Same database
  port: 12799,                               // ✅ Port from CLI
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
