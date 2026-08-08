import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, UserCheck, MapPin, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '@/contexts/AuthContext';
import type { UserAccount } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const LOGIN_POSITIONS = [
  { id: 'nodal_admin', label: 'Nodal Officer / System Administrator', role: 'admin' as const },
  { id: 'regional_director', label: 'Regional Director / Divisional Head', role: 'admin' as const },
  { id: 'senior_hydrogeologist', label: 'Senior Hydrogeologist / Regional Scientist', role: 'officer' as const },
  { id: 'junior_hydrogeologist', label: 'Junior Hydrogeologist / Assistant Chemist', role: 'officer' as const },
  { id: 'vendor_engineer', label: 'Third-Party Vendor Engineer / Maintenance Officer', role: 'analyst' as const },
  { id: 'citizen_farmer', label: 'Citizen / Farmer (Public Viewer)', role: 'viewer' as const },
];

type LoginMode = 'signin' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password_otp';

export const Login: React.FC = () => {
  const { loginAccount, registerAccount, verifyOTP, requestPasswordReset, resetPassword, quickDemoLogin } = useAuth();
  const { t } = useLanguage();
  
  const [mode, setMode] = useState<LoginMode>('signin');

  // Sign In / Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('senior_hydrogeologist');
  
  // Account Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDesignation, setRegDesignation] = useState('Senior Hydrogeologist / Regional Scientist');
  const [regDistrict, setRegDistrict] = useState('Jaipur & Jodhpur Basin');

  // OTP Verification Fields
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'verification' | 'login' | 'reset'>('verification');
  const [otpDebugHint, setOtpDebugHint] = useState<string | null>(null);
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [countdown, setCountdown] = useState(60);

  // Reset Password Fields
  const [newPassword, setNewPassword] = useState('');

  // Status & Feedback UI
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Countdown timer effect
  useEffect(() => {
    let timer: any;
    if ((mode === 'otp_verify' || mode === 'reset_password_otp') && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  const clearFeedback = () => {
    setError('');
    setSuccessMsg('');
  };

  // ── Handler: Sign In Submit ───────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!email) {
      setError('Please enter your official CGWB email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAccount(email, password);
      if (res.requiresOtp) {
        setOtpTargetEmail(email);
        setOtpPurpose(res.purpose as any || 'login');
        setOtpDebugHint(res.otp_debug || '849201');
        setCountdown(60);
        setSuccessMsg(res.message || 'OTP verification code sent to your official email.');
        setMode('otp_verify');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler: Register Account Submit ─────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!regName || !regEmail || !regPassword || !regDistrict) {
      setError('Please complete all registration fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerAccount({
        name: regName,
        email: regEmail,
        password: regPassword,
        designation: regDesignation,
        district: regDistrict,
      });

      setOtpTargetEmail(regEmail);
      setOtpPurpose('verification');
      setOtpDebugHint(res.otp_debug || '849201');
      setCountdown(60);
      setSuccessMsg('Account registered successfully! OTP email verification code sent to your email.');
      setMode('otp_verify');
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler: Verify OTP Submit ────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOTP(otpTargetEmail, otpCode, otpPurpose);
      if (success) {
        setSuccessMsg('OTP Verified successfully! Accessing AquaGround AI Command Center...');
      } else {
        setError('Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler: Forgot Password Email Submit ──────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!email) {
      setError('Please enter your official registered email.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setOtpTargetEmail(email);
      setOtpDebugHint(res.otp_debug || '849201');
      setCountdown(60);
      setSuccessMsg('Password reset OTP sent to your official email.');
      setMode('reset_password_otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler: Reset Password OTP Submit ─────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!otpCode || otpCode.length !== 6 || !newPassword) {
      setError('Please provide the 6-digit OTP and enter a new password.');
      return;
    }

    setLoading(true);
    try {
      const success = await resetPassword(otpTargetEmail, otpCode, newPassword);
      if (success) {
        setSuccessMsg('Password updated successfully! Please sign in with your new password.');
        setMode('signin');
        setPassword(newPassword);
      } else {
        setError('Password reset failed. Invalid OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #090D16 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        padding: '36px 32px',
        border: '1px solid #E2E8F0'
      }}>

        {/* Govt / CGWB Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 12px rgba(37,99,235,0.15)'
          }}>
            <ShieldCheck size={30} color="#2563EB" />
          </div>
          <h1 style={{ fontSize: '21px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            AquaGround AI Command Center
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', margin: 0 }}>
            Central Ground Water Board • Ministry of Jal Shakti
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            marginBottom: '18px',
            padding: '12px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '12.5px',
            fontWeight: 600
          }}>
            ❌ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            marginBottom: '18px',
            padding: '12px 14px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            color: '#059669',
            fontSize: '12.5px',
            fontWeight: 600
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* ── MODE 1: SIGN IN FORM ────────────────────────────────────────── */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Official CGWB Email / User ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anand.verma@cgwb.gov.in"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                  color: '#0F172A', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { clearFeedback(); setMode('forgot_password'); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                    borderRadius: '8px', padding: '10px 38px 10px 14px', fontSize: '13px',
                    color: '#0F172A', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Official Designation Scope
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px',
                  color: '#0F172A', fontWeight: 600, outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                }}
              >
                {LOGIN_POSITIONS.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', marginTop: '4px'
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with OTP Authorization'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Switch to Register */}
            <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>New CGWB Hydrogeologist Officer? </span>
              <button
                type="button"
                onClick={() => { clearFeedback(); setMode('register'); }}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Verified Account
              </button>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                ⚡ Quick Demo Officer Access
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => quickDemoLogin(acc)}
                    style={{
                      background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px',
                      padding: '6px 8px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s'
                    }}
                  >
                    <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{acc.name}</p>
                    <p style={{ fontSize: '10px', color: '#64748B', margin: '1px 0 0 0' }}>{acc.roleTitle}</p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* ── MODE 2: CREATE ACCOUNT (REGISTER) ────────────────────────────── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => { clearFeedback(); setMode('signin'); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex' }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Register New Officer Account
              </h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Dr. Vikram Sarabhai"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '9px 12px', fontSize: '12.5px',
                  color: '#0F172A', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Official Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="vikram.sarabhai@cgwb.gov.in"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '9px 12px', fontSize: '12.5px',
                  color: '#0F172A', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Account Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '9px 12px', fontSize: '12.5px',
                  color: '#0F172A', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Official Designation
              </label>
              <select
                value={regDesignation}
                onChange={(e) => setRegDesignation(e.target.value)}
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '9px 12px', fontSize: '12px',
                  color: '#0F172A', fontWeight: 600, outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                }}
              >
                {LOGIN_POSITIONS.map(p => (
                  <option key={p.id} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                District Jurisdiction / Command Area
              </label>
              <input
                type="text"
                value={regDistrict}
                onChange={(e) => setRegDistrict(e.target.value)}
                placeholder="e.g. Jodhpur, Rajasthan"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '9px 12px', fontSize: '12.5px',
                  color: '#0F172A', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', padding: '11px', fontSize: '13.5px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', marginTop: '6px'
              }}
            >
              <span>{loading ? 'Sending OTP Verification...' : 'Register & Send OTP Email'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── MODE 3: OTP VERIFICATION STEP ────────────────────────────────── */}
        {mode === 'otp_verify' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                Enter 6-Digit Email OTP
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                Verification code sent to <strong>{otpTargetEmail}</strong>
              </p>
            </div>

            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px',
              padding: '12px 14px', textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Mail size={16} />
                Email OTP Dispatched
              </span>
              <p style={{ fontSize: '11.5px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: 500 }}>
                Verification code dispatched for <strong>{otpTargetEmail}</strong>.
              </p>
            </div>

            {otpDebugHint && (
              <div style={{
                background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px',
                padding: '10px 14px', textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', margin: 0 }}>
                  ⚡ Verification OTP Code: <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '2px', background: '#FDE68A', padding: '2px 8px', borderRadius: '4px', color: '#78350F' }}>{otpDebugHint}</span>
                </p>
                <p style={{ fontSize: '10.5px', color: '#B45309', margin: '4px 0 6px 0' }}>
                  (Add Gmail SMTP credentials in <code>.env</code> to deliver directly to your actual Gmail inbox)
                </p>
                <button
                  type="button"
                  onClick={() => setOtpCode(otpDebugHint)}
                  style={{
                    background: '#D97706', color: '#FFFFFF', border: 'none', padding: '5px 12px',
                    borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217,119,6,0.3)'
                  }}
                >
                  Auto-Fill {otpDebugHint}
                </button>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'center' }}>
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={otpDebugHint || "849201"}
                style={{
                  width: '100%', background: '#F8FAFC', border: '2px solid #2563EB',
                  borderRadius: '10px', padding: '12px', fontSize: '22px', fontWeight: 800,
                  color: '#0F172A', letterSpacing: '8px', textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Confirm Account'}</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
              <span>Resend code in: <strong>{countdown}s</strong></span>
              <button
                type="button"
                disabled={countdown > 0}
                onClick={() => { setCountdown(60); setSuccessMsg('New OTP code sent to your email.'); }}
                style={{
                  background: 'none', border: 'none', color: countdown > 0 ? '#94A3B8' : '#2563EB',
                  fontWeight: 700, cursor: countdown > 0 ? 'default' : 'pointer'
                }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ── MODE 4: FORGOT PASSWORD ──────────────────────────────────────── */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => { clearFeedback(); setMode('signin'); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex' }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Reset Official Password
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
              Enter your registered official email. We will send a 6-digit OTP code to reset your password.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Registered Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anand.verma@cgwb.gov.in"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                  color: '#0F172A', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              <span>{loading ? 'Sending Reset Code...' : 'Send Password Reset OTP'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── MODE 5: RESET PASSWORD WITH OTP ─────────────────────────────── */}
        {mode === 'reset_password_otp' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                Set New Officer Password
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                Enter the OTP sent to <strong>{otpTargetEmail}</strong> and your new password
              </p>
            </div>

            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px',
              padding: '10px 12px', textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8' }}>
                🔑 Check Your Email Inbox for Reset Code
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                6-Digit Reset OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="849201"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '10px', fontSize: '16px', fontWeight: 800,
                  color: '#0F172A', letterSpacing: '4px', textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                  color: '#0F172A', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              <KeyRound size={16} />
              <span>{loading ? 'Updating Password...' : 'Reset Password & Sign In'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
