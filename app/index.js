const { Client } = require('pg');

// เชื่อมต่อกับ PostgreSQL Database
const client = new Client({
  host: 'postgres-db',  // ชื่อของ service ที่ใช้เชื่อมต่อ
  port: 5432,
  user: 'user',
  password: 'password',
  database: 'mydb'
});

client.connect();

// สร้างเซิร์ฟเวอร์
const http = require("http");

const server = http.createServer(async (req, res) => {
  const date = new Date();
  const timestamp = `${date.toISOString()}`;

  res.writeHead(200, { "Content-Type": "text/html" });

  if (req.url === '/') {
    const message = await getAllRecordsFromDB();
    const htmlContent = `
      <html>
        <head>
          <title>Users Information</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            table, th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>User Information</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${message}
            </tbody>
          </table>
          <h2>Add User Information</h2>
          <form action="/add" method="POST">
            <label for="name">Name: </label>
            <input type="text" id="name" name="name" required><br><br>
            <label for="age">Age: </label>
            <input type="number" id="age" name="age" required><br><br>
            <button type="submit">Add User</button>
          </form>
        </body>
      </html>
    `;
    res.end(htmlContent);
  } else if (req.url === '/add' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const params = new URLSearchParams(body);
      const name = params.get('name');
      const age = params.get('age');
      await addRecordToDB(name, age);
      res.writeHead(302, { 'Location': '/' });
      res.end();
    });
  }
});

// ฟังก์ชันดึงข้อมูลทั้งหมดจากฐานข้อมูล
async function getAllRecordsFromDB() {
  const res = await client.query('SELECT * FROM users');
  let html = '';
  res.rows.forEach(row => {
    html += `<tr><td>${row.name}</td><td>${row.age}</td><td><button onclick="deleteUser(${row.id})">Delete</button></td></tr>`;
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