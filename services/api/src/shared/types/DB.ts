import User from "./User"
import OrganizationSettings from "./OrganizationSettings";
import AttendanceRecord from "./AttendanceRecord";

export default interface DB {
  users: User[];
  settings: OrganizationSettings;
  attendance: AttendanceRecord[];
}