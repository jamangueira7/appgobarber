import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface AuthContextData {
  user: User;
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): Promise<void>;
}

const Auth = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      try {
        const [token, user] = await AsyncStorage.multiGet([
            '@Gobarber:token',
            '@Gobarber:user',
        ]);

        if(token[1] && user[1]) {
          api.defaults.headers.authorization = `Bearer ${token[1]}`;

          setData({ token: token[1], user: JSON.parse(user[1]) });
        }
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    await AsyncStorage.multiSet([
        ['@Gobarber:token', token],
        ['@Gobarber:user', JSON.stringify(user)],
    ]);

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);


  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(['@Gobarber:token', '@Gobarber:user']);

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(async (user: User) => {
    await AsyncStorage.setItem('@Gobarber:user', JSON.stringify(user));

    setData({
      token: data.token,
      user,
    });
  }, [setData, data.token]);

  return (
    <Auth.Provider
        value={{ user: data.user, loading, signIn, signOut, updateUser }}
    >
      {children}
    </Auth.Provider>
  );
};

function UseAuth(): AuthContextData {
  const context = useContext(Auth);

  if (!context) {
    throw new Error('useAuth must be user within an AuthProvider');
  }

  return context;
}

export { AuthProvider, UseAuth };
