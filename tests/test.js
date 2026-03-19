// tests/test.js
const request = require('supertest');
const app = require('../app/index.js');  // ใช้ path ให้ตรงกับตำแหน่งของ index.js

describe('HTTP Server Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(3000);
  });

  afterAll(() => {
    server.close();
  });

  it('should respond with "hello from page 1" on /page1', async () => {
    const response = await request(server).get('/page1');
    expect(response.status).toBe(200);
    expect(response.text).toBe('hello from page 1\n');
  });

  it('should respond with "hello from page 2" on /page2', async () => {
    const response = await request(server).get('/page2');
    expect(response.status).toBe(200);
    expect(response.text).toBe('hello from page 2\n');
  });

  it('should respond with "hello from root" on root', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('hello from root\n');
  });
});