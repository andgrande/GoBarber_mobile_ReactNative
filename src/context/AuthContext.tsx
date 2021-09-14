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

interface SignedInData {
  token: string;
  // user: Record<string, unknown>;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  // user: Record<string, unknown>;
  user: User;
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [credentialData, setCredentialData] = useState<SignedInData>(
    {} as SignedInData,
  );

  useEffect(() => {
    async function loadAsyncStorage(): Promise<void> {
      const [token, user] = await AsyncStorage.multiGet([
        '@GoBarber:token',
        '@GoBarber:user',
      ]);

      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`;

        setCredentialData({ token: token[1], user: JSON.parse(user[1]) });
      }

      setLoading(false);
    }

    loadAsyncStorage();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/sessions', {
      email,
      password,
    });

    const { token, user } = data;

    if (user.avatar_url) {
      user.avatar = 'yoshi.png';
      user.avatar_url = 'http://192.168.0.108:3333/files/yoshi.png';
    }

    setCredentialData({ token, user });

    await AsyncStorage.multiSet([
      ['@GoBarber:token', token],
      ['@GoBarber:user', JSON.stringify(user)],
    ]);

    const formattedToken = token.split('-', 1);

    api.defaults.headers.authorization = `Bearer ${formattedToken[0]}`;
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(['@GoBarber:token', '@GoBarber:user']);

    setCredentialData({} as SignedInData);
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      await AsyncStorage.setItem('@GoBarber:user', JSON.stringify(user));

      setCredentialData({
        token: credentialData.token,
        user,
      });
    },
    [credentialData.token],
  );

  return (
    <AuthContext.Provider
      value={{
        user: credentialData.user,
        loading,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider!');
  }

  return context;
}
