# 📝 BÀI THU HOẠCH VÀ SUY NGẪM CÁ NHÂN (REFLECTION)

> **Học phần**: Lập trình Mobile (TH7011101 — 23DTH1)  
> **Đề tài**: Topic 01 — Study Planner  
> **Sinh viên đại diện phản ánh**: Mai Hoàng Tuấn (MSSV: 1923050209) cùng các thành viên nhóm (`1923050251`, `1923050707`)  

---

## 1. Nếu được làm lại dự án từ đầu, nhóm chúng em sẽ làm gì khác biệt? (What we would do differently)

Trải qua 2 tuần thực hiện đồ án cuối kỳ, từ việc phác thảo Data Model cho đến khi hoàn thiện sản phẩm hoàn chỉnh, nhóm chúng em đã rút ra được nhiều bài học thực chiến quý giá mà sách giáo khoa không đề cập:

1. **Thiết kế hệ thống Token Theme và State View ngay từ ngày đầu tiên**:
   - Ở giai đoạn đầu, nhóm bắt tay vào dựng màn hình trước nên có một vài chỗ tiện tay gõ mã màu trực tiếp hoặc chưa xử lý đủ 4 trạng thái (Loading, Empty, Error, Content). Về sau, khi ráp chuẩn yêu cầu kỹ thuật của đề bài (không được có bất kỳ mã hex nào ngoài file theme), cả nhóm phải mất thời gian đi rà soát và thay thế toàn bộ. Nếu làm lại từ đầu, việc đầu tiên nhóm làm sẽ là chốt cứng file `src/constants/theme.ts` và component `StateView.tsx`, sau đó mới dựng từng màn hình thì tốc độ phát triển sẽ nhanh gấp đôi.

2. **Tiếp cận Tư duy Ngoại tuyến (Offline-First) ngay từ cấu trúc dữ liệu**:
   - Ban đầu nhóm chỉ nghĩ đơn giản là lưu cache vào `AsyncStorage`. Tuy nhiên khi mô phỏng trường hợp sinh viên mất mạng trên giảng đường rồi tạo 3-4 bài tập mới, việc đồng bộ ngược lên server đòi hỏi phải có hàng đợi `OfflineQueue` với ID tạm thời và cờ đánh dấu `isOfflineCreated`. Nếu quy hoạch hàng đợi này ngay từ lúc thiết kế Service thì code sẽ mạch lạc và không phải sửa đổi cấu trúc nhiều lần.

3. **Tận dụng triệt để Atomic Selectors của Zustand**:
   - Khi chia sẻ dữ liệu giữa các Tab (Tổng quan, Lịch tuần, Danh sách bài tập), nếu component nào cũng lấy toàn bộ store (`const state = useAppStore()`) thì việc người dùng gõ tìm kiếm ở màn hình này sẽ kích hoạt re-render thừa ở các component khác. Nhóm đã kịp thời tái cấu trúc sang các selector nguyên tử (`selectSearchQuery`, `selectSelectedCourseId`), giúp app mượt mà và tiết kiệm pin tối đa cho thiết bị di động.

---

## 2. Một điểm lỗi nghiêm trọng mà trợ lý AI đã trả lời sai và nhóm đã tự phát hiện, sửa chữa (One thing AI got wrong that we caught)

### Vấn đề: Thuật toán xác định "Hạn chót ngày mai" (Due Tomorrow) bị lệch ngày khi sinh viên thức khuya học bài

Trong quá trình xây dựng tính năng hiển thị thời hạn bài tập, nhóm đã yêu cầu trợ lý AI viết hàm tính khoảng cách ngày để hiển thị nhãn thân thiện (ví dụ: *"Hôm nay lúc 23:59"*, *"Ngày mai lúc 08:00"*).

#### ❌ Đoạn mã lỗi do AI cung cấp ban đầu:
AI đã tạo ra một hàm tính khoảng cách ngày dựa trên phép trừ mili-giây thô sơ:
```typescript
// Code lỗi do AI sinh ra
function getRelativeLabel(dueAt: string): string {
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  return `Còn ${diffDays} ngày`;
}
```

#### 🔍 Lỗi nghiêm trọng phát hiện trên thực tế:
Khi bạn Tuấn trong nhóm ngồi kiểm thử ứng dụng vào lúc **23:30 đêm** ngày 26/10 đối với một bài tập có hạn nộp vào **08:00 sáng ngày mai** (27/10):
- Khoảng cách thời gian thực tế: từ 23:30 hôm nay đến 08:00 sáng mai chỉ cách nhau có **8.5 tiếng** ($\approx 30.600.000\text{ ms}$).
- Hàm của AI lấy $30.600.000 / 86.400.000 \approx 0.35$ ngày, qua hàm `Math.round()` bị làm tròn về **`0`**!
- Hậu quả: Màn hình hiển thị bài tập đó là **"Hạn hôm nay"**, trong khi lịch trên điện thoại của sinh viên rõ ràng bài này thuộc về **ngày mai**! Điều này cực kỳ nguy hiểm, có thể làm sinh viên hoảng loạn tưởng bài tập bị quá hạn ngay trong đêm.

#### ✅ Cách sửa chữa đúng đắn của nhóm (tại `src/utils/dateUtils.ts` dòng 14-25):
Nhóm chúng em đã họp lại, phân tích bản chất của lịch theo ngày (Calendar Day) và viết lại hàm chuẩn hóa mốc thời gian về nửa đêm cục bộ (Local Midnight 00:00:00):

```typescript
export function getCalendarDayDiff(targetInput: Date | string, referenceInput: Date | string = new Date()): number {
  const target = typeof targetInput === 'string' ? new Date(targetInput) : targetInput;
  const ref = typeof referenceInput === 'string' ? new Date(referenceInput) : referenceInput;

  // Lấy mốc 00:00:00.000 của ngày cục bộ trên thiết bị
  const refMidnight = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((targetMidnight - refMidnight) / MS_PER_DAY);
}
```

Nhờ giải pháp này, khoảng cách giữa ngày 27/10 và ngày 26/10 luôn luôn là **chính xác +1 ngày**, bất kể người dùng kiểm tra lúc 08:00 sáng, 14:00 chiều hay 23:30 đêm. Nhóm cũng đã viết hẳn một bài test tự động chuyên biệt trong `src/__tests__/dateUtils.test.ts` để khẳng định tính bất biến này.

Đây là minh chứng rõ ràng nhất cho thấy nhóm chúng em không bao giờ "nhắm mắt copy code của AI", mà luôn tư duy độc lập, kiểm thử thực tế và làm chủ hoàn toàn công nghệ.
