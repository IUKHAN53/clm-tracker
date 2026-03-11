import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { ChildRecord, SiteInfo, FilterType, DashboardMetrics } from '@/types';

const STORAGE_KEY = '@clm_children';
const SITE_KEY = '@clm_site';
const PENDING_SYNC_KEY = '@clm_pending_sync';

type PendingAction =
  | { type: 'create'; data: Record<string, unknown> }
  | { type: 'update'; serverId: number; data: Record<string, unknown> }
  | { type: 'delete'; serverId: number };

interface ChildrenState {
  children: ChildRecord[];
  siteInfo: SiteInfo;
  searchQuery: string;
  activeFilter: FilterType;
  isLoading: boolean;
  isSyncing: boolean;
  pendingSync: PendingAction[];

  // Actions
  loadData: () => Promise<void>;
  fetchFromServer: () => Promise<void>;
  addChild: (child: Omit<ChildRecord, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateChild: (id: string, updates: Partial<ChildRecord>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  setSiteInfo: (info: SiteInfo) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  syncPending: () => Promise<{ synced: number; failed: number }>;
  syncSingleRecord: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Computed
  getFilteredChildren: () => ChildRecord[];
  getMetrics: () => DashboardMetrics;
  getChildById: (id: string) => ChildRecord | undefined;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Convert frontend camelCase to backend snake_case
function toApiPayload(child: Partial<ChildRecord>, siteInfo?: SiteInfo): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (child.childName !== undefined) payload.child_name = child.childName;
  if (child.fatherName !== undefined) payload.father_name = child.fatherName;
  if (child.age !== undefined) payload.age = child.age;
  if (child.address !== undefined) payload.address = child.address;
  if (child.contactNumber !== undefined) payload.contact_number = child.contactNumber;
  if (child.category !== undefined) payload.category = child.category;
  if (child.vaccinated !== undefined) payload.vaccinated = child.vaccinated;
  if (child.dateOfVaccination !== undefined) payload.date_of_vaccination = child.dateOfVaccination;
  if (child.communityMemberName !== undefined) payload.community_member_name = child.communityMemberName;
  if (child.communityMemberContact !== undefined) payload.community_member_contact = child.communityMemberContact;
  if (child.gpsCoordinates !== undefined) payload.gps_coordinates = child.gpsCoordinates;
  if (child.serialNumber !== undefined) payload.serial_number = child.serialNumber;

  // Parse GPS into lat/lng if available
  if (child.gpsCoordinates) {
    const parts = child.gpsCoordinates.split(',').map((s) => s.trim());
    if (parts.length === 2) {
      payload.latitude = parseFloat(parts[0]);
      payload.longitude = parseFloat(parts[1]);
    }
  }

  // Include site info if provided
  if (siteInfo) {
    payload.fix_site = siteInfo.fixSite;
    payload.uc = siteInfo.uc;
    payload.district = siteInfo.district;
  }

  return payload;
}

// Convert backend snake_case to frontend camelCase
function fromApiRecord(data: Record<string, unknown>): ChildRecord {
  return {
    id: String(data.id),
    serialNumber: (data.serial_number as number) || 0,
    childName: (data.child_name as string) || '',
    fatherName: (data.father_name as string) || '',
    age: (data.age as string) || '',
    address: (data.address as string) || '',
    contactNumber: (data.contact_number as string) || '',
    category: (data.category as ChildRecord['category']) || 'Defaulter',
    vaccinated: (data.vaccinated as ChildRecord['vaccinated']) || 'NO',
    dateOfVaccination: (data.date_of_vaccination as string) || null,
    communityMemberName: (data.community_member_name as string) || '',
    communityMemberContact: (data.community_member_contact as string) || '',
    gpsCoordinates: (data.gps_coordinates as string) || null,
    createdAt: (data.created_at as string) || new Date().toISOString(),
    updatedAt: (data.updated_at as string) || new Date().toISOString(),
  };
}

async function savePendingActions(actions: PendingAction[]) {
  await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(actions));
}

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  children: [],
  siteInfo: { fixSite: '', uc: '', district: '' },
  searchQuery: '',
  activeFilter: 'All',
  isLoading: true,
  isSyncing: false,
  pendingSync: [],

  loadData: async () => {
    try {
      const [childrenData, siteData, pendingData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SITE_KEY),
        AsyncStorage.getItem(PENDING_SYNC_KEY),
      ]);
      set({
        children: childrenData ? JSON.parse(childrenData) : [],
        siteInfo: siteData ? JSON.parse(siteData) : { fixSite: '', uc: '', district: '' },
        pendingSync: pendingData ? JSON.parse(pendingData) : [],
        isLoading: false,
      });

      // Try to fetch from server if authenticated
      if (useAuthStore.getState().isAuthenticated) {
        get().fetchFromServer();
        get().syncPending();
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchFromServer: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    try {
      const response = await api.get('/vaccination-records', { params: { per_page: 500 } });
      const serverRecords: ChildRecord[] = (response.data.data || []).map(fromApiRecord);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverRecords));
      set({ children: serverRecords });
    } catch (err) {
      if (__DEV__) console.warn('Failed to fetch from server, using local data:', err);
    }
  },

  addChild: async (childData) => {
    const state = get();
    const newChild: ChildRecord = {
      ...childData,
      id: generateId(),
      serialNumber: state.children.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save locally first (offline-first)
    const updated = [...state.children, newChild];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ children: updated });

    // Try API sync
    const payload = toApiPayload(newChild, state.siteInfo);
    payload.submitted_at = new Date().toISOString();

    if (useAuthStore.getState().isAuthenticated) {
      try {
        const response = await api.post('/vaccination-records', payload);
        // Replace local temp ID with server ID
        const serverRecord = fromApiRecord(response.data.data);
        const synced = updated.map((c) => (c.id === newChild.id ? serverRecord : c));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        set({ children: synced });
      } catch {
        // Queue for later sync
        const pending = [...state.pendingSync, { type: 'create' as const, data: payload }];
        set({ pendingSync: pending });
        await savePendingActions(pending);
      }
    } else {
      const pending = [...state.pendingSync, { type: 'create' as const, data: payload }];
      set({ pendingSync: pending });
      await savePendingActions(pending);
    }
  },

  updateChild: async (id, updates) => {
    const state = get();
    const updated = state.children.map((child) =>
      child.id === id
        ? { ...child, ...updates, updatedAt: new Date().toISOString() }
        : child
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ children: updated });

    // Try API sync
    const serverId = parseInt(id, 10);
    const payload = toApiPayload(updates, state.siteInfo);

    if (useAuthStore.getState().isAuthenticated && !isNaN(serverId)) {
      try {
        await api.put(`/vaccination-records/${serverId}`, payload);
      } catch {
        const pending = [...state.pendingSync, { type: 'update' as const, serverId, data: payload }];
        set({ pendingSync: pending });
        await savePendingActions(pending);
      }
    }
  },

  deleteChild: async (id) => {
    const state = get();
    const updated = state.children.filter((child) => child.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ children: updated });

    // Try API sync
    const serverId = parseInt(id, 10);
    if (useAuthStore.getState().isAuthenticated && !isNaN(serverId)) {
      try {
        await api.delete(`/vaccination-records/${serverId}`);
      } catch {
        const pending = [...state.pendingSync, { type: 'delete' as const, serverId }];
        set({ pendingSync: pending });
        await savePendingActions(pending);
      }
    }
  },

  syncPending: async () => {
    const state = get();
    if (!useAuthStore.getState().isAuthenticated || state.pendingSync.length === 0 || state.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    set({ isSyncing: true });
    const remaining: PendingAction[] = [];
    let synced = 0;

    for (const action of state.pendingSync) {
      try {
        switch (action.type) {
          case 'create':
            await api.post('/vaccination-records', action.data);
            break;
          case 'update':
            await api.put(`/vaccination-records/${action.serverId}`, action.data);
            break;
          case 'delete':
            await api.delete(`/vaccination-records/${action.serverId}`);
            break;
        }
        synced++;
      } catch {
        remaining.push(action);
      }
    }

    set({ pendingSync: remaining, isSyncing: false });
    await savePendingActions(remaining);

    // Refresh from server after sync
    if (synced > 0) {
      await get().fetchFromServer();
    }

    return { synced, failed: remaining.length };
  },

  syncSingleRecord: async (id: string) => {
    const state = get();
    if (!useAuthStore.getState().isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    const child = state.children.find((c) => c.id === id);
    if (!child) {
      return { success: false, error: 'Record not found' };
    }

    // Check if record is already synced (numeric ID = server-assigned)
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      return { success: true }; // Already synced
    }

    set({ isSyncing: true });

    try {
      const payload = toApiPayload(child, state.siteInfo);
      payload.submitted_at = child.createdAt || new Date().toISOString();

      const response = await api.post('/vaccination-records', payload);
      const serverRecord = fromApiRecord(response.data.data);

      // Replace local record with server record
      const updated = state.children.map((c) => (c.id === id ? serverRecord : c));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Remove matching pending action
      const pending = state.pendingSync.filter(
        (a) => !(a.type === 'create' && a.data.child_name === child.childName && a.data.father_name === child.fatherName)
      );
      await savePendingActions(pending);

      set({ children: updated, pendingSync: pending, isSyncing: false });
      return { success: true };
    } catch (err: unknown) {
      set({ isSyncing: false });
      const message = err instanceof Error ? err.message : 'Failed to sync record';
      return { success: false, error: message };
    }
  },

  setSiteInfo: async (info) => {
    await AsyncStorage.setItem(SITE_KEY, JSON.stringify(info));
    set({ siteInfo: info });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  getFilteredChildren: () => {
    const { children, searchQuery, activeFilter } = get();
    let filtered = children;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.childName.toLowerCase().includes(q) ||
          c.fatherName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'Refusal':
        filtered = filtered.filter((c) => c.category === 'Refusal');
        break;
      case 'Zero Dose':
        filtered = filtered.filter((c) => c.category === 'Zero Dose');
        break;
      case 'Vaccinated':
        filtered = filtered.filter((c) => c.vaccinated === 'YES');
        break;
      case 'Not Vaccinated':
        filtered = filtered.filter((c) => c.vaccinated === 'NO');
        break;
    }

    return filtered;
  },

  getMetrics: () => {
    const { children } = get();
    return {
      totalDefaulters: children.length,
      vaccinated: children.filter((c) => c.vaccinated === 'YES').length,
      pendingRefusals: children.filter(
        (c) => c.category === 'Refusal' && c.vaccinated === 'NO'
      ).length,
      zeroDoseCases: children.filter((c) => c.category === 'Zero Dose').length,
    };
  },

  getChildById: (id) => {
    return get().children.find((c) => c.id === id);
  },
}));
