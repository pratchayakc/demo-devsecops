const http = require("http");

const server = http.createServer((req, res) => {
  const date = new Date();
  const timestamp = `${date.toISOString()}`;  // ใช้ format ISO 8601

  res.writeHead(200, { "Content-Type": "text/plain" });

  if (req.url.startsWith("/page1")) {
    const message = "hello from page 1";
    console.log(`[${timestamp}] INFO: ${message}`);
    res.end(message + "\n");
  } else if (req.url.startsWith("/page2")) {
    const message = "hello from page 2";
    console.log(`[${timestamp}] INFO: ${message}`);
    res.end(message + "\n");
  } else {
    const message = "hello from root";
    console.log(`[${timestamp}] INFO: ${message}`);
    res.end(message + "\n");
  }
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
