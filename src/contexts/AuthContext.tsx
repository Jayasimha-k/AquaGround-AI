import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'officer' | 'viewer';
  roleTitle: string;
  department: string;
  state?: string;
  avatar: string;
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Dr. Anand Verma',
    email: 'anand.verma@cgwb.gov.in',
    role: 'officer',
    roleTitle: 'Senior Hydrogeologist',
    department: 'Central Ground Water Board (CGWB)',
    state: 'Rajasthan & Northern Region',
    avatar: 'AV'
  },
  {
    id: 'usr-2',
    name: 'Priya Patel',
    email: 'priya.patel@cgwb.gov.in',
    role: 'admin',
    roleTitle: 'System Administrator',
    department: 'Ministry of Jal Shakti HQ',
    state: 'National HQ - New Delhi',
    avatar: 'PP'
  },
  {
    id: 'usr-3',
    name: 'Rajan Sharma',
    email: 'rajan.sharma@cgwb.gov.in',
    role: 'analyst',
    roleTitle: 'Telemetry Data Analyst',
    department: 'DWLR Operations Division',
    state: 'Punjab & Haryana Basin',
    avatar: 'RS'
  },
  {
    id: 'usr-4',
    name: 'Public Auditor View',
    email: 'auditor@india-wris.gov.in',
    role: 'viewer',
    roleTitle: 'Public Auditor / Observer',
    department: 'Water Transparency Audit',
    state: 'All India',
    avatar: 'PA'
  }
];

interface AuthContextValue {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, roleOverride?: UserAccount['role'], positionTitle?: string) => boolean;
  quickDemoLogin: (account: UserAccount) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('aquaground_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aquaground_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aquaground_user');
    }
  }, [currentUser]);

  const login = (email: string, _pass: string, roleOverride?: UserAccount['role'], positionTitle?: string): boolean => {
    const rawName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim();
    const formattedName = rawName.length > 0 
      ? rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'CGWB Officer';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      email: email,
      role: roleOverride || 'officer',
      roleTitle: positionTitle || 'Senior Hydrogeologist',
      department: 'Central Ground Water Board (CGWB)',
      avatar: formattedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CG'
    };
    setCurrentUser(newUser);
    return true;
  };


  const quickDemoLogin = (account: UserAccount) => {
    setCurrentUser(account);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aquaground_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      quickDemoLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
