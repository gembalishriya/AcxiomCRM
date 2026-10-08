import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, getVisibleNavItems } from './roleAccess.mjs';

const adminUser = { role: 'Admin' };
const managerUser = { role: 'Manager' };
const salesUser = { role: 'SalesExecutive' };

test('admin can access admin-only routes', () => {
  assert.equal(canAccessRoute(adminUser, ['Admin']), true);
});

test('manager cannot access admin-only route', () => {
  assert.equal(canAccessRoute(managerUser, ['Admin']), false);
});

test('sales user sees only role-allowed navigation items', () => {
  const visible = getVisibleNavItems(salesUser).map((item) => item.to);
  assert.ok(visible.includes('/dashboard'));
  assert.ok(visible.includes('/customers'));
  assert.ok(!visible.includes('/users'));
  assert.ok(!visible.includes('/roles'));
  assert.ok(!visible.includes('/audit-logs'));
});

test('admin sees the roles management page for access control', () => {
  const visible = getVisibleNavItems(adminUser).map((item) => item.to);
  assert.ok(visible.includes('/roles'));
  assert.ok(visible.includes('/users'));
  assert.ok(visible.includes('/audit-logs'));
});
