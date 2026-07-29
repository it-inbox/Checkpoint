export interface AttendanceRecord {
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