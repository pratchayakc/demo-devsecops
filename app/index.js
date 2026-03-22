const { Client } = require('pg');

// เชื่อมต่อกับ PostgreSQL Database
const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME
} = process.env;

const client = new Client({
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT),
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME
});

// เชื่อมต่อกับฐานข้อมูล
client.connect().then(async () => {
  console.log("Connected to PostgreSQL database.");

  // ตรวจสอบว่า table users มีอยู่หรือไม่
  const tableCheckQuery = `SELECT to_regclass('public.users') AS table_exists;`;
  const result = await client.query(tableCheckQuery);

  if (!result.rows[0].table_exists) {
    // หากไม่มี table users ให้สร้างตารางใหม่
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL
      );
    `;
    await client.query(createTableQuery);
    console.log("Table 'users' created successfully.");

    // เพิ่มข้อมูลตัวอย่างลงในตาราง
    const sampleData = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ];

    for (let user of sampleData) {
      const insertQuery = 'INSERT INTO users (name, age) VALUES ($1, $2)';
      await client.query(insertQuery, [user.name, user.age]);
    }
    console.log("Sample data added to 'users' table.");
  } else {
    console.log("Table 'users' already exists.");
  }
}).catch(err => {
  console.error("Error connecting to the database", err);
});

// สร้างเซิร์ฟเวอร์
const http = require("http");

const server = http.createServer(async (req, res) => {
  const date = new Date();
  const timestamp = `${date.toISOString()}`;

  res.writeHead(200, { "Content-Type": "text/html" });

  if (req.url === '/') {
    // หน้าแสดงรายการข้อมูลจากฐานข้อมูล
    const message = await getAllRecordsFromDB(); // ดึงข้อมูลจากฐานข้อมูล
    const htmlContent = `
      <html>
        <head>
          <title>User Information</title>
        </head>
        <body>
          <h1>User Information</h1>
          <h2>Users List</h2>
          <table border="1">
            <tr>
              <th>Name</th>
              <th>Age</th>
            </tr>
            ${message}
          </table>
        </body>
      </html>
    `;
    res.end(htmlContent);
  }
});

// ฟังก์ชันดึงข้อมูลทั้งหมดจากฐานข้อมูล
async function getAllRecordsFromDB() {
  const res = await client.query('SELECT * FROM users');
  let html = '';
  res.rows.forEach(row => {
    html += `<tr><td>${row.name}</td><td>${row.age}</td></tr>`;
  });
  return html;
}

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});