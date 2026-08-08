import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/authApi';
import type { RegisterPayload, AuditLogEntry, DispatchAlertPayload } from '@/services/authApi';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'officer' | 'viewer';
  roleTitle: string;
  designation: string;
  district: string;
  department: string;
  state?: string;
  avatar: string;
  isVerified: boolean;
  registeredAt?: string;
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Dr. Anand Verma',
    email: 'anand.verma@cgwb.gov.in',
    role: 'officer',
    roleTitle: 'Senior Hydrogeologist',
    designation: 'Senior Hydrogeologist / Regional Scientist',
    district: 'Jaipur & Jodhpur Basin',
    department: 'Central Ground Water Board (CGWB)',
    state: 'Rajasthan & Northern Region',
    avatar: 'AV',
    isVerified: true,
    registeredAt: '2025-01-15T09:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Priya Patel',
    email: 'priya.patel@cgwb.gov.in',
    role: 'admin',
    roleTitle: 'System Administrator',
    designation: 'Nodal Officer / System Administrator',
    district: 'National HQ - New Delhi',
    department: 'Ministry of Jal Shakti HQ',
    state: 'National HQ - New Delhi',
    avatar: 'PP',
    isVerified: true,
    registeredAt: '2024-11-20T10:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Rajan Sharma',
    email: 'rajan.sharma@cgwb.gov.in',
    role: 'analyst',
    roleTitle: 'Telemetry Data Analyst',
    designation: 'Third-Party Vendor Engineer / Maintenance Officer',
    district: 'Ludhiana & Amritsar',
    department: 'DWLR Operations Division',
    state: 'Punjab & Haryana Basin',
    avatar: 'RS',
    isVerified: true,
    registeredAt: '2025-03-01T14:20:00Z',
  },
  {
    id: 'usr-4',
    name: 'Public Auditor View',
    email: 'auditor@india-wris.gov.in',
    role: 'viewer',
    roleTitle: 'Public Auditor / Observer',
    designation: 'Citizen / Farmer (Public Viewer)',
    district: 'Pan India',
    department: 'Water Transparency Audit',
    state: 'All India',
    avatar: 'PA',
    isVerified: true,
    registeredAt: '2025-02-10T11:11:00Z',
  },
];

interface AuthContextValue {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  profileModalOpen: boolean;
  loginHistory: AuditLogEntry[];
  openProfileModal: () => void;
  closeProfileModal: () => void;
  registerAccount: (data: RegisterPayload) => Promise<{ status: string; message: string; otp_debug?: string }>;
  verifyOTP: (email: string, code: string, purpose: 'verification' | 'login' | 'reset') => Promise<boolean>;
  loginAccount: (email: string, pass: string) => Promise<{ requiresOtp: boolean; purpose?: string; otp_debug?: string; message?: string }>;
  quickDemoLogin: (account: UserAccount) => void;
  requestPasswordReset: (email: string) => Promise<{ status: string; message: string; otp_debug?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<boolean>;
  dispatchDirectiveAlert: (title: string, message: string, district: string) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
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
    return DEMO_ACCOUNTS[0]; // Default logged-in active officer for rich demo experience
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState<AuditLogEntry[]>([]);
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aquaground_user', JSON.stringify(currentUser));
      // Load audit logs for logged-in user
      authApi.fetchLoginHistory(currentUser.email).then(setLoginHistory);
    } else {
      localStorage.removeItem('aquaground_user');
    }
  }, [currentUser]);

  const openProfileModal = () => {
    if (currentUser) {
      authApi.fetchLoginHistory(currentUser.email).then(setLoginHistory);
    }
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => setProfileModalOpen(false);

  const registerAccount = async (data: RegisterPayload) => {
    const res = await authApi.register(data);
    
    // Construct pending user object
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CG';
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'officer',
      roleTitle: data.designation,
      designation: data.designation,
      district: data.district,
      department: 'Central Ground Water Board (CGWB)',
      avatar: initials,
      isVerified: false,
      registeredAt: new Date().toISOString(),
    };
    setPendingUser(newUser);

    return res;
  };

  const verifyOTP = async (email: string, code: string, purpose: 'verification' | 'login' | 'reset'): Promise<boolean> => {
    const res = await authApi.verifyOTP({ email, code, purpose });
    if (res.status === 'success') {
      if (purpose === 'verification' && pendingUser) {
        const verifiedUser = { ...pendingUser, isVerified: true };
        setCurrentUser(verifiedUser);
        setPendingUser(null);
      } else if (purpose === 'login' && pendingUser) {
        setCurrentUser(pendingUser);
        setPendingUser(null);
      }
      return true;
    }
    return false;
  };

  const loginAccount = async (email: string, pass: string) => {
    // Check if matching demo account
    const matchedDemo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (matchedDemo) {
      setPendingUser(matchedDemo);
    } else {
      const rawName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim();
      const formattedName = rawName.length > 0 
        ? rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Hydrogeologist Officer';
      
      const newOfficer: UserAccount = {
        id: `usr-${Date.now()}`,
        name: formattedName,
        email: email,
        role: 'officer',
        roleTitle: 'Senior Hydrogeologist',
        designation: 'Senior Hydrogeologist / Regional Scientist',
        district: 'Command Region',
        department: 'Central Ground Water Board (CGWB)',
        avatar: formattedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CG',
        isVerified: true,
        registeredAt: new Date().toISOString(),
      };
      setPendingUser(newOfficer);
    }

    const res = await authApi.login({ email, password: pass });
    return {
      requiresOtp: res.status === 'requires_otp',
      purpose: res.purpose || 'login',
      otp_debug: res.otp_code || res.otp_debug,
      message: res.message
    };
  };

  const quickDemoLogin = (account: UserAccount) => {
    setCurrentUser(account);
  };

  const requestPasswordReset = async (email: string) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    const res = await authApi.resetPassword(email, code, newPass);
    return res.status === 'success';
  };

  const fetchAuditLogs = async () => {
    if (currentUser) {
      const logs = await authApi.fetchLoginHistory(currentUser.email);
      setLoginHistory(logs);
    }
  };

  const dispatchDirectiveAlert = async (title: string, message: string, district: string) => {
    if (!currentUser) return;
    await authApi.dispatchAlert({
      sender_name: currentUser.name,
      title,
      message,
      district,
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aquaground_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      profileModalOpen,
      loginHistory,
      openProfileModal,
      closeProfileModal,
      registerAccount,
      verifyOTP,
      loginAccount,
      quickDemoLogin,
      requestPasswordReset,
      resetPassword,
      dispatchDirectiveAlert,
      fetchAuditLogs,
      logout,
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
