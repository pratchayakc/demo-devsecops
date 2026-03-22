const { Client } = require('pg');

// เชื่อมต่อกับ PostgreSQL Database
const client = new Client({
  host: 'postgres-db',  // ชื่อของ service ที่ใช้เชื่อมต่อ
  port: 5432,
  user: 'user',
  password: 'password',
  database: 'mydb'
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
    // หน้าเพิ่มข้อมูลและแสดงรายการข้อมูล
    const message = await getAllRecordsFromDB(); // ดึงข้อมูลทุกครั้งที่หน้า / ถูกโหลด
    const htmlContent = `
      <html>
        <head>
          <title>User Information</title>
        </head>
        <body>
          <h1>User Information</h1>
          <h2>Add User Information</h2>
          <form action="/" method="POST">
            <label for="name">Name: </label>
            <input type="text" id="name" name="name" required><br><br>
            <label for="age">Age: </label>
            <input type="number" id="age" name="age" required><br><br>
            <button type="submit">Add User</button>
          </form>

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
  } else if (req.url === '/' && req.method === 'POST') {
    // การเพิ่มข้อมูลเมื่อส่งฟอร์ม
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const params = new URLSearchParams(body);
      const name = params.get('name');
      const age = params.get('age');
      await addRecordToDB(name, age); // เพิ่มข้อมูลลงในฐานข้อมูล
      const message = await getAllRecordsFromDB(); // ดึงข้อมูลใหม่จากฐานข้อมูลหลังจากเพิ่ม
      const htmlContent = `
        <html>
          <head>
            <title>User Information</title>
          </head>
          <body>
            <h1>User Information</h1>
            <h2>Add User Information</h2>
            <form action="/" method="POST">
              <label for="name">Name: </label>
              <input type="text" id="name" name="name" required><br><br>
              <label for="age">Age: </label>
              <input type="number" id="age" name="age" required><br><br>
              <button type="submit">Add User</button>
            </form>

            <h2>Users List</h2>
            <table border="1">
              <tr>
                <th>Name</th>
                <th>Age</th>
              </tr>
              ${message} <!-- แสดงรายการข้อมูลใหม่ -->
            </table>
          </body>
        </html>
      `;
      res.end(htmlContent); // ส่งข้อมูลกลับมาให้แสดงผลทันที
    });
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

// ฟังก์ชันเพิ่มข้อมูลผู้ใช้
async function addRecordToDB(name, age) {
  const query = 'INSERT INTO users (name, age) VALUES ($1, $2)';
  await client.query(query, [name, age]);
}

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});