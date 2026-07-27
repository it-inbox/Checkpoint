// ./src/shared/types/index.ts

interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  designation: string;
  department: string;
  joinedDate: string;
  avatarUrl?: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'auto_closed';
  workingHours: number;
  notes?: string;
  selfieUrl?: string;
}

interface OrganizationSettings {
  companyName: string;
  officeName: string;
  latitude: number;
  longitude: number;
  radius: number;
  officeStartTime: string;
  officeEndTime: string;
}

interface DB {
  users: User[];
  settings: OrganizationSettings;
  attendance: AttendanceRecord[];
}

export {
    User,
    AttendanceRecord,
    OrganizationSettings,
    DB
}