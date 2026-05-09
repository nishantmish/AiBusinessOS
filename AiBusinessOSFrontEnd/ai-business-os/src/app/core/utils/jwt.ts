import { AuthUser } from '../models/auth';
import { Role } from '../models';

const ROLE_SET = new Set<Role>([
  'super_admin',
  'org_owner',
  'manager',
  'sales_agent',
  'employee',
  'customer',
  'ai_agent',
]);

export function isJwtExpired(token: string, skewSeconds = 60): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.['exp'];
  if (typeof exp !== 'number') {
    return true;
  }
  return Date.now() / 1000 >= exp - skewSeconds;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickRole(payload: Record<string, unknown>): Role {
  const raw = payload['role'];
  if (typeof raw === 'string' && ROLE_SET.has(raw as Role)) {
    return raw as Role;
  }
  return 'org_owner';
}

export function authUserFromAccessToken(accessToken: string): AuthUser | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  const sub = payload['sub'];
  const email = payload['email'];
  if (typeof sub !== 'string' || typeof email !== 'string') return null;

  const given = typeof payload['given_name'] === 'string' ? payload['given_name'] : '';
  const family = typeof payload['family_name'] === 'string' ? payload['family_name'] : '';
  const tenant = payload['tenant_id'];

  return {
    id: sub,
    email,
    firstName: given,
    lastName: family,
    role: pickRole(payload),
    organizationId: typeof tenant === 'string' ? tenant : '',
    status: 'active',
  };
}

export function authDisplayName(user: AuthUser | null): string {
  if (!user) return 'User';
  const n = `${user.firstName} ${user.lastName}`.trim();
  return n || user.email;
}

export function authInitials(user: AuthUser | null): string {
  if (!user) return '?';
  const n = `${user.firstName} ${user.lastName}`.trim();
  if (n) {
    return n
      .split(/\s+/)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  const e = user.email;
  return e.slice(0, 2).toUpperCase();
}
