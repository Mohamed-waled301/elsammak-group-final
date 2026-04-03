import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  phone?: string;
  role: 'admin' | 'client';
  nationalId?: string;
  governorate?: string;
  city?: string;
}

interface AuthContextType {
 isLoggedIn: boolean;
 user: UserData | null;
 login: (token: string, userData?: UserData) => void;
 logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
 const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
 return Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token'));
 });
 const [user, setUser] = useState<UserData | null>(() => {
 const userData = localStorage.getItem('user_data');
 return userData ? JSON.parse(userData) : null;
 });

 const login = (token: string, userData: UserData | null = null) => {
 localStorage.setItem('token', token);
 localStorage.setItem('auth_token', token);
 if (userData) {
 localStorage.setItem('user_data', JSON.stringify(userData));
 setUser(userData);
 }
 setIsLoggedIn(true);
 };

 const logout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user_data');
 setUser(null);
 setIsLoggedIn(false);
 };

 return (
 <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
