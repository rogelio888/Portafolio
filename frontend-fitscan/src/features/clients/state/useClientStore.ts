import { create } from 'zustand';
import type { Client, AttendanceRecord } from '../types/client.types';
import { api } from '../../../services/api';
import { useBranchStore } from '../../settings/state/useBranchStore';

export interface ScanResult {
  client?: Client;
  status: 'success' | 'already_checked' | 'expired' | 'pending_payment' | 'not_found' | 'wrong_branch';
  message: string;
  previousCheckIn?: string;
}

export interface PendingMobilePayment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhoto: string;
  planName: string;
  amountBs: number;
  receiptNumber: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const syncClientsToStorage = (clientsList: Client[]) => {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem('fitscan_web_clients', JSON.stringify(clientsList));
    }
  } catch {
    // Ignore
  }
};

const getStoredWebClients = (): Client[] => {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      const raw = (globalThis as any).localStorage.getItem('fitscan_web_clients');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const localToday = new Date().toLocaleDateString('sv');
          return parsed.map((c: Client) => {
            if (c.status !== 'suspended' && c.status !== 'inactive') {
              const end = c.endDate ? String(c.endDate).split('T')[0] : '';
              if (!end || end < localToday) {
                c.status = 'expired';
                if (c.membershipType && !String(c.membershipType).includes('(Vencida)')) {
                  const base = String(c.membershipType).replace(/\s*\(.*?\)/, '');
                  c.membershipType = `${base} (Vencida)` as any;
                }
              } else {
                c.status = 'active';
              }
            }
            return c;
          });
        }
      }
    }
  } catch {
    // Ignore
  }
  return [];
};

// Helper to map backend API client object to frontend Client type
const mapApiClientToFrontend = (item: any): Client => {
  const activeMem = item.active_membership;
  const latestMem = item.latest_membership;
  const targetMem = activeMem || latestMem;

  const rawEndDate = targetMem?.end_date ? String(targetMem.end_date).split('T')[0] : '';
  const localToday = new Date().toLocaleDateString('sv');

  let computedStatus: any = item.computed_status || item.status;
  const rawStatus = typeof computedStatus === 'string' ? computedStatus : (computedStatus?.value || 'active');

  if (rawStatus === 'suspended' || rawStatus === 'inactive') {
    computedStatus = rawStatus;
  } else if (rawEndDate && rawEndDate >= localToday) {
    computedStatus = 'active';
  } else {
    computedStatus = 'expired';
  }

  let memName = 'Sin Membresía Activa';
  const baseName = activeMem?.membership?.name || latestMem?.membership?.name;
  if (baseName) {
    const rawStartDate = targetMem?.start_date ? String(targetMem.start_date).split('T')[0] : '';
    if (rawStartDate && rawStartDate > localToday) {
      memName = `${baseName} (Programada)`;
    } else if (!rawEndDate || rawEndDate < localToday) {
      memName = `${baseName} (Vencida)`;
    } else {
      memName = baseName;
    }
  }

  return {
    id: item.id,
    qrCode: item.qr_token || item.id,
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    email: item.email || '',
    phone: item.phone || '',
    address: item.address || '',
    birthDate: item.birth_date || '',
    photoUrl: item.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    membershipType: memName as any,
    status: computedStatus,
    startDate: targetMem?.start_date ? String(targetMem.start_date).split('T')[0] : '',
    endDate: rawEndDate,
    hasPendingPayment: false,
    branch_id: item.branch_id,
    branch_name: item.branch?.name,
    lastAttendance: item.last_attendance_formatted || item.latest_attendance?.check_in_at || '',
    attendanceDates: Array.isArray(item.attendance_dates) ? item.attendance_dates : [],
  };
};

export interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  isAttendanceLoading: boolean;
  attendanceLog: AttendanceRecord[];
  pendingPayments: PendingMobilePayment[];
  activeScanResult: ScanResult | null;
  isKioskMode: boolean;
  selectedBranch: string;
  theme: 'dark' | 'light';

  // Actions
  fetchClients: (search?: string, status?: string) => Promise<void>;
  fetchTodayAttendance: (branchId?: string) => Promise<void>;
  fetchAttendanceHistory: (params?: {
    page?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    branchId?: string;
    scanMethod?: string;
    perPage?: number;
  }) => Promise<any>;
  setKioskMode: (enabled: boolean) => void;
  setSelectedBranch: (branch: string) => void;
  toggleTheme: () => void;
  addClient: (newClientData: Omit<Client, 'id' | 'qrCode' | 'status'> & { branch_id?: string }) => Promise<Client>;
  updateClient: (id: string, updatedData: Partial<Client>) => Promise<void>;
  processQrScan: (qrCodeString: string, targetBranchId?: string) => Promise<ScanResult>;
  clearScanResult: () => void;
  renewMembership: (clientId: string) => void;
  approvePendingPayment: (id: string) => void;
  rejectPendingPayment: (id: string) => void;
}

let currentFetchId = 0;

const initialStoredClients = getStoredWebClients();
const defaultClientsList = initialStoredClients;

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: defaultClientsList,
  isLoading: false,
  isAttendanceLoading: false,
  attendanceLog: [],
  pendingPayments: [],
  activeScanResult: null,
  isKioskMode: false,
  selectedBranch: 'Sucursal Central',
  theme: 'dark',

  setKioskMode: (enabled: boolean) => set({ isKioskMode: enabled }),
  setSelectedBranch: (branch: string) => set({ selectedBranch: branch }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  approvePendingPayment: (id: string) => {
    set((state) => ({
      pendingPayments: state.pendingPayments.filter((p) => p.id !== id),
    }));
  },

  rejectPendingPayment: (id: string) => {
    set((state) => ({
      pendingPayments: state.pendingPayments.filter((p) => p.id !== id),
    }));
  },

  fetchAttendanceHistory: async (params = {}) => {
    const activeBranch = params.branchId ?? useBranchStore.getState().activeBranchId;
    const response = await api.get('/attendance/history', {
      params: {
        page: params.page || 1,
        start_date: params.startDate || undefined,
        end_date: params.endDate || undefined,
        search: params.search || undefined,
        scan_method: params.scanMethod || undefined,
        branch_id: activeBranch !== 'all' ? activeBranch : undefined,
        per_page: params.perPage || 20,
      },
      headers: activeBranch && activeBranch !== 'all' ? { 'X-Branch-Id': activeBranch } : {},
    });
    return response.data;
  },

  fetchTodayAttendance: async (branchId?: string) => {
    set({ isAttendanceLoading: true });
    try {
      const activeBranch = branchId ?? useBranchStore.getState().activeBranchId;
      const response = await api.get('/attendance/today', {
        headers: activeBranch ? { 'X-Branch-Id': activeBranch } : {},
      });
      const items = response.data?.data || response.data || [];
      if (Array.isArray(items)) {
        const mappedLog: AttendanceRecord[] = items.map((item: any) => ({
          id: item.id,
          clientId: item.client?.id || '',
          clientName: item.client?.full_name || 'Socio',
          clientPhoto: item.client?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          membershipType: item.membership_type || 'Plan Vigente',
          checkInTime: item.check_in_at || new Date().toISOString(),
          branchName: item.branch_name || 'Sucursal Sede',
          status: 'success',
        }));
        set({ attendanceLog: mappedLog });
      }
    } catch {
      // Keep existing log
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  fetchClients: async (search?: string, status?: string) => {
    const requestId = ++currentFetchId;
    set({ isLoading: true });
    try {
      const response = await api.get('/clients', {
        params: {
          search: search || undefined,
          status: status !== 'all' ? status : undefined,
        },
      });

      if (requestId !== currentFetchId) return;

      const dataArray = response.data?.data || response.data || [];
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        const mappedClients = dataArray.map(mapApiClientToFrontend);
        set({ clients: mappedClients, isLoading: false });
        syncClientsToStorage(mappedClients);
        return;
      }
    } catch {
      if (requestId !== currentFetchId) return;
      if (get().clients.length === 0) {
        set({ clients: defaultClientsList });
      }
    }

    if (requestId === currentFetchId) {
      set({ isLoading: false });
    }
  },

  addClient: async (newClientData: Omit<Client, 'id' | 'qrCode' | 'status'> & { branch_id?: string }) => {
    try {
      const payload: any = {
        first_name: newClientData.firstName,
        last_name: newClientData.lastName,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        birth_date: newClientData.birthDate || undefined,
        photo_url: newClientData.photoUrl,
        notes: newClientData.notes,
        status: 'active',
      };
      if (newClientData.branch_id) {
        payload.branch_id = newClientData.branch_id;
      }
      const res = await api.post('/clients', payload);
      const created = mapApiClientToFrontend(res.data?.data || res.data);
      const updatedList = [created, ...get().clients];
      set({ clients: updatedList });
      syncClientsToStorage(updatedList);
      return created;
    } catch {
      // Fallback for offline local state
      const id = crypto.randomUUID();
      const qrCode = id;
      const fallbackClient: Client = {
        ...newClientData,
        id,
        qrCode,
        status: 'active',
      };
      const updatedList = [fallbackClient, ...get().clients];
      set({ clients: updatedList });
      syncClientsToStorage(updatedList);
      return fallbackClient;
    }
  },

  updateClient: async (id: string, updatedData: Partial<Client>) => {
    try {
      const payload: any = {};
      if (updatedData.firstName) payload.first_name = updatedData.firstName;
      if (updatedData.lastName) payload.last_name = updatedData.lastName;
      if (updatedData.email) payload.email = updatedData.email;
      if (updatedData.phone) payload.phone = updatedData.phone;
      if (updatedData.address) payload.address = updatedData.address;
      if (updatedData.status) payload.status = updatedData.status;
      if (updatedData.photoUrl) payload.photo_url = updatedData.photoUrl;

      await api.put(`/clients/${id}`, payload);
    } catch {
      // Ignore API errors in offline fallback
    }
    const updatedList = get().clients.map((c: Client) => (c.id === id ? { ...c, ...updatedData } : c));
    set({ clients: updatedList });
    syncClientsToStorage(updatedList);
  },

  processQrScan: async (qrCodeString: string, targetBranchId?: string) => {
    const { clients, attendanceLog, selectedBranch } = get();

    try {
      const response = await api.post('/attendance/scan', {
        qr_token: qrCodeString,
        branch_id: targetBranchId || undefined,
      });
      const data = response.data;

      const matchedClient = clients.find(
        (c: Client) =>
          c.qrCode.toLowerCase() === qrCodeString.toLowerCase() ||
          c.id.toLowerCase() === qrCodeString.toLowerCase() ||
          c.id === data.client?.id
      );

      const frontendClient: Client = matchedClient || {
        id: data.client?.id || qrCodeString,
        qrCode: qrCodeString,
        firstName: data.client?.full_name?.split(' ')[0] || 'Cliente',
        lastName: data.client?.full_name?.split(' ').slice(1).join(' ') || '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        photoUrl: data.client?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        membershipType: data.membership?.name || 'Sin Membresía Activa',
        status: data.client?.status || 'active',
        startDate: data.membership?.start_date || '',
        endDate: data.membership?.end_date || '',
        hasPendingPayment: false,
      };

      let mappedStatus: 'success' | 'already_checked' | 'expired' | 'pending_payment' | 'not_found' | 'wrong_branch' = 'success';
      if (data.status === 'already_checked_in') mappedStatus = 'already_checked';
      else if (data.status === 'wrong_branch') mappedStatus = 'wrong_branch';
      else if (data.status === 'expired' || data.status === 'no_membership' || data.status === 'inactive') mappedStatus = 'expired';
      else if (data.status === 'not_found') mappedStatus = 'not_found';

      const scanResult: ScanResult = {
        client: frontendClient,
        status: mappedStatus,
        message: data.message || 'Escaneo procesado correctamente',
        previousCheckIn: data.previous_check_in,
      };

      if (mappedStatus === 'success') {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const nowFormatted = `${todayDateStr} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

        const updatedClientsList = get().clients.map((c: Client) => {
          if (c.id === frontendClient.id || c.qrCode === frontendClient.qrCode) {
            const currentDates = c.attendanceDates || [];
            const newDates = currentDates.includes(todayDateStr) ? currentDates : [...currentDates, todayDateStr];
            return {
              ...c,
              lastAttendance: nowFormatted,
              attendanceDates: newDates,
            };
          }
          return c;
        });

        const newRecord: AttendanceRecord = {
          id: data.attendance?.id || crypto.randomUUID(),
          clientId: frontendClient.id,
          clientName: `${frontendClient.firstName} ${frontendClient.lastName}`,
          clientPhoto: frontendClient.photoUrl,
          membershipType: frontendClient.membershipType,
          checkInTime: new Date().toISOString(),
          branchName: selectedBranch,
          status: 'success',
        };

        set({ clients: updatedClientsList, attendanceLog: [newRecord, ...attendanceLog] });
        syncClientsToStorage(updatedClientsList);
        get().fetchClients();
        get().fetchTodayAttendance(targetBranchId);
      }

      set({ activeScanResult: scanResult });
      return scanResult;
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        const matchedClient = clients.find(
          (c: Client) =>
            c.qrCode.toLowerCase() === qrCodeString.toLowerCase() ||
            c.id.toLowerCase() === qrCodeString.toLowerCase() ||
            c.id === data.client?.id
        );

        const frontendClient: Client = matchedClient || {
          id: data.client?.id || qrCodeString,
          qrCode: qrCodeString,
          firstName: data.client?.full_name?.split(' ')[0] || 'Cliente',
          lastName: data.client?.full_name?.split(' ').slice(1).join(' ') || '',
          email: '',
          phone: '',
          address: '',
          birthDate: '',
          photoUrl: data.client?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          membershipType: data.membership?.name || 'Sin Membresía Activa',
          status: data.client?.status || 'expired',
          startDate: data.membership?.start_date || '',
          endDate: data.membership?.end_date || '',
          hasPendingPayment: false,
        };

        let mappedStatus: 'success' | 'already_checked' | 'expired' | 'pending_payment' | 'not_found' | 'wrong_branch' = 'expired';
        if (data.status === 'already_checked_in') mappedStatus = 'already_checked';
        else if (data.status === 'wrong_branch') mappedStatus = 'wrong_branch';
        else if (data.status === 'not_found') mappedStatus = 'not_found';
        else if (data.status === 'expired' || data.status === 'no_membership' || data.status === 'inactive') mappedStatus = 'expired';

        const scanResult: ScanResult = {
          client: frontendClient,
          status: mappedStatus,
          message: data.message || 'No se pudo procesar la asistencia.',
          previousCheckIn: data.previous_check_in,
        };

        set({ activeScanResult: scanResult });
        return scanResult;
      }

      // Offline fallback calculation matching ecosystem clients
      const allClients = get().clients;
      const cleanQr = qrCodeString.toLowerCase().trim();

      const client = allClients.find(
        (c: Client) =>
          c.qrCode.toLowerCase() === cleanQr ||
          c.id.toLowerCase() === cleanQr ||
          c.email.toLowerCase() === cleanQr ||
          cleanQr.includes(c.id.toLowerCase()) ||
          cleanQr.includes(c.qrCode.toLowerCase()) ||
          cleanQr.includes(c.firstName.toLowerCase())
      );

      if (!client) {
        const result: ScanResult = { status: 'not_found', message: 'Código QR no reconocido.' };
        set({ activeScanResult: result });
        return result;
      }

      if (targetBranchId && targetBranchId !== 'all' && client.branch_id && client.branch_id !== targetBranchId && client.membershipType !== 'Plan Trimestral') {
        const branchName = client.branch_name || 'su sucursal de origen';
        const result: ScanResult = {
          client,
          status: 'wrong_branch',
          message: `Membresía válida únicamente en ${branchName}.`,
        };
        set({ activeScanResult: result });
        return result;
      }

      if (client.status === 'expired') {
        const result: ScanResult = { client, status: 'expired', message: 'Membresía VENCIDA.' };
        set({ activeScanResult: result });
        return result;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const alreadyChecked = attendanceLog.find((log: AttendanceRecord) => {
        const logDateStr = new Date(log.checkInTime).toISOString().split('T')[0];
        return log.clientId === client.id && logDateStr === todayStr;
      });

      if (alreadyChecked) {
        const timeFormatted = new Date(alreadyChecked.checkInTime).toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const result: ScanResult = {
          client,
          status: 'already_checked',
          message: `El cliente YA INGRESÓ hoy a las ${timeFormatted}.`,
          previousCheckIn: timeFormatted,
        };
        set({ activeScanResult: result });
        return result;
      }

      const localNow = new Date();
      const todayDateStr = localNow.toISOString().split('T')[0];
      const timeFormatted = localNow.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
      const nowFormatted = `${todayDateStr} ${timeFormatted}`;

      const updatedClientsList = get().clients.map((c: Client) => {
        if (c.id === client.id || c.qrCode === client.qrCode) {
          const currentDates = c.attendanceDates || [];
          const newDates = currentDates.includes(todayDateStr) ? currentDates : [...currentDates, todayDateStr];
          return {
            ...c,
            lastAttendance: nowFormatted,
            attendanceDates: newDates,
          };
        }
        return c;
      });

      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        clientPhoto: client.photoUrl,
        membershipType: client.membershipType,
        checkInTime: localNow.toISOString(),
        branchName: selectedBranch,
        status: 'success',
      };

      const result: ScanResult = {
        client,
        status: 'success',
        message: `¡Bienvenido/a, ${client.firstName}!`,
      };

      set({
        clients: updatedClientsList,
        attendanceLog: [newRecord, ...attendanceLog],
        activeScanResult: result,
      });
      syncClientsToStorage(updatedClientsList);

      return result;
    }
  },

  clearScanResult: () => set({ activeScanResult: null }),

  renewMembership: (clientId: string) => {
    const updated = get().clients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          status: 'active' as const,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2026-12-31',
        };
      }
      return c;
    });
    set({ clients: updated });
    syncClientsToStorage(updated);
  },
}));
