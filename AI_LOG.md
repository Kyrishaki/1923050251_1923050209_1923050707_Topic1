# 🤖 NHẬT KÝ SỬ DỤNG TRỢ LÝ AI (AI_LOG.md)

> **Học phần**: Lập trình Mobile (Mobile App Development) — Mã lớp: TH7011101 (23DTH1)  
> **Đề tài**: Topic 01 — Study Planner (Kế hoạch Học tập Sinh viên)  
> **Nhóm thực hiện**:
> - Lại Văn Thành — MSSV: `1923050251`
> - Mai Hoàng Tuấn — MSSV: `1923050209`
> - Nguyễn Hoàng Long — MSSV: `1923050707`

---

## 📌 1. Tuyên bố Liêm chính Học thuật (Academic Integrity Statement)

Nhóm chúng em khẳng định đã tuân thủ nghiêm ngặt quy định về liêm chính học thuật của Khoa Công nghệ Thông tin - Trường Đại học Công nghệ Đồng Nai:
- Công cụ AI (Google Gemini, Claude, GitHub Copilot) được sử dụng đúng mục đích: như một trợ lý lập trình viên chuyên nghiệp để gợi ý kiến trúc, rà soát lỗi TypeScript và gợi ý cú pháp test.
- Toàn bộ các quyết định thiết kế kiến trúc, lựa chọn thư viện, tư duy xử lý bài toán múi giờ và kiểm thử đều do các thành viên trong nhóm trực tiếp phản biện, kiểm chứng, sửa lỗi và làm chủ 100%.
- Cả 3 thành viên trong nhóm đều hiểu sâu toàn bộ mã nguồn của dự án và sẵn sàng trả lời trực tiếp bất kỳ câu hỏi vấn đáp (viva) nào từ giảng viên.

---

## 📋 2. Bảng Nhật ký Chi tiết Quá trình Tương tác với AI

| Phiên làm việc & Ngày | Thành viên thực hiện | Nội dung yêu cầu AI (Prompt / Question) | Những gì nhóm CHẤP NHẬN (Accepted) | Những gì nhóm TỪ CHỐI / CHỈNH SỬA (Rejected & Why) |
| :--- | :--- | :--- | :--- | :--- |
| **Phiên 1**<br>16/10/2026 | **Lại Văn Thành** | "Gợi ý cấu trúc Data Model cho app Study Planner đáp ứng yêu cầu của đề bài Topic 01" | Nhận bộ khung interfaces trong `src/types/index.ts`: gồm `Course` (id, code, name, colour), `Assignment` (id, courseId, title, dueAt, status, photoUri) và `User`. | **Từ chối**: AI ban đầu định thêm trường `completionRate: number` vào model `Course` và lưu vào database. Nhóm từ chối ngay vì đề bài quy định rõ: *"Progress statistics: completed versus outstanding per course, computed, never stored"*. Nhóm chuyển toàn bộ việc tính toán này thành hàm thuần túy trong `src/utils/statsUtils.ts`. |
| **Phiên 2**<br>18/10/2026 | **Mai Hoàng Tuấn** | "Viết hàm tính khoảng cách ngày để hiển thị nhãn hạn chót 'Due tomorrow' cho bài tập" | Sử dụng hàm tạo mốc thời gian và định dạng chuỗi tiếng Việt thân thiện ("Ngày mai lúc 23:59", "Còn 2 ngày nữa"). | **Từ chối & Viết lại hoàn toàn**: AI viết hàm trừ mili-giây đơn giản `(target - now) / 86400000`. Khi nhóm test lúc 23:30 đêm đối với bài tập hạn 08:00 sáng mai thì hàm này ra kết quả < 24 giờ và hiển thị nhầm thành "Hôm nay"! Nhóm đã tự viết hàm `getCalendarDayDiff()` dựa trên `setHours(0,0,0,0)` của ngày cục bộ để đảm bảo 23:30 hay 08:00 đều cho đúng kết quả `+1 ngày`. |
| **Phiên 3**<br>20/10/2026 | **Mai Hoàng Tuấn** | "Thiết kế file token màu sắc duy nhất cho Light và Dark theme đảm bảo WCAG AA" | Chấp nhận cấu trúc `src/constants/theme.ts` với đầy đủ các màu ngữ nghĩa, màu môn học (emerald, blue, amber...) và hook `useAppTheme()`. | **Chỉnh sửa**: AI ban đầu dùng màu chữ `#94A3B8` trên nền trắng `#FFFFFF`, khi nhóm đo độ tương phản thì chỉ đạt 2.8:1 (trượt chuẩn WCAG AA). Nhóm đã thay bằng `#334155` (đạt 9.5:1) và `#64748B` (đạt 4.6:1) để đảm bảo độ sắc nét trên màn hình điện thoại ngoài trời. |
| **Phiên 4**<br>22/10/2026 | **Lại Văn Thành** | "Làm thế nào để triển khai Optimistic Update khi người dùng bấm hoàn thành bài tập bằng TanStack Query?" | Chấp nhận chu trình 3 bước chuẩn trong `onMutate`, `onError` và `onSettled`: hủy query dở dang, lưu snapshot `previous`, đè cache tạm thời và rollback nếu có lỗi. | **Chỉnh sửa**: AI quên không xử lý trường hợp người dùng đang ở chế độ Offline. Nhóm đã bổ sung `OfflineQueue` trong `AsyncStorage` để khi mất mạng thì thao tác đổi trạng thái vẫn được lưu cục bộ an toàn thay vì văng Exception. |
| **Phiên 5**<br>24/10/2026 | **Nguyễn Hoàng Long** | "Viết mã xin quyền chụp ảnh từ camera và thư viện ảnh bằng expo-image-picker" | Sử dụng `launchCameraAsync` và `launchImageLibraryAsync` với chất lượng nén `quality: 0.7`. | **Chỉnh sửa**: AI viết mã nếu người dùng từ chối cấp quyền thì quăng lỗi `throw new Error()`. Nhóm đã sửa thành cơ chế từ chối êm đẹp (Graceful refusal): trả về thông báo giải thích và cho phép sinh viên tiếp tục tạo bài tập bằng văn bản bình thường. |
| **Phiên 6**<br>26/10/2026 | **Cả nhóm** | "Gợi ý các ca kiểm thử tự động (Unit Test) cho Jest để bao phủ toàn bộ các yêu cầu khắt khe" | Chấp nhận cấu trúc kiểm thử tách biệt: logic ngày tháng, logic tính toán tiến độ và kiểm thử luồng quan trọng (session & rollback). | **Chỉnh sửa**: AI đề xuất viết test dính chặt vào native module làm Jest chạy trên môi trường Node bị crash. Nhóm đã tự thiết lập các Jest mock siêu nhẹ cho `expo-secure-store`, `@react-native-async-storage` và `react-native`, giúp bộ 18 test chạy siêu tốc chỉ trong 6 giây. |

---

## 💡 3. Các Bài học Kinh nghiệm Rút ra khi làm việc cùng AI

1. **AI giỏi sinh mã mẫu nhanh, nhưng rất hay quên các ràng buộc âm thầm (Subtle Constraints)**:
   - AI luôn có xu hướng lưu mọi thứ vào database hoặc state. Nếu không tỉnh táo đối chiếu với đề bài ("never stored"), sinh viên sẽ rất dễ bị trừ điểm oan ở phần kiến trúc.
2. **Cần kiểm tra kỹ lưỡng các vấn đề về múi giờ và thời gian thực tế**:
   - Các đoạn code AI viết về ngày tháng thường dùng thư viện ngoài nặng nề hoặc các phép tính toán mili-giây ngây thơ, không tính đến trường hợp sinh viên học khuya lúc 23:30.
3. **Hiểu bản chất là chìa khóa để bảo vệ đồ án (Viva)**:
   - Mọi dòng code do AI gợi ý đều được cả 3 thành viên đọc hiểu từng dòng, đổi tên biến chuẩn nghĩa tiếng Việt và tự tay debug. Điều này giúp nhóm hoàn toàn tự tin khi giảng viên chỉ định bất kỳ đoạn code nào để chất vấn.
