# 📄 Ứng Dụng Quét Văn Bản từ PDF & Ảnh

Một ứng dụng web hiện đại hỗ trợ trích xuất, đọc nội dung và nhận diện ký tự quang học (OCR) trực tiếp từ tài liệu PDF (bao gồm cả văn bản kỹ thuật số lẫn bản scan) và các định dạng tệp ảnh. Ứng dụng hoạt động **hoàn toàn ở phía Frontend (Client-side)** sử dụng **HTML5, CSS3 (Vanilla CSS với biến màu và Responsive Design)** và **JavaScript (ES6+)**. 

---

## 🌟 Tính Năng Nổi Bật

### 1. Tải Lên và Xử Lý Đa Định Dạng (File & Image Upload)
* **Hỗ trợ linh hoạt:** Tải lên nhanh chóng các tệp định dạng ảnh phổ biến (`image/*` như JPG, PNG) hoặc tài liệu tài liệu `PDF`.
* **Phản hồi trực quan:** Hiển thị tên tệp đã chọn cùng thanh trạng thái tiến trình xử lý chi tiết (kèm biểu tượng xoay tải và phần trăm tiến độ OCR theo thời gian thực).

### 2. Đọc Tài Liệu PDF Thông Minh (PDF.js Integration)
* **Bóc tách văn bản trực tiếp:** Sử dụng thư viện Mozilla PDF.js để đọc nhanh lớp chữ sẵn có trong các tệp PDF tiêu chuẩn mà không cần chuyển đổi hình ảnh.
* **Xử lý trang Scan tự động:** Cơ chế kiểm tra mật độ ký tự trên từng trang (`MIN_PDF_TEXT`). Nếu trang nào là bản scan (ít hoặc không có lớp chữ), hệ thống sẽ tự động render trang đó thành ảnh `Canvas` với độ phân giải cao (`PDF_RENDER_SCALE = 2`) để chuyển tiếp sang bước OCR.

### 3. Nhận Diện Ký Tự Quang Học (Tesseract.js OCR)
* **Hỗ trợ song ngữ (`vie+eng`):** Tích hợp Tesseract.js (v5) để nhận diện chính xác các ký tự chữ viết bằng cả tiếng Việt và tiếng Anh.
* **Quản lý tài nguyên tối ưu:** Tự động khởi tạo Tesseract Worker khi có nhu cầu sử dụng và tự động hủy (`terminate`) ngay sau khi hoàn thành để giải phóng triệt để bộ nhớ của trình duyệt.

### 4. Tiện Ích Văn Bản & Thao Tác Nhanh
* **Đếm ký tự thời gian thực:** Tự động cập nhật số lượng ký tự có trong vùng kết quả theo chuẩn định dạng số địa phương (`vi-VN`).
* **Sao chép một chạm:** Sao chép toàn bộ văn bản quét được vào bộ nhớ tạm thông qua Clipboard API (có cơ chế dự phòng an toàn cho trình duyệt cũ) kèm thông báo **Toast** trực quan.
* **Xóa sạch dữ liệu:** Làm trống vùng kết quả, reset trạng thái tệp tải lên và đưa ứng dụng về trạng thái ban đầu chỉ với một cú nhấp chuột.

---

## 📂 Cấu Trúc Mã Nguồn Dự Án

Dự án được thiết kế theo mô hình chuẩn Front-end gọn nhẹ, phân tách rõ ràng thành 3 tệp mã nguồn chính:

```text
pdf-ocr-scanner/
│
├── index.html       # Khung cấu trúc HTML5, tích hợp các thư viện bên thứ ba (FontAwesome, PDF.js, Tesseract.js)
├── style.css        # Tệp định dạng CSS hiện đại, tối ưu responsive cho mobile/desktop, quản lý biến CSS (:root)
└── script.js        # Logic điều khiển ứng dụng (xử lý sự kiện, render PDF Canvas, điều phối Tesseract OCR Worker)
```

---

## ⚙️ Công Nghệ & Thư Viện Sử Dụng

* **HTML5 & CSS3:** Xây dựng bố cục ngữ nghĩa, tối ưu responsive bằng Flexbox và quản lý giao diện thông qua biến CSS tùy chỉnh (`:root`).
* **JavaScript (ES6+):** Sử dụng lập trình bất đồng bộ (`async/await`), thao tác DOM và xử lý luồng dữ liệu nhị phân (`ArrayBuffer`).
* **PDF.js (v3.11.174):** Thư viện mã nguồn mở của Mozilla chuyên dùng để phân tích, đọc và render cấu trúc tệp PDF trực tiếp trên trình duyệt.
* **Tesseract.js (v5):** Động cơ nhận diện ký tự quang học (OCR) chạy trên nền tảng JavaScript/WebAssembly.
* **FontAwesome (v6.4.0):** Thư viện biểu tượng trực quan phục vụ giao diện người dùng.

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

Vì đây là ứng dụng chạy hoàn toàn ở phía Frontend, bạn **không cần cài đặt Node.js hay bất kỳ máy chủ phức tạp nào**.

1. **Tải mã nguồn:** Tải toàn bộ 3 tệp (`index.html`, `style.css`, `script.js`) và đặt chung vào một thư mục trên máy tính của bạn.
2. **Mở ứng dụng:** 
   * Nhấp đúp chuột trực tiếp vào tệp `index.html` để mở bằng trình duyệt web hiện đại (Google Chrome, Microsoft Edge, Firefox,...).
   * *Khuyến nghị:* Nên sử dụng extension **Live Server** trên Visual Studio Code để chạy cục bộ nhằm tránh các giới hạn bảo mật CORS của trình duyệt khi nạp worker script từ các nguồn CDN bên ngoài.
3. **Sử dụng:** 
   * Nhấp vào nút **"Tải lên Ảnh / PDF"** để chọn tệp tài liệu cần quét.
   * Chờ hệ thống tiến hành xử lý (lần đầu tiên sử dụng có thể mất vài giây để tải mô hình ngôn ngữ OCR) và nhận kết quả văn bản trích xuất hiển thị trực tiếp trên màn hình.