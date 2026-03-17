const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  if (req.url.startsWith("/page1")) {
    res.end("hello from page 1\n");
  } else if (req.url.startsWith("/page2")) {
    res.end("hello from page 2\n");
  } else {
    res.end("hello from root\n");
  }
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});