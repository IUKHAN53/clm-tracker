import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/client';

const AUTH_TOKEN_KEY = '@clm_auth_token';
const AUTH_USER_KEY = '@clm_auth_user';
const SITE_KEY = '@clm_site';
const STORAGE_KEY = '@clm_children';

interface User {
  id: number;
  name: string;
  phone: string;
  district?: string | null;
  uc?: string | null;
  fix_site?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (phone, password) => {
    try {
      const response = await api.post('/clm/login', { phone, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      set({ token, user, isAuthenticated: true });

      // Populate site info from user's data if available
      if (user.district || user.uc || user.fix_site) {
        const currentSiteData = await AsyncStorage.getItem(SITE_KEY);
        const currentSite = currentSiteData ? JSON.parse(currentSiteData) : {};

        // Only populate if not already set
        const newSite = {
          district: currentSite.district || user.district || '',
          uc: currentSite.uc || user.uc || '',
          fixSite: currentSite.fixSite || user.fix_site || '',
        };
        await AsyncStorage.setItem(SITE_KEY, JSON.stringify(newSite));
      }

      // Update pending records with community member info
      const childrenData = await AsyncStorage.getItem(STORAGE_KEY);
      if (childrenData) {
        const children = JSON.parse(childrenData);
        const updatedChildren = children.map((child: Record<string, unknown>) => {
          // Only update if community member info is missing
          if (!child.communityMemberName || !child.communityMemberContact) {
            return {
              ...child,
              communityMemberName: child.communityMemberName || user.name,
              communityMemberContact: child.communityMemberContact || user.phone,
            };
          }
          return child;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren));
      }

      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(AUTH_USER_KEY),
    ]);
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
