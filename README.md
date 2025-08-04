# 🕵️ Ứng Dụng Giấu Tin và Giải Mã Ảnh (Steganography)

Đây là một ứng dụng web đơn giản cho phép người dùng **giấu (nhúng)** thông điệp hoặc tệp dữ liệu vào một hình ảnh và sau đó **giải mã (trích xuất)** thông điệp đó từ hình ảnh. Ứng dụng sử dụng kỹ thuật **Giấu tin LSB (Least Significant Bit)** để nhúng dữ liệu vào bit thấp nhất của mỗi pixel trong ảnh, đảm bảo hình ảnh không thay đổi đáng kể về mặt thị giác.

---

## ⚙️ Công nghệ Sử dụng

- **Frontend:** ReactJS (Vite)
- **Backend:** Flask (Python)
- **Xử lý ảnh:** OpenCV & Pillow (PIL)
- **Giao tiếp:** REST API + Flask-CORS

---

## ✨ Tính năng chính

### 🔐 Giấu tin (Encode)

- Cho phép người dùng tải lên một hình ảnh (PNG, JPG).
- Chọn một tệp bất kỳ để nhúng vào ảnh (file văn bản, PDF, DOCX, v.v.).
- Ảnh đầu ra sẽ chứa dữ liệu được nhúng, có thể tải xuống.

### 🔎 Giải mã (Decode)

- Tải lên hình ảnh đã được giấu tin.
- Ứng dụng trích xuất dữ liệu từ ảnh và trả lại đúng tệp gốc.
- Hỗ trợ khôi phục tên file và định dạng ban đầu.

---

## 🚀 Hướng dẫn chạy ứng dụng

### 1. Clone repository

```bash
git clone https://github.com/phucthinh2704/LSB.git
cd LSB
```

---

### 2. ⚛️ Cách chạy frontend (ReactJS)

```bash
cd client
npm install
npm run dev
```

Frontend sẽ chạy tại: [http://localhost:5173](http://localhost:5173)

---

### 3. 🐍 Cách chạy backend (Flask)

```bash
cd ../server
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install flask flask-cors pillow opencv-python 
python app.py
```

Backend sẽ chạy tại: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🔒 Lưu ý kỹ thuật

- Chỉ hỗ trợ ảnh **PNG** để tránh mất dữ liệu do nén.
- Dung lượng file nhúng phải nhỏ hơn dung lượng ảnh có thể chứa.
- Backend sẽ xóa các file tạm sau khi xử lý để đảm bảo an toàn.
- Vị trí lưu file giải mã mặc định là ổ `D:\` (có thể sửa trong `app.py`).

---

### Tài liệu yêu cầu

- Node.js (>= 24)
- Python 3.8+


## 📄 License

MIT – Dự án mã nguồn mở phục vụ mục đích học tập và nghiên cứu.

---
