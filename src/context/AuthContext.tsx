import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnauthorizedHandler } from '../api/client';
import { authApi, type UserRole } from '../api/endpoints';

export interface UserDetail {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  [key: string]: any;
}

interface AuthContextValue {
  token: string | null;
  userDetail: UserDetail | null;
  isLoading: boolean;
  login: (token: string, userDetail: UserDetail) => Promise<void>;
  logout: () => Promise<void>;
  updateUserDetail: (userDetail: UserDetail) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await AsyncStorage.removeMany(['token', 'userDetail']);
    setToken(null);
    setUserDetail(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUserDetail(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getMany(['token', 'userDetail']);
      const storedToken = stored.token;
      const storedUserDetail = stored.userDetail;
      if (storedToken) setToken(storedToken);
      if (storedUserDetail) {
        try {
          setUserDetail(JSON.parse(storedUserDetail));
        } catch {
          await AsyncStorage.removeItem('userDetail');
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (newToken: string, newUserDetail: UserDetail) => {
    await AsyncStorage.setMany({
      token: newToken,
      userDetail: JSON.stringify(newUserDetail),
    });
    setToken(newToken);
    setUserDetail(newUserDetail);
  }, []);

  const updateUserDetail = useCallback(async (newUserDetail: UserDetail) => {
    await AsyncStorage.setItem('userDetail', JSON.stringify(newUserDetail));
    setUserDetail(newUserDetail);
  }, []);

  const value = useMemo(
    () => ({ token, userDetail, isLoading, login, logout, updateUserDetail }),
    [token, userDetail, isLoading, login, logout, updateUserDetail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
