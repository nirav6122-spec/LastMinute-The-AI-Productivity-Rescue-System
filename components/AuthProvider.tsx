'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken, testEmailPasswordLogin } from '../lib/firebase';
import { seedDemoData } from '../lib/demoSeeder';
import { LogIn } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  signIn: () => Promise<void>;
  testLogin: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('demo@lastminute.ai');
  const [password, setPassword] = useState('Demo@123');

  const isDemo = token === 'test-token';

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const testLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const user = await testEmailPasswordLogin(email, password);
      if (user) {
        setUser(user);
        setToken('test-token');
        await seedDemoData(user.uid);
      }
    } catch (error: any) {
      console.error('Test sign in failed:', error);
      alert('Test sign in failed: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <div className="hidden">{children}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to LastMinute – The AI Productivity Rescue System</h1>
          <p className="text-slate-500 mb-8">Please sign in to manage your tasks, schedule, and productivity.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={signIn}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <div className="border-t border-slate-100 my-4"></div>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            />
            <button
              onClick={() => testLogin(email, password)}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Setting up...' : 'Test Login / Sign Up'}
            </button>
          </div>
        </div>
        <div className="hidden">{children}</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isDemo, signIn, testLogin, signOut, getToken: getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      token: null,
      loading: true,
      isDemo: false,
      signIn: async () => {},
      testLogin: async () => {},
      signOut: async () => {},
      getToken: async () => null,
    };
  }
  return context;
};
