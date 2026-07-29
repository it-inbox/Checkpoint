export interface User {
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