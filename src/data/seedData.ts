import { Assignment, Course, User } from '../types';

export const SEED_COURSES: Course[] = [
  {
    id: 'course-mobile',
    code: 'TH7011101',
    name: 'Lập trình Mobile (React Native)',
    colour: 'emerald',
    credits: 3,
    instructor: 'ThS. Nguyễn Xuân Vinh',
    room: 'Lab 302 - Nhà B',
    dayOfWeek: 3, // Wednesday
  },
  {
    id: 'course-web',
    code: 'TH7011102',
    name: 'Phát triển Ứng dụng Web & API',
    colour: 'blue',
    credits: 3,
    instructor: 'TS. Lê Hải Đăng',
    room: 'Phòng A2-401',
    dayOfWeek: 2, // Tuesday
  },
  {
    id: 'course-ai',
    code: 'TH7011103',
    name: 'Trí tuệ Nhân tạo & Học máy',
    colour: 'purple',
    credits: 3,
    instructor: 'ThS. Trần Quang Minh',
    room: 'Phòng B1-205',
    dayOfWeek: 4, // Thursday
  },
  {
    id: 'course-devops',
    code: 'TH7011104',
    name: 'Kiến trúc Phần mềm & DevOps',
    colour: 'amber',
    credits: 3,
    instructor: 'ThS. Vũ Hoàng Nam',
    room: 'Phòng C3-102',
    dayOfWeek: 5, // Friday
  },
  {
    id: 'course-db',
    code: 'TH7011105',
    name: 'Cơ sở Dữ liệu Nâng cao & NoSQL',
    colour: 'rose',
    credits: 3,
    instructor: 'TS. Phạm Thị Mai',
    room: 'Lab 201 - Nhà C',
    dayOfWeek: 1, // Monday
  },
  {
    id: 'course-security',
    code: 'TH7011106',
    name: 'An toàn & Bảo mật Thông tin',
    colour: 'indigo',
    credits: 2,
    instructor: 'ThS. Đỗ Tuấn Kiệt',
    room: 'Phòng B2-304',
    dayOfWeek: 6, // Saturday
  },
];

// Helper to calculate relative ISO dates dynamically for seed data
function getRelativeISODate(daysOffset: number, hours: number = 23, minutes: number = 59): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-01',
    courseId: 'course-mobile',
    title: 'Nộp Đồ án Cuối kỳ Topic 01 (Study Planner)',
    dueAt: getRelativeISODate(1, 23, 59), // Due tomorrow night!
    status: 'in_progress',
    notes: 'Hoàn thiện 5 màn hình, kiểm thử 3 unit test, viết tài liệu README.md và AI_LOG.md chuẩn format.',
    priority: 'high',
    estimatedMinutes: 240,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'assign-02',
    courseId: 'course-mobile',
    title: 'Lab 08: Shared state and working sign-in',
    dueAt: getRelativeISODate(-1, 23, 59), // Due yesterday
    status: 'completed',
    notes: 'Đã hoàn thành Zustand slices, SecureStore token và kiểm thử cách ly User A vs User B.',
    priority: 'medium',
    estimatedMinutes: 120,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'assign-03',
    courseId: 'course-web',
    title: 'Xây dựng RESTful API với Express và JWT',
    dueAt: getRelativeISODate(0, 20, 0), // Due today at 20:00!
    status: 'pending',
    notes: 'Tạo các endpoint CRUD cho môn học, mã hóa mật khẩu bằng bcrypt và middleware xác thực JWT.',
    priority: 'high',
    estimatedMinutes: 150,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'assign-04',
    courseId: 'course-ai',
    title: 'Bài tập Phân lớp Ảnh với CNN và PyTorch',
    dueAt: getRelativeISODate(3, 23, 59), // Due in 3 days
    status: 'in_progress',
    notes: 'Huấn luyện mô hình ResNet-18 trên tập dữ liệu hoa, vẽ biểu đồ Loss và Accuracy qua các Epoch.',
    priority: 'medium',
    estimatedMinutes: 180,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'assign-05',
    courseId: 'course-devops',
    title: 'Thiết lập Pipeline CI/CD trên GitHub Actions',
    dueAt: getRelativeISODate(5, 17, 30), // Due in 5 days
    status: 'pending',
    notes: 'Tự động chạy linting, unit test và build container Docker khi có pull request vào nhánh main.',
    priority: 'low',
    estimatedMinutes: 90,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'assign-06',
    courseId: 'course-db',
    title: 'Thiết kế Schema Sharding trên MongoDB',
    dueAt: getRelativeISODate(6, 23, 59), // Due in 6 days
    status: 'pending',
    notes: 'Phân tích chiến lược chọn Shard Key tối ưu để tránh Hotspot Partition trên hệ thống giao dịch lớn.',
    priority: 'medium',
    estimatedMinutes: 120,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'assign-07',
    courseId: 'course-security',
    title: 'Thực hành Phân tích Lỗ hổng SQL Injection và XSS',
    dueAt: getRelativeISODate(-3, 23, 59), // Completed 3 days ago
    status: 'completed',
    notes: 'Đã báo cáo các payload khai thác và cơ chế phòng thủ bằng Prepared Statements và Content Security Policy.',
    priority: 'high',
    estimatedMinutes: 160,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const DEFAULT_USER: User = {
  id: 'usr-tuan-1923050209',
  name: 'Mai Hoàng Tuấn',
  email: 'tuan.mai@student.dntu.edu.vn',
  studentId: '1923050209',
};

export const DEMO_USERS: User[] = [
  {
    id: 'usr-tuan-1923050209',
    name: 'Mai Hoàng Tuấn',
    email: 'tuan.mai@student.dntu.edu.vn',
    studentId: '1923050209',
  },
  {
    id: 'usr-thanh-1923050251',
    name: 'Lại Văn Thành',
    email: 'thanh.lai@student.dntu.edu.vn',
    studentId: '1923050251',
  },
  {
    id: 'usr-long-1923050707',
    name: 'Nguyễn Hoàng Long',
    email: 'long.nguyen@student.dntu.edu.vn',
    studentId: '1923050707',
  },
];
