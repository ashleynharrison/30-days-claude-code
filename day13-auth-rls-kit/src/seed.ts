import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM auth_events;
  DELETE FROM users;
  DELETE FROM role_permissions;
  DELETE FROM rls_policies;
  DELETE FROM permissions;
  DELETE FROM roles;
  DELETE FROM projects;
`);

// ── Projects ────────────────────────────────────────────────────
const insertProject = db.prepare(`INSERT INTO projects (name, description, auth_provider, mfa_enabled, session_lifetime_hours) VALUES (?, ?, ?, ?, ?)`);

const proj1 = insertProject.run('TaskFlow SaaS', 'Project management platform with team workspaces', 'supabase', 1, 8).lastInsertRowid;
const proj2 = insertProject.run('HealthVault Portal', 'Patient health records portal with HIPAA compliance', 'supabase', 1, 2).lastInsertRowid;
const proj3 = insertProject.run('ShopFront Marketplace', 'Multi-vendor e-commerce marketplace', 'supabase', 0, 24).lastInsertRowid;

// ── Roles ────────────────────────────────────────────────────
const insertRole = db.prepare(`INSERT INTO roles (project_id, name, description, is_default, priority) VALUES (?, ?, ?, ?, ?)`);

// TaskFlow roles
const r_tf_owner = insertRole.run(proj1, 'owner', 'Workspace owner with full control', 0, 100).lastInsertRowid;
const r_tf_admin = insertRole.run(proj1, 'admin', 'Workspace admin — manage members and settings', 0, 80).lastInsertRowid;
const r_tf_member = insertRole.run(proj1, 'member', 'Team member — create and manage own tasks', 1, 50).lastInsertRowid;
const r_tf_viewer = insertRole.run(proj1, 'viewer', 'Read-only access to workspace', 0, 10).lastInsertRowid;

// HealthVault roles
const r_hv_admin = insertRole.run(proj2, 'admin', 'System administrator', 0, 100).lastInsertRowid;
const r_hv_doctor = insertRole.run(proj2, 'doctor', 'Physician — view and update patient records', 0, 80).lastInsertRowid;
const r_hv_nurse = insertRole.run(proj2, 'nurse', 'Nurse — view records and update vitals', 0, 60).lastInsertRowid;
const r_hv_patient = insertRole.run(proj2, 'patient', 'Patient — view own records only', 1, 20).lastInsertRowid;

// ShopFront roles
const r_sf_superadmin = insertRole.run(proj3, 'super_admin', 'Platform administrator', 0, 100).lastInsertRowid;
const r_sf_vendor = insertRole.run(proj3, 'vendor', 'Vendor — manage own store and products', 0, 60).lastInsertRowid;
const r_sf_customer = insertRole.run(proj3, 'customer', 'Customer — browse, purchase, review', 1, 20).lastInsertRowid;

// ── Permissions ────────────────────────────────────────────────────
const insertPerm = db.prepare(`INSERT INTO permissions (project_id, resource, action, description) VALUES (?, ?, ?, ?)`);

// TaskFlow permissions
const perms_tf: Record<string, number | bigint> = {};
for (const [res, act, desc] of [
  ['workspaces', 'create', 'Create new workspaces'],
  ['workspaces', 'read', 'View workspace details'],
  ['workspaces', 'update', 'Update workspace settings'],
  ['workspaces', 'delete', 'Delete workspaces'],
  ['tasks', 'create', 'Create tasks'],
  ['tasks', 'read', 'View tasks'],
  ['tasks', 'update', 'Update any task'],
  ['tasks', 'update_own', 'Update own tasks only'],
  ['tasks', 'delete', 'Delete tasks'],
  ['members', 'invite', 'Invite team members'],
  ['members', 'remove', 'Remove team members'],
  ['members', 'manage_roles', 'Change member roles'],
  ['billing', 'view', 'View billing information'],
  ['billing', 'manage', 'Manage billing and subscriptions'],
]) {
  perms_tf[`${res}.${act}`] = insertPerm.run(proj1, res, act, desc).lastInsertRowid;
}

// HealthVault permissions
const perms_hv: Record<string, number | bigint> = {};
for (const [res, act, desc] of [
  ['patients', 'read_all', 'View all patient records'],
  ['patients', 'read_own', 'View own patient record'],
  ['patients', 'create', 'Create patient records'],
  ['patients', 'update', 'Update patient records'],
  ['vitals', 'read', 'View vital signs'],
  ['vitals', 'update', 'Update vital signs'],
  ['prescriptions', 'create', 'Create prescriptions'],
  ['prescriptions', 'read', 'View prescriptions'],
  ['appointments', 'create', 'Schedule appointments'],
  ['appointments', 'read_all', 'View all appointments'],
  ['appointments', 'read_own', 'View own appointments'],
  ['audit_log', 'read', 'View audit trail'],
  ['settings', 'manage', 'Manage system settings'],
]) {
  perms_hv[`${res}.${act}`] = insertPerm.run(proj2, res, act, desc).lastInsertRowid;
}

// ShopFront permissions
const perms_sf: Record<string, number | bigint> = {};
for (const [res, act, desc] of [
  ['products', 'create', 'List new products'],
  ['products', 'read', 'Browse products'],
  ['products', 'update_own', 'Update own products'],
  ['products', 'update_any', 'Update any product (moderation)'],
  ['products', 'delete_own', 'Remove own products'],
  ['orders', 'create', 'Place orders'],
  ['orders', 'read_own', 'View own orders'],
  ['orders', 'read_vendor', 'View orders for own store'],
  ['orders', 'read_all', 'View all platform orders'],
  ['reviews', 'create', 'Write product reviews'],
  ['reviews', 'moderate', 'Moderate reviews'],
  ['stores', 'create', 'Create vendor store'],
  ['stores', 'update_own', 'Update own store settings'],
  ['stores', 'manage_all', 'Manage all stores'],
  ['payouts', 'view_own', 'View own payout history'],
  ['payouts', 'manage', 'Manage all payouts'],
]) {
  perms_sf[`${res}.${act}`] = insertPerm.run(proj3, res, act, desc).lastInsertRowid;
}

// ── Role-Permission Mappings ────────────────────────────────────────
const insertRP = db.prepare(`INSERT INTO role_permissions (role_id, permission_id, conditions) VALUES (?, ?, ?)`);

// TaskFlow: owner gets everything
for (const pid of Object.values(perms_tf)) {
  insertRP.run(r_tf_owner, pid, null);
}
// admin: most things except billing.manage and workspace.delete
for (const [key, pid] of Object.entries(perms_tf)) {
  if (!['billing.manage', 'workspaces.delete'].includes(key)) {
    insertRP.run(r_tf_admin, pid, null);
  }
}
// member: tasks + workspace read
for (const key of ['workspaces.read', 'tasks.create', 'tasks.read', 'tasks.update_own']) {
  insertRP.run(r_tf_member, perms_tf[key], null);
}
// viewer: read only
for (const key of ['workspaces.read', 'tasks.read']) {
  insertRP.run(r_tf_viewer, perms_tf[key], null);
}

// HealthVault: admin gets everything
for (const pid of Object.values(perms_hv)) {
  insertRP.run(r_hv_admin, pid, null);
}
// doctor: patient records, prescriptions, appointments
for (const key of ['patients.read_all', 'patients.update', 'vitals.read', 'vitals.update', 'prescriptions.create', 'prescriptions.read', 'appointments.create', 'appointments.read_all']) {
  insertRP.run(r_hv_doctor, perms_hv[key], null);
}
// nurse: vitals and viewing
for (const key of ['patients.read_all', 'vitals.read', 'vitals.update', 'prescriptions.read', 'appointments.read_all']) {
  insertRP.run(r_hv_nurse, perms_hv[key], null);
}
// patient: own records only
for (const key of ['patients.read_own', 'vitals.read', 'prescriptions.read', 'appointments.read_own']) {
  insertRP.run(r_hv_patient, perms_hv[key], key === 'vitals.read' || key === 'prescriptions.read' ? '{"own_records_only": true}' : null);
}

// ShopFront: super_admin gets everything
for (const pid of Object.values(perms_sf)) {
  insertRP.run(r_sf_superadmin, pid, null);
}
// vendor: own store management
for (const key of ['products.create', 'products.read', 'products.update_own', 'products.delete_own', 'orders.read_vendor', 'stores.create', 'stores.update_own', 'payouts.view_own']) {
  insertRP.run(r_sf_vendor, perms_sf[key], null);
}
// customer: browse and buy
for (const key of ['products.read', 'orders.create', 'orders.read_own', 'reviews.create']) {
  insertRP.run(r_sf_customer, perms_sf[key], null);
}

// ── RLS Policies ────────────────────────────────────────────────────
const insertRLS = db.prepare(`INSERT INTO rls_policies (project_id, table_name, policy_name, operation, role_name, using_expression, check_expression, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// TaskFlow RLS
insertRLS.run(proj1, 'workspaces', 'workspace_members_select', 'SELECT', 'authenticated',
  'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = id AND wm.user_id = auth.uid())',
  null, 'Users can only see workspaces they belong to', 1);
insertRLS.run(proj1, 'workspaces', 'workspace_owner_insert', 'INSERT', 'authenticated',
  null, 'auth.uid() = owner_id', 'Only the creator becomes owner', 1);
insertRLS.run(proj1, 'workspaces', 'workspace_admin_update', 'UPDATE', 'authenticated',
  'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = id AND wm.user_id = auth.uid() AND wm.role IN (\'owner\', \'admin\'))',
  null, 'Only owners and admins can update workspace settings', 1);
insertRLS.run(proj1, 'tasks', 'tasks_workspace_select', 'SELECT', 'authenticated',
  'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid())',
  null, 'Users can see tasks in their workspaces', 1);
insertRLS.run(proj1, 'tasks', 'tasks_member_insert', 'INSERT', 'authenticated',
  null, 'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role != \'viewer\')',
  'Non-viewer members can create tasks', 1);
insertRLS.run(proj1, 'tasks', 'tasks_owner_update', 'UPDATE', 'authenticated',
  'created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN (\'owner\', \'admin\'))',
  null, 'Task creators and workspace admins can update tasks', 1);

// HealthVault RLS (strict HIPAA-style)
insertRLS.run(proj2, 'patients', 'patients_own_select', 'SELECT', 'authenticated',
  'user_id = auth.uid() OR EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.role IN (\'doctor\', \'nurse\', \'admin\'))',
  null, 'Patients see own record; staff see all', 1);
insertRLS.run(proj2, 'patients', 'patients_staff_update', 'UPDATE', 'authenticated',
  'EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.role IN (\'doctor\', \'admin\'))',
  null, 'Only doctors and admins can update patient records', 1);
insertRLS.run(proj2, 'vitals', 'vitals_select', 'SELECT', 'authenticated',
  'EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_id AND (p.user_id = auth.uid() OR EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid())))',
  null, 'Patients see own vitals; all staff can view', 1);
insertRLS.run(proj2, 'vitals', 'vitals_nurse_insert', 'INSERT', 'authenticated',
  null, 'EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.role IN (\'doctor\', \'nurse\'))',
  'Doctors and nurses can record vitals', 1);
insertRLS.run(proj2, 'prescriptions', 'rx_doctor_insert', 'INSERT', 'authenticated',
  null, 'EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.role = \'doctor\')',
  'Only doctors can create prescriptions', 1);
insertRLS.run(proj2, 'audit_log', 'audit_admin_select', 'SELECT', 'authenticated',
  'EXISTS (SELECT 1 FROM staff s WHERE s.user_id = auth.uid() AND s.role = \'admin\')',
  null, 'Only admins can view the audit trail', 1);

// ShopFront RLS
insertRLS.run(proj3, 'products', 'products_public_select', 'SELECT', 'anon',
  'status = \'published\'', null, 'Anyone can browse published products', 1);
insertRLS.run(proj3, 'products', 'products_vendor_insert', 'INSERT', 'authenticated',
  null, 'EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid())',
  'Vendors can only add products to their own store', 1);
insertRLS.run(proj3, 'products', 'products_vendor_update', 'UPDATE', 'authenticated',
  'EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid())',
  null, 'Vendors can only edit their own products', 1);
insertRLS.run(proj3, 'orders', 'orders_customer_select', 'SELECT', 'authenticated',
  'customer_id = auth.uid()', null, 'Customers see only their own orders', 1);
insertRLS.run(proj3, 'orders', 'orders_vendor_select', 'SELECT', 'authenticated',
  'EXISTS (SELECT 1 FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN stores s ON s.id = p.store_id WHERE oi.order_id = id AND s.owner_id = auth.uid())',
  null, 'Vendors see orders containing their products', 1);
insertRLS.run(proj3, 'reviews', 'reviews_public_select', 'SELECT', 'anon',
  'status = \'approved\'', null, 'Anyone can read approved reviews', 1);
insertRLS.run(proj3, 'reviews', 'reviews_customer_insert', 'INSERT', 'authenticated',
  null, 'EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = auth.uid() AND oi.product_id = product_id AND o.status = \'delivered\')',
  'Customers can only review products they purchased', 1);

// ── Users ────────────────────────────────────────────────────
const insertUser = db.prepare(`INSERT INTO users (project_id, email, display_name, role_id, status, mfa_enrolled, last_sign_in) VALUES (?, ?, ?, ?, ?, ?, ?)`);

// TaskFlow users
insertUser.run(proj1, 'sarah@taskflow.io', 'Sarah Chen', r_tf_owner, 'active', 1, '2026-03-07 09:15:00');
insertUser.run(proj1, 'james@taskflow.io', 'James Wilson', r_tf_admin, 'active', 1, '2026-03-07 08:45:00');
insertUser.run(proj1, 'maria@taskflow.io', 'Maria Garcia', r_tf_member, 'active', 0, '2026-03-06 14:30:00');
insertUser.run(proj1, 'alex@contractor.com', 'Alex Rivera', r_tf_viewer, 'active', 0, '2026-03-05 11:00:00');
insertUser.run(proj1, 'deactivated@old.com', 'Former Employee', r_tf_member, 'suspended', 0, '2026-02-15 09:00:00');

// HealthVault users
insertUser.run(proj2, 'admin@healthvault.org', 'System Admin', r_hv_admin, 'active', 1, '2026-03-07 07:00:00');
insertUser.run(proj2, 'dr.patel@healthvault.org', 'Dr. Priya Patel', r_hv_doctor, 'active', 1, '2026-03-07 08:30:00');
insertUser.run(proj2, 'dr.kim@healthvault.org', 'Dr. David Kim', r_hv_doctor, 'active', 1, '2026-03-06 16:00:00');
insertUser.run(proj2, 'nurse.johnson@healthvault.org', 'Nurse Lisa Johnson', r_hv_nurse, 'active', 1, '2026-03-07 06:45:00');
insertUser.run(proj2, 'patient.thompson@gmail.com', 'Robert Thompson', r_hv_patient, 'active', 0, '2026-03-04 10:00:00');
insertUser.run(proj2, 'patient.williams@gmail.com', 'Emily Williams', r_hv_patient, 'active', 0, '2026-03-02 14:30:00');

// ShopFront users
insertUser.run(proj3, 'platform@shopfront.io', 'Platform Admin', r_sf_superadmin, 'active', 1, '2026-03-07 10:00:00');
insertUser.run(proj3, 'artisan@handmade.com', 'Handmade Haven', r_sf_vendor, 'active', 0, '2026-03-07 11:30:00');
insertUser.run(proj3, 'tech@gadgets.com', 'TechGadgets Store', r_sf_vendor, 'active', 0, '2026-03-06 09:15:00');
insertUser.run(proj3, 'buyer@example.com', 'Jane Buyer', r_sf_customer, 'active', 0, '2026-03-07 13:00:00');
insertUser.run(proj3, 'shopper@example.com', 'Mike Shopper', r_sf_customer, 'active', 0, '2026-03-05 17:00:00');

// ── Auth Events ────────────────────────────────────────────────────
const insertEvent = db.prepare(`INSERT INTO auth_events (project_id, user_id, event_type, ip_address, user_agent, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);

// TaskFlow events
insertEvent.run(proj1, 1, 'sign_in', '192.168.1.10', 'Chrome/122 macOS', '{"method": "password", "mfa_verified": true}', '2026-03-07 09:15:00');
insertEvent.run(proj1, 2, 'sign_in', '192.168.1.20', 'Firefox/123 Windows', '{"method": "magic_link", "mfa_verified": true}', '2026-03-07 08:45:00');
insertEvent.run(proj1, 3, 'sign_in', '10.0.0.15', 'Safari/17 macOS', '{"method": "password", "mfa_verified": false}', '2026-03-06 14:30:00');
insertEvent.run(proj1, 5, 'account_suspended', '192.168.1.10', 'Chrome/122 macOS', '{"reason": "employee_departure", "suspended_by": "sarah@taskflow.io"}', '2026-02-15 09:30:00');
insertEvent.run(proj1, 1, 'role_changed', '192.168.1.10', 'Chrome/122 macOS', '{"target_user": "james@taskflow.io", "from": "member", "to": "admin"}', '2026-02-20 11:00:00');
insertEvent.run(proj1, null, 'sign_in_failed', '45.33.32.156', 'Python-requests/2.28', '{"email": "admin@taskflow.io", "reason": "invalid_credentials", "attempt": 3}', '2026-03-06 03:15:00');
insertEvent.run(proj1, null, 'sign_in_failed', '45.33.32.156', 'Python-requests/2.28', '{"email": "admin@taskflow.io", "reason": "rate_limited", "attempt": 6}', '2026-03-06 03:16:00');

// HealthVault events
insertEvent.run(proj2, 6, 'sign_in', '10.10.1.5', 'Chrome/122 macOS', '{"method": "sso", "mfa_verified": true}', '2026-03-07 07:00:00');
insertEvent.run(proj2, 7, 'sign_in', '10.10.1.12', 'Safari/17 iPad', '{"method": "password", "mfa_verified": true}', '2026-03-07 08:30:00');
insertEvent.run(proj2, 7, 'record_accessed', '10.10.1.12', 'Safari/17 iPad', '{"patient_id": 10, "record_type": "vitals", "access_reason": "routine_checkup"}', '2026-03-07 08:35:00');
insertEvent.run(proj2, 9, 'mfa_enrolled', '10.10.2.8', 'Chrome/122 Windows', '{"method": "totp", "enrolled_by": "admin"}', '2026-03-01 10:00:00');
insertEvent.run(proj2, null, 'sign_in_failed', '203.0.113.42', 'curl/8.0', '{"email": "admin@healthvault.org", "reason": "invalid_credentials"}', '2026-03-06 22:45:00');

// ShopFront events
insertEvent.run(proj3, 12, 'sign_in', '172.16.0.100', 'Chrome/122 macOS', '{"method": "google_oauth"}', '2026-03-07 10:00:00');
insertEvent.run(proj3, 13, 'sign_in', '172.16.1.50', 'Firefox/123 Linux', '{"method": "password"}', '2026-03-07 11:30:00');
insertEvent.run(proj3, 15, 'sign_in', '98.45.67.89', 'Safari/17 iPhone', '{"method": "apple_oauth"}', '2026-03-07 13:00:00');
insertEvent.run(proj3, 15, 'password_reset', '98.45.67.89', 'Safari/17 iPhone', '{"method": "email_link"}', '2026-03-03 09:00:00');
insertEvent.run(proj3, 14, 'token_refreshed', '172.16.1.50', 'Firefox/123 Linux', '{"old_token_age_hours": 23}', '2026-03-07 10:30:00');

const projectCount = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c;
const roleCount = (db.prepare('SELECT COUNT(*) as c FROM roles').get() as any).c;
const permCount = (db.prepare('SELECT COUNT(*) as c FROM permissions').get() as any).c;
const rpCount = (db.prepare('SELECT COUNT(*) as c FROM role_permissions').get() as any).c;
const rlsCount = (db.prepare('SELECT COUNT(*) as c FROM rls_policies').get() as any).c;
const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
const eventCount = (db.prepare('SELECT COUNT(*) as c FROM auth_events').get() as any).c;

console.log(`Seeded: ${projectCount} projects, ${roleCount} roles, ${permCount} permissions, ${rpCount} role-permission mappings, ${rlsCount} RLS policies, ${userCount} users, ${eventCount} auth events`);
