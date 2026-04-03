import { getApiBaseUrl } from '../config/api';

type MeUser = {
  _id?: string;
  name?: string;
  email?: string;
  picture?: string;
  phone?: string;
  nationalId?: string;
  governorate?: string;
  city?: string;
  role?: string;
};

function apiBase(): string {
  return getApiBaseUrl();
}

export type AuthStatusResponse = {
  adminExists: boolean;
};

export async function getAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch(`${apiBase()}/api/auth/status`);
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { adminExists: true };
    }
    return {
      adminExists: data.adminExists === true,
    };
  } catch {
    return { adminExists: true };
  }
}

export async function bootstrapAdminApi(
  email: string,
  password: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = await authPost('/api/auth/bootstrap-admin', {
      email: String(email || '').trim().toLowerCase(),
      password: String(password || '').trim(),
      confirmPassword: String(confirmPassword || '').trim(),
    });
    return {
      success: payload.success === true,
      message: String(payload.message || 'OK'),
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Bootstrap failed',
    };
  }
}

async function authPost(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    mode: 'cors',
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof data.message === 'string' ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function authGet(path: string, token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    mode: 'cors',
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof data.message === 'string' ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const login = async (data: Record<string, unknown>) => {
  const email = String(data.email || '').trim().toLowerCase();
  const password = String(data.password || '').trim();
  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }
  try {
    const payload =
      data.mode === 'admin'
        ? await authPost('/api/auth/login', { email, password, mode: 'admin' })
        : await authPost('/api/auth/login', { email, password });
    return {
      success: payload.success === true,
      message: String(payload.message || 'OK'),
      token: typeof payload.token === 'string' ? payload.token : undefined,
    };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Login failed' };
  }
};

export const register = async (data: Record<string, unknown>) => {
  const email = String(data.email || '').trim().toLowerCase();
  if (!email) return { success: false, message: 'Email is required' };
  try {
    const payload = await authPost('/api/auth/register', {
      name: String(data.name || '').trim(),
      email,
      password: String(data.password || ''),
      confirmPassword: String(data.confirmPassword || ''),
      nationalId: String(data.nationalId || '').trim(),
      phone: String(data.phone || '').trim(),
      governorate: String(data.governorate || '').trim(),
      city: String(data.city || '').trim(),
    });
    return {
      success: payload.success === true,
      message: String(payload.message || 'Verification code sent to your email.'),
    };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Registration failed' };
  }
};

export const verifyOTP = async (data: Record<string, unknown>) => {
  const otp = String(data.otp || '').replace(/\s+/g, '');
  const email = String(data.email || '').trim().toLowerCase();
  if (!/^\d{6}$/.test(otp)) {
    return { success: false, message: 'Enter a valid 6-digit code' };
  }
  try {
    const payload = await authPost('/api/auth/verify-otp', {
      email,
      otp,
      intent: 'register',
    });
    return {
      success: payload.success === true,
      message: String(payload.message || 'OK'),
      token: typeof payload.token === 'string' ? payload.token : undefined,
    };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Verification failed' };
  }
};

/** OTP email — POST /api/auth/send-otp */
export const sendPasswordResetOtp = async (email: string) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return { success: false, message: 'Email is required' };
  try {
    const data = await authPost('/api/auth/send-otp', { email: normalized });
    return {
      success: data.success === true,
      message: String(data.message || 'Code sent.'),
    };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Request failed' };
  }
};

/** POST /api/auth/verify-otp */
export const verifyPasswordResetOtp = async (email: string, otp: string) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const code = String(otp || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return { success: false, message: 'Enter a valid 6-digit code' };
  }
  try {
    const data = await authPost('/api/auth/verify-otp', {
      email: normalizedEmail,
      otp: code,
      intent: 'password-reset',
    });
    return { success: data.success === true, message: String(data.message || 'Verified') };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Verification failed' };
  }
};

/** POST /api/auth/reset-password */
export const resetPasswordAfterOtp = async (email: string, newPassword: string) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (String(newPassword || '').length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }
  try {
    const data = await authPost('/api/auth/reset-password', {
      email: normalizedEmail,
      newPassword,
    });
    return {
      success: data.success === true,
      message: String(data.message || 'Password updated'),
      token: typeof data.token === 'string' ? data.token : undefined,
    };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Reset failed' };
  }
};

export const getMe = async (token: string) => {
  if (!token) {
    throw new Error('Not authenticated');
  }
  const raw = await authGet('/api/auth/me', token);
  const data = raw.data as
    | {
        user?: MeUser;
        trainings?: unknown[];
        consultations?: unknown[];
        qrCode?: string | null;
      }
    | undefined;
  const u = data?.user;
  if (!u) {
    throw new Error('Invalid profile response');
  }
  return {
    data: {
      user: {
        _id: u._id,
        name: String(u.name || ''),
        email: String(u.email || ''),
        picture: String(u.picture || ''),
        phone: String(u.phone || ''),
        nationalId: String(u.nationalId || ''),
        governorate: String(u.governorate || ''),
        city: String(u.city || ''),
        role: u.role === 'admin' ? 'admin' : 'client',
      },
      trainings: Array.isArray(data?.trainings) ? data.trainings : [],
      consultations: Array.isArray(data?.consultations) ? data.consultations : [],
      qrCode: data?.qrCode ?? null,
    },
  };
};
