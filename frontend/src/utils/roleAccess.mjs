export const ROLE_LEVELS = ['Admin', 'Manager', 'SalesExecutive'];

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/customers', label: 'Customers', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/leads', label: 'Leads', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/opportunities', label: 'Opportunities', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/follow-ups', label: 'Follow-Ups', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/activities', label: 'Activities', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/users', label: 'Users', roles: ['Admin'] },
  { to: '/roles', label: 'Roles', roles: ['Admin'] },
  { to: '/reports', label: 'Reports', roles: ['Admin', 'Manager', 'SalesExecutive'] },
  { to: '/audit-logs', label: 'Audit Logs', roles: ['Admin'] }
];

export function canAccessRoute(user, allowedRoles = []) {
  if (!user) return false;
  if (!allowedRoles.length) return true;
  return allowedRoles.includes(user.role);
}

export function getVisibleNavItems(user) {
  return NAV_ITEMS.filter((item) => canAccessRoute(user, item.roles));
}
