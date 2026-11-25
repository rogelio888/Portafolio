import { create } from 'zustand';
import { api } from '../../../services/api';

export interface Branch {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  clients_count?: number;
  users_count?: number;
}

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'adf0af1a-d090-4dc2-a2ae-2ea18859c90b',
    name: 'Sucursal Central Equipetrol',
    code: 'EQP-01',
    address: 'Av. San Martín #450, Equipetrol',
    phone: '+591 3 3456789',
    is_active: true,
    clients_count: 3,
    users_count: 3,
  },
  {
    id: '63501637-608c-4ca5-8c61-176b68dc907c',
    name: 'Sucursal Villa 1ro de Mayo',
    code: 'VIL-02',
    address: 'Av. Cumavi #120, Villa 1ro de Mayo',
    phone: '+591 3 3567890',
    is_active: true,
    clients_count: 3,
    users_count: 2,
  },
  {
    id: '146405e7-b085-4247-9e09-06c92950948c',
    name: 'Sucursal Plan 3000',
    code: 'PLN-03',
    address: 'Av. Che Guevara #800, Plan 3000',
    phone: '+591 3 3678901',
    is_active: true,
    clients_count: 3,
    users_count: 2,
  },
];

interface BranchState {
  branches: Branch[];
  activeBranchId: string; // 'all' or branch UUID
  isLoading: boolean;
  error: string | null;
  fetchBranches: () => Promise<void>;
  setActiveBranchId: (id: string) => void;
  getActiveBranchName: () => string;
}

let fetchBranchesPromise: Promise<void> | null = null;

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: DEFAULT_BRANCHES,
  activeBranchId: localStorage.getItem('fitscan_active_branch_id') || 'all',
  isLoading: false,
  error: null,

  fetchBranches: async () => {
    if (fetchBranchesPromise) return fetchBranchesPromise;

    fetchBranchesPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get('/branches');
        const branchList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        if (branchList && branchList.length > 0) {
          set({ branches: branchList, isLoading: false });
        } else {
          set({ branches: [], isLoading: false });
        }
      } catch (err: any) {
        console.error('Error fetching branches in useBranchStore:', err);
        set({ branches: DEFAULT_BRANCHES, isLoading: false });
      } finally {
        fetchBranchesPromise = null;
      }
    })();

    return fetchBranchesPromise;
  },

  setActiveBranchId: (id: string) => {
    localStorage.setItem('fitscan_active_branch_id', id);
    set({ activeBranchId: id });
    window.dispatchEvent(new Event('branch-changed'));
  },

  getActiveBranchName: () => {
    const { activeBranchId, branches } = get();
    if (activeBranchId === 'all') {
      return 'Todas las Sucursales (Consolidado)';
    }
    const found = branches.find((b) => b.id === activeBranchId);
    return found ? found.name : 'Sucursal Activa';
  },
}));
