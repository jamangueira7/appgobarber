import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import api from '../services/api';

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthState {
  token: string;
  user: object;
}

interface AuthContextData {
  user: object;
  singIn(credentials: SignInCredentials): Promise<void>;
  singOut(): void;
}
const Auth = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      const [token, user] = await AsyncStorage.multiGet([
          '@Gobarber:token',
          '@Gobarber:user',
      ]);

      if(token[1] && user[1]) {
        setData({ token: token[1], user: JSON.parse(user[1]) });
      }
    }

    loadStorageData();
  }, []);

  const singIn = useCallback(async ({ email, password }) => {

    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    await AsyncStorage.multiSet([
        ['@Gobarber:token', token],
        ['@Gobarber:user', JSON.stringify(user)]
    ]);

    setData({ token, user });
  }, []);

  const singOut = useCallback(async () => {

    await AsyncStorage.multiRemove(['@Gobarber:token', '@Gobarber:user']);
    setData({} as AuthState);
  }, []);

  return (
    <Auth.Provider value={{ user: data.user, singIn, singOut }}>
      {children}
    </Auth.Provider>
  );
};

export function UseAuth(): AuthContextData {
  const context = useContext(Auth);

  if (!context) {
    throw new Error('useAuth must be user within an AuthProvider');
  }

  return context;
}
