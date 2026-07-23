export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  designation: string;
  department: string;
  joinedDate: string;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm:ss or null
  checkOut: string | null; // HH:mm:ss or null
  status: 'present' | 'absent' | 'late' | 'half_day' | 'auto_closed';
  workingHours: number; // in hours
  notes?: string;
  selfieUrl?: string;
}

export interface OrganizationSettings {
  companyName: string;
  officeName: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  officeStartTime: string; // HH:mm
  officeEndTime: string; // HH:mm
}

export interface AdminDashboardMetrics {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  autoClosedToday: number;
  attendanceRate: number;
  weeklyStats: {
    day: string;
    present: number;
    late: number;
    absent: number;
  }[];
}

export interface EmployeeDashboardMetrics {
  todayAttendance: AttendanceRecord | null;
  totalPresent: number;
  totalLate: number;
  totalWorkingHours: number;
  attendanceRate: number;
  recentAttendance: AttendanceRecord[];
}
