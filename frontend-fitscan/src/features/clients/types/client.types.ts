export type MembershipStatus = 'active' | 'expired' | 'pending_payment' | 'suspended' | 'inactive';

export type MembershipType = 'VIP Mensual' | 'Plan Anual Gold' | 'Pase 10 Sesiones' | 'Plan Trimestral';

export interface Client {
  id: string; // UUID
  qrCode: string; // UUID / Signed Token
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  photoUrl: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  hasPendingPayment: boolean;
  pendingAmount?: number;
  notes?: string;
  branch_id?: string;
  branch_name?: string;
  lastAttendance?: string;
  attendanceDates?: string[];
}

export interface AttendanceRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientPhoto: string;
  membershipType: string;
  checkInTime: string; // ISO string
  branchName: string;
  status: 'success' | 'already_checked' | 'expired' | 'pending_payment';
}
