# ใช้ official node:20-alpine ที่เบาและปลอดภัย
FROM node:20-alpine

# สร้าง user และ group ที่ไม่ใช่ root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -u 1001

# ตั้ง working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies โดยไม่ติดตั้ง dev dependencies
RUN npm install --omit=dev

# คัดลอกโค้ดแอปพลิเคชันจากเครื่อง host ไปยัง container
COPY app ./app

# เปลี่ยนเจ้าของไฟล์ทั้งหมดใน /app เป็น appuser
RUN chown -R appuser:appgroup /app

# เปลี่ยนเป็น user ที่ไม่ใช่ root
USER appuser

# ลดขนาด Docker image โดยไม่เก็บข้อมูลชั่วคราวที่ไม่จำเป็น
RUN rm -rf /var/cache/apk/*

# เปิด port 3000 สำหรับแอปพลิเคชัน
EXPOSE 3000

# ใช้คำสั่งเพื่อเริ่มแอปพลิเคชัน
CMD ["npm", "start"]
