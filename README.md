# 🎓 Study Planner (Topic 01) — Kế hoạch Học tập Thông minh

> **Đồ án Cuối kỳ môn Lập trình Mobile (Mobile App Development)**  
> **Mã học phần**: TH7011101 (Lớp 23DTH1) — Trọng số: 50% điểm học phần  
> **Trường Đại học Công nghệ Đồng Nai (DNTU) — Khoa Công nghệ Thông tin**  
> **Giảng viên hướng dẫn**: ThS. Nguyễn Xuân Vinh  

---

## 👥 1. Danh sách Nhóm sinh viên thực hiện

| STT | Họ và tên | Mã số sinh viên (MSSV) | Email sinh viên | Vai trò & Đóng góp |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Lại Văn Thành** | `1923050251` | `1923050251@dntu.edu.vn` | Trưởng nhóm, Thiết kế Data Model, Kiến trúc Zustand Store & Mock API Server |
| **2** | **Mai Hoàng Tuấn** | `1923050209` | `1923050209@dntu.edu.vn` | Thành viên, Routing Expo Router, Token Theme duy nhất, Xử lý Timezone & 4 Trạng thái UI |
| **3** | **Nguyễn Hoàng Long** | `1923050707` | `1923050707@dntu.edu.vn` | Thành viên, Đính kèm ảnh ghi chú/bảng viết, Unit Test tự động & Viết tài liệu |

- **Repository GitHub**: [`https://github.com/LaiVanThanh/1923050251_1923050209_1923050707_Topic1`](https://github.com/LaiVanThanh/1923050251_1923050209_1923050707_Topic1)
- **Tên file nộp Canvas**: `1923050251_1923050209_1923050707_Project.zip`

---

## 📱 2. Giới thiệu Sản phẩm (Product Overview)

**Study Planner** là ứng dụng di động tối ưu dành riêng cho sinh viên đại học đang phải quản lý cùng lúc 5–7 học phần, thường xuyên di chuyển giữa các giảng đường và kiểm tra bài tập trên điện thoại.

### Các tính năng cốt lõi (Must-have — Đạt điểm tối đa):
1. **Đăng nhập & Phiên làm việc bền vững**:
   - Xác thực an toàn bằng `expo-secure-store` (mã hóa cấp phần cứng iOS Keychain / Android Keystore).
   - Phiên đăng nhập sống sót qua các lần tắt/mở lại app.
   - Khi bấm "Đăng xuất", app dọn sạch 100% token trong SecureStore, state trong RAM, cache TanStack Query và bộ nhớ đệm AsyncStorage, chuyển thẳng về màn hình `/sign-in`.
2. **Dữ liệu Môn học & Bài tập tải từ Remote API**:
   - Tải danh sách môn học và bài tập từ Remote API có độ trễ thực tế.
   - Thêm mới, chỉnh sửa, xóa bài tập trực tiếp trên app.
3. **Hai khung nhìn dữ liệu linh hoạt (Lịch tuần & Danh sách)**:
   - **Lịch tuần (Weekly view)**: Chọn từng thứ trong tuần (Thứ 2 đến Chủ Nhật) để xem bài tập đến hạn ngày đó.
   - **Danh sách (List view)**: Tìm kiếm tức thì theo từ khóa, lọc theo môn học (Course) và lọc theo trạng thái (Chưa làm / Đang làm / Đã hoàn thành).
4. **Nhắc nhở Deadline & Deep Link**:
   - Hẹn giờ thông báo cục bộ (Local Notification) trước hạn chót.
   - Chạm vào thông báo sẽ mở thẳng vào màn hình chi tiết bài tập dynamic route `app/(app)/assignments/[id].tsx`.
5. **Tiến độ học tập được tính toán động (Computed, Never Stored)**:
   - Tỷ lệ hoàn thành (Completed vs Outstanding) của từng môn học được tính trực tiếp từ mảng assignments tại thời điểm render, tuyệt đối không lưu cứng trong database.
6. **Hoạt động Offline an toàn (Offline-tolerant)**:
   - Hiển thị thanh thông báo nổi bật (Offline Banner) kèm mốc thời gian của lần tải thành công gần nhất.
   - Các thao tác tạo/sửa/xóa khi mất mạng được lưu vào hàng đợi `OfflineQueue` trong `AsyncStorage`, tự động đồng bộ khi có mạng lại, không bao giờ bị mất dữ liệu âm thầm.

### Các tính năng nâng cao (Should-have — Điểm trên 8):
1. **Đính kèm ảnh chụp bảng viết / Sổ tay**:
   - Cho phép chụp hình từ Camera hoặc chọn từ thư viện ảnh (`expo-image-picker`) với cơ chế từ chối quyền văn minh (Graceful refusal).
2. **Widget tóm tắt 48 giờ tới trên Trang chủ**:
   - Đếm số bài tập cần nộp gấp trong vòng 48 giờ và hiển thị dạng danh thiếp ưu tiên.
3. **Cập nhật lạc quan (Optimistic Updates)**:
   - Khi tích chọn hoàn thành bài tập, giao diện đổi trạng thái ngay lập tức trước khi server phản hồi. Nếu server báo lỗi, app tự động Rollback về trạng thái cũ kèm thông báo cho người dùng.

### Giải quyết bài toán hóc búa ("The part that will take longer than you think"):
- **Xử lý Múi giờ & Ngày tháng (Timezone & Date handling)**:
  - Hàm `getCalendarDayDiff()` trong `src/utils/dateUtils.ts` chuẩn hóa mốc thời gian về nửa đêm cục bộ (00:00:00.000) của ngày hôm đó.
  - Nhờ vậy, bài tập hạn chót ngày mai dù kiểm tra lúc **08:00 sáng** hay lúc **23:30 đêm** thì nhãn hiển thị vẫn nhất quán là **"Ngày mai lúc HH:mm"**, không bao giờ bị lệch ngày do làm tròn mili-giây thô sơ.

---

## 🛠️ 3. Yêu cầu Kỹ thuật & Checklist thẩm định

- [x] **Expo SDK 57**, React 19, React Native 0.86, TypeScript Strict Mode (`tsc --noEmit` đạt 0 lỗi).
- [x] **Function Components & Hooks 100%** (Không sử dụng Class Component).
- [x] **Expo Router**: Tối thiểu 5 màn hình riêng biệt gồm 1 dynamic route `[id]`, 2 modal routes và `+not-found.tsx`:
  1. `app/(auth)/sign-in.tsx`: Màn hình Đăng nhập (có nút đăng nhập nhanh cho 3 thành viên).
  2. `app/(app)/(tabs)/index.tsx`: Dashboard tổng quan, Widget 48h, Thống kê tiến độ các môn.
  3. `app/(app)/(tabs)/weekly.tsx`: Khung nhìn lịch tuần 7 ngày.
  4. `app/(app)/(tabs)/assignments.tsx`: Danh sách bài tập, tìm kiếm & bộ lọc đa tiêu chí.
  5. `app/(app)/(tabs)/courses.tsx`: Quản lý môn học và thanh tiến độ hoàn thành.
  6. `app/(app)/assignments/[id].tsx`: **Dynamic route** xem chi tiết, xem ảnh, thử gửi notification, xóa bài tập.
  7. `app/(app)/courses/[id].tsx`: Chi tiết tiến độ riêng của từng môn học.
  8. `app/(app)/modal/new-assignment.tsx`: **Modal route** thêm bài tập mới + đính kèm ảnh.
  9. `app/(app)/modal/new-course.tsx`: **Modal route** tạo môn học mới + chọn bảng màu.
  10. `app/+not-found.tsx`: Màn hình xử lý lỗi 404 chuẩn UX.
- [x] **Xử lý trọn vẹn 4 trạng thái trên mọi màn hình**: Loading (xoay spinner), Empty (thông điệp trống + nút hành động), Error (báo lỗi + nút **Thử lại ngay** hoạt động thật) và Content.
- [x] **Hệ thống Token Màu sắc duy nhất (`src/constants/theme.ts`)**: Tuyệt đối không có bất kỳ mã màu Hex nào nằm rải rác ngoài file theme. Hỗ trợ đầy đủ Light Mode và Dark Mode đạt độ tương phản chuẩn WCAG AA ($\ge 4.5:1$).
- [x] **Khả năng tiếp cận (Accessibility)**: Mọi nút bấm và tương tác đều có `accessibilityRole`, `accessibilityLabel` và vùng chạm tối thiểu $\ge 44 \times 44$.
- [x] **Phân tách State chuyên nghiệp**:
  - Session & bảo mật: **Expo SecureStore**.
  - Client state & Filter: **Zustand** kết hợp Selector nguyên tử.
  - Server state & Caching: **TanStack Query** (`@tanstack/react-query`).
- [x] **Kiểm thử tự động (Automated Unit Tests)**: Đạt 18/18 test trong 3 test suites:
  - Suite 1: Pure-logic test xử lý ngày tháng & múi giờ 23:30 vs 08:00.
  - Suite 2: Pure-logic test tính toán tiến độ hoàn thành động.
  - Suite 3: Critical path test chu trình session SecureStore, Optimistic update rollback và Offline queue.

---

## 🚀 4. Hướng dẫn Chạy ứng dụng từ Máy tính mới (Clean Machine)

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node 20 hoặc Node 22/24).
- **npm** hoặc **yarn**.
- Thiết bị điện thoại cài sẵn app **Expo Go** (Android / iOS) hoặc trình duyệt Web.

### Các bước cài đặt và khởi chạy:

```bash
# Bước 1: Di chuyển vào thư mục dự án
cd 1923050251_1923050209_1923050707_Topic1

# Bước 2: Cài đặt các thư viện phụ thuộc (nếu chưa có node_modules)
npm install

# Bước 3: Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript (Strict mode)
npm run typecheck

# Bước 4: Chạy toàn bộ 18 bài kiểm thử tự động Jest
npm test

# Bước 5: Khởi động Expo Development Server
npm start
```

### Tài khoản sinh viên để đăng nhập thử nghiệm:
Trên màn hình Đăng nhập `app/(auth)/sign-in.tsx`, nhóm đã tạo sẵn **3 nút chọn nhanh** cho các thành viên:
1. **Mai Hoàng Tuấn**: `tuan.mai@student.dntu.edu.vn` (MSSV: `1923050209`)
2. **Lại Văn Thành**: `thanh.lai@student.dntu.edu.vn` (MSSV: `1923050251`)
3. **Nguyễn Hoàng Long**: `long.nguyen@student.dntu.edu.vn` (MSSV: `1923050707`)
- Mật khẩu mặc định: `password123`

---

## 🧪 5. Kịch bản Trình diễn & Chấm điểm nhanh (Demo Script)

1. **Thử nghiệm Đăng nhập & Thoát app**:
   - Đăng nhập tài khoản Mai Hoàng Tuấn. Tắt app / Reload trình duyệt $\rightarrow$ Ứng dụng tự động đọc token từ SecureStore và vào thẳng Dashboard mà không bắt đăng nhập lại.
   - Bấm icon Đăng xuất ở góc trên bên phải header $\rightarrow$ Xác nhận đăng xuất $\rightarrow$ SecureStore bị xóa sạch, điều hướng về màn hình đăng nhập.
2. **Thử nghiệm Widget 48 giờ & Tính toán Tiến độ**:
   - Tại tab "Tổng quan", xem Widget màu cam báo các bài tập đến hạn trong 48 giờ tới.
   - Xem thanh tiến độ của từng môn: Tỷ lệ hoàn thành được tính động `(completed / total) * 100`.
3. **Thử nghiệm Cập nhật lạc quan (Optimistic Update)**:
   - Vào tab "Bài tập", bấm vào ô vuông checkbox của bài tập bất kỳ $\rightarrow$ Checkbox đổi màu xanh lá và gạch ngang tiêu đề ngay lập tức.
   - Bấm icon sấm sét trên Header để **Giả lập lỗi Server 500**, sau đó bấm checkbox $\rightarrow$ Thao tác thất bại, hệ thống tự động Rollback về trạng thái ban đầu kèm thông báo lỗi.
4. **Thử nghiệm Chế độ Ngoại tuyến (Offline Mode)**:
   - Bấm icon đám mây trên Header để kích hoạt **Chế độ Ngoại tuyến** $\rightarrow$ Banner vàng xuất hiện báo "Hiển thị bản lưu gần nhất".
   - Bấm "Tạo bài tập" và lưu $\rightarrow$ Bài tập được đưa vào `OfflineQueue` trong `AsyncStorage`.
   - Bấm nút "Bật mạng" hoặc "Đồng bộ" trên Banner $\rightarrow$ Bài tập offline được gửi lên server và cập nhật vào danh sách.
5. **Thử nghiệm Đính kèm ảnh & Thông báo nhắc hạn**:
   - Mở chi tiết một bài tập $\rightarrow$ Bấm nút "🔔 Thử gửi thông báo nhắc hạn" $\rightarrow$ Popup cảnh báo hiện lên, bấm "Xem chi tiết" để kiểm tra deep link.
   - Bấm "Thêm ảnh" $\rightarrow$ Chọn ảnh từ thư viện hoặc chụp ảnh bài giảng/bảng viết $\rightarrow$ Ảnh hiển thị rõ nét trên màn hình chi tiết.