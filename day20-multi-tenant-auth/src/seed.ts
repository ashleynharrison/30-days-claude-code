import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM audit_log;
  DELETE FROM invitations;
  DELETE FROM memberships;
  DELETE FROM role_permissions;
  DELETE FROM permissions;
  DELETE FROM roles;
  DELETE FROM users;
  DELETE FROM organizations;
`);

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}
function hoursAgo(n: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}
function daysFromNow(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

// ── Organizations ────────────────────────────────────────────────────
const insertOrg = db.prepare(`INSERT INTO organizations (name, slug, plan, domain, sso_enabled, mfa_required, max_seats, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

const o1 = insertOrg.run('Acme Corp', 'acme-corp', 'enterprise', 'acme.com', 1, 1, 100, 'active').lastInsertRowid;
const o2 = insertOrg.run('Bright Studio', 'bright-studio', 'business', 'brightstudio.io', 0, 0, 25, 'active').lastInsertRowid;
const o3 = insertOrg.run('CloudNine Labs', 'cloudnine-labs', 'starter', null, 0, 0, 5, 'active').lastInsertRowid;
const o4 = insertOrg.run('Delta Finance', 'delta-finance', 'enterprise', 'deltafinance.com', 1, 1, 50, 'active').lastInsertRowid;
const o5 = insertOrg.run('Ember Health', 'ember-health', 'business', 'emberhealth.co', 0, 1, 15, 'active').lastInsertRowid;
// Edge case: suspended org
const o6 = insertOrg.run('Forge AI', 'forge-ai', 'starter', null, 0, 0, 5, 'suspended').lastInsertRowid;

// ── Permissions ────────────────────────────────────────────────────
const insertPerm = db.prepare(`INSERT INTO permissions (resource, action, description) VALUES (?, ?, ?)`);

const perms: Record<string, number | bigint> = {};
for (const [resource, action, desc] of [
  ['projects', 'read', 'View projects'],
  ['projects', 'write', 'Create and edit projects'],
  ['projects', 'delete', 'Delete projects'],
  ['members', 'read', 'View organization members'],
  ['members', 'invite', 'Invite new members'],
  ['members', 'remove', 'Remove members from org'],
  ['roles', 'read', 'View role configuration'],
  ['roles', 'manage', 'Create and modify roles'],
  ['billing', 'read', 'View billing information'],
  ['billing', 'manage', 'Manage billing and subscriptions'],
  ['settings', 'read', 'View organization settings'],
  ['settings', 'manage', 'Modify organization settings'],
  ['audit_log', 'read', 'View audit log'],
  ['api_keys', 'read', 'View API keys'],
  ['api_keys', 'manage', 'Create and revoke API keys'],
]) {
  perms[`${resource}:${action}`] = insertPerm.run(resource, action, desc).lastInsertRowid;
}

// ── Roles (per-org with hierarchy) ────────────────────────────────
const insertRole = db.prepare(`INSERT INTO roles (org_id, name, hierarchy_level, description, is_default) VALUES (?, ?, ?, ?, ?)`);

// Helper to create standard roles for an org
function createRoles(orgId: number | bigint) {
  const owner = insertRole.run(orgId, 'owner', 100, 'Full access. Can transfer ownership and delete the organization.', 0).lastInsertRowid;
  const admin = insertRole.run(orgId, 'admin', 80, 'Can manage members, roles, billing, and settings. Cannot delete org.', 0).lastInsertRowid;
  const manager = insertRole.run(orgId, 'manager', 60, 'Can manage projects and invite members. Limited settings access.', 0).lastInsertRowid;
  const member = insertRole.run(orgId, 'member', 40, 'Can view and edit projects. No admin access.', 1).lastInsertRowid;
  const viewer = insertRole.run(orgId, 'viewer', 20, 'Read-only access to projects.', 0).lastInsertRowid;
  return { owner, admin, manager, member, viewer };
}

const r1 = createRoles(o1);
const r2 = createRoles(o2);
const r3 = createRoles(o3);
const r4 = createRoles(o4);
const r5 = createRoles(o5);
const r6 = createRoles(o6);

// ── Role Permissions ────────────────────────────────────────────────
const insertRolePerm = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);

function assignPermissions(roles: ReturnType<typeof createRoles>) {
  const allPerms = Object.values(perms);
  // Owner gets everything
  for (const p of allPerms) insertRolePerm.run(roles.owner, p);
  // Admin gets everything except api_keys:manage
  for (const [key, p] of Object.entries(perms)) {
    if (key !== 'api_keys:manage') insertRolePerm.run(roles.admin, p);
  }
  // Manager gets projects:*, members:read, members:invite, roles:read, settings:read
  for (const key of ['projects:read', 'projects:write', 'projects:delete', 'members:read', 'members:invite', 'roles:read', 'settings:read']) {
    insertRolePerm.run(roles.manager, perms[key]);
  }
  // Member gets projects:read, projects:write, members:read
  for (const key of ['projects:read', 'projects:write', 'members:read']) {
    insertRolePerm.run(roles.member, perms[key]);
  }
  // Viewer gets projects:read, members:read
  for (const key of ['projects:read', 'members:read']) {
    insertRolePerm.run(roles.viewer, perms[key]);
  }
}

assignPermissions(r1);
assignPermissions(r2);
assignPermissions(r3);
assignPermissions(r4);
assignPermissions(r5);
assignPermissions(r6);

// ── Users ────────────────────────────────────────────────────
const insertUser = db.prepare(`INSERT INTO users (email, name, avatar_url, mfa_enabled, status) VALUES (?, ?, ?, ?, ?)`);

const u1 = insertUser.run('sarah.chen@acme.com', 'Sarah Chen', null, 1, 'active').lastInsertRowid;
const u2 = insertUser.run('jake.torres@acme.com', 'Jake Torres', null, 1, 'active').lastInsertRowid;
const u3 = insertUser.run('priya.patel@acme.com', 'Priya Patel', null, 1, 'active').lastInsertRowid;
const u4 = insertUser.run('marcus.lee@acme.com', 'Marcus Lee', null, 0, 'active').lastInsertRowid; // Edge case: MFA not enabled in MFA-required org
const u5 = insertUser.run('anna.kim@acme.com', 'Anna Kim', null, 1, 'active').lastInsertRowid;
const u6 = insertUser.run('david.wright@brightstudio.io', 'David Wright', null, 0, 'active').lastInsertRowid;
const u7 = insertUser.run('lena.novak@brightstudio.io', 'Lena Novak', null, 0, 'active').lastInsertRowid;
const u8 = insertUser.run('omar.hassan@brightstudio.io', 'Omar Hassan', null, 1, 'active').lastInsertRowid;
const u9 = insertUser.run('rachel.green@cloudnine.dev', 'Rachel Green', null, 0, 'active').lastInsertRowid;
const u10 = insertUser.run('tom.baker@cloudnine.dev', 'Tom Baker', null, 0, 'active').lastInsertRowid;
const u11 = insertUser.run('nina.shah@deltafinance.com', 'Nina Shah', null, 1, 'active').lastInsertRowid;
const u12 = insertUser.run('carlos.ruiz@deltafinance.com', 'Carlos Ruiz', null, 1, 'active').lastInsertRowid;
const u13 = insertUser.run('mei.lin@deltafinance.com', 'Mei Lin', null, 1, 'active').lastInsertRowid;
const u14 = insertUser.run('alex.foster@deltafinance.com', 'Alex Foster', null, 0, 'active').lastInsertRowid; // Edge case: MFA not enabled
const u15 = insertUser.run('jordan.wells@emberhealth.co', 'Jordan Wells', null, 1, 'active').lastInsertRowid;
const u16 = insertUser.run('sam.murphy@emberhealth.co', 'Sam Murphy', null, 1, 'active').lastInsertRowid;
// Edge case: deactivated user still in memberships
const u17 = insertUser.run('legacy@forge-ai.dev', 'Legacy Admin', null, 0, 'deactivated').lastInsertRowid;
// Edge case: user in multiple orgs
const u18 = insertUser.run('freelancer@gmail.com', 'Casey Freelancer', null, 0, 'active').lastInsertRowid;

// ── Memberships ────────────────────────────────────────────────────
const insertMember = db.prepare(`INSERT INTO memberships (user_id, org_id, role_id, joined_at, last_active_at) VALUES (?, ?, ?, ?, ?)`);

// Acme Corp (enterprise, 5 members)
insertMember.run(u1, o1, r1.owner, daysAgo(180), hoursAgo(1));
insertMember.run(u2, o1, r1.admin, daysAgo(175), hoursAgo(3));
insertMember.run(u3, o1, r1.manager, daysAgo(150), hoursAgo(6));
insertMember.run(u4, o1, r1.member, daysAgo(90), daysAgo(14)); // Edge case: inactive 2 weeks, no MFA
insertMember.run(u5, o1, r1.viewer, daysAgo(30), hoursAgo(2));

// Bright Studio (business, 3 members + freelancer)
insertMember.run(u6, o2, r2.owner, daysAgo(120), hoursAgo(2));
insertMember.run(u7, o2, r2.admin, daysAgo(110), hoursAgo(8));
insertMember.run(u8, o2, r2.member, daysAgo(60), daysAgo(1));
insertMember.run(u18, o2, r2.viewer, daysAgo(20), daysAgo(5)); // Freelancer cross-org

// CloudNine Labs (starter, 2 members + freelancer)
insertMember.run(u9, o3, r3.owner, daysAgo(45), hoursAgo(4));
insertMember.run(u10, o3, r3.member, daysAgo(40), daysAgo(3));
insertMember.run(u18, o3, r3.member, daysAgo(15), daysAgo(2)); // Freelancer cross-org

// Delta Finance (enterprise, 4 members)
insertMember.run(u11, o4, r4.owner, daysAgo(200), hoursAgo(1));
insertMember.run(u12, o4, r4.admin, daysAgo(195), hoursAgo(5));
insertMember.run(u13, o4, r4.manager, daysAgo(160), hoursAgo(12));
insertMember.run(u14, o4, r4.member, daysAgo(30), daysAgo(7)); // Edge case: no MFA in MFA-required org

// Ember Health (business, 2 members)
insertMember.run(u15, o5, r5.owner, daysAgo(90), hoursAgo(3));
insertMember.run(u16, o5, r5.admin, daysAgo(85), hoursAgo(10));

// Forge AI (suspended org, 1 deactivated user)
insertMember.run(u17, o6, r6.owner, daysAgo(300), daysAgo(60));

// ── Invitations ────────────────────────────────────────────────────
const insertInvite = db.prepare(`INSERT INTO invitations (org_id, email, role_id, invited_by, status, token, expires_at, accepted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Pending invites
insertInvite.run(o1, 'new.hire@acme.com', r1.member, u1, 'pending', 'tok_acme_001', daysFromNow(5), null, daysAgo(2));
insertInvite.run(o1, 'contractor@external.com', r1.viewer, u2, 'pending', 'tok_acme_002', daysFromNow(3), null, daysAgo(4));
insertInvite.run(o2, 'designer@freelance.com', r2.member, u6, 'pending', 'tok_bright_001', daysFromNow(7), null, daysAgo(1));

// Accepted invites
insertInvite.run(o1, 'anna.kim@acme.com', r1.viewer, u1, 'accepted', 'tok_acme_003', daysAgo(23), daysAgo(28), daysAgo(30));
insertInvite.run(o2, 'omar.hassan@brightstudio.io', r2.member, u6, 'accepted', 'tok_bright_002', daysAgo(55), daysAgo(58), daysAgo(60));

// Expired invites (edge case)
insertInvite.run(o1, 'ghosted@example.com', r1.member, u2, 'expired', 'tok_acme_004', daysAgo(10), null, daysAgo(17));
insertInvite.run(o4, 'no.response@email.com', r4.viewer, u11, 'expired', 'tok_delta_001', daysAgo(3), null, daysAgo(10));

// Revoked invite (edge case)
insertInvite.run(o2, 'wrong.person@email.com', r2.admin, u6, 'revoked', 'tok_bright_003', daysAgo(5), null, daysAgo(12));

// ── Audit Log ────────────────────────────────────────────────────
const insertAudit = db.prepare(`INSERT INTO audit_log (org_id, user_id, action, resource, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`);

// Acme Corp audit trail
insertAudit.run(o1, u1, 'login', 'session', 'SSO login via Okta', '10.0.1.50', hoursAgo(1));
insertAudit.run(o1, u2, 'login', 'session', 'SSO login via Okta', '10.0.1.51', hoursAgo(3));
insertAudit.run(o1, u1, 'invite.create', 'invitation', 'Invited new.hire@acme.com as member', '10.0.1.50', daysAgo(2));
insertAudit.run(o1, u2, 'invite.create', 'invitation', 'Invited contractor@external.com as viewer', '10.0.1.51', daysAgo(4));
insertAudit.run(o1, u1, 'role.change', 'membership', 'Changed Priya Patel from member to manager', '10.0.1.50', daysAgo(10));
insertAudit.run(o1, u3, 'project.create', 'project', 'Created project: Q1 Platform Redesign', '10.0.1.52', daysAgo(7));
insertAudit.run(o1, u4, 'login', 'session', 'Password login — MFA not configured', '192.168.1.100', daysAgo(14));
insertAudit.run(o1, u1, 'settings.update', 'organization', 'Enabled MFA requirement for all members', '10.0.1.50', daysAgo(15));
insertAudit.run(o1, u2, 'invite.expire', 'invitation', 'Invitation to ghosted@example.com expired', null, daysAgo(10));
insertAudit.run(o1, u5, 'login', 'session', 'SSO login via Okta', '10.0.1.53', hoursAgo(2));

// Delta Finance audit trail
insertAudit.run(o4, u11, 'login', 'session', 'SSO login via Azure AD', '172.16.0.10', hoursAgo(1));
insertAudit.run(o4, u12, 'login', 'session', 'SSO login via Azure AD', '172.16.0.11', hoursAgo(5));
insertAudit.run(o4, u14, 'login.failed', 'session', 'MFA challenge failed — authenticator not set up', '203.0.113.45', daysAgo(7));
insertAudit.run(o4, u14, 'login', 'session', 'Password login — MFA bypassed (grace period)', '203.0.113.45', daysAgo(7));
insertAudit.run(o4, u11, 'api_key.create', 'api_key', 'Created production API key: pk_live_***', '172.16.0.10', daysAgo(20));
insertAudit.run(o4, u12, 'member.remove', 'membership', 'Removed intern@deltafinance.com from org', '172.16.0.11', daysAgo(25));

// Bright Studio audit trail
insertAudit.run(o2, u6, 'login', 'session', 'Password login', '192.168.10.1', hoursAgo(2));
insertAudit.run(o2, u6, 'invite.create', 'invitation', 'Invited designer@freelance.com as member', '192.168.10.1', daysAgo(1));
insertAudit.run(o2, u6, 'invite.revoke', 'invitation', 'Revoked invitation for wrong.person@email.com', '192.168.10.1', daysAgo(5));
insertAudit.run(o2, u7, 'settings.update', 'organization', 'Updated billing plan from starter to business', '192.168.10.2', daysAgo(30));

// CloudNine Labs
insertAudit.run(o3, u9, 'login', 'session', 'Password login', '73.42.18.200', hoursAgo(4));
insertAudit.run(o3, u9, 'member.add', 'membership', 'Added freelancer@gmail.com as member', '73.42.18.200', daysAgo(15));

// Ember Health
insertAudit.run(o5, u15, 'login', 'session', 'Password login with MFA', '10.10.10.1', hoursAgo(3));
insertAudit.run(o5, u15, 'settings.update', 'organization', 'Enabled MFA requirement', '10.10.10.1', daysAgo(30));

// Edge case: suspended org login attempt
insertAudit.run(o6, u17, 'login.blocked', 'session', 'Login blocked — organization suspended', '198.51.100.1', daysAgo(30));

// Count and log
const orgCount = (db.prepare('SELECT COUNT(*) as c FROM organizations').get() as any).c;
const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
const memberCount = (db.prepare('SELECT COUNT(*) as c FROM memberships').get() as any).c;
const roleCount = (db.prepare('SELECT COUNT(*) as c FROM roles').get() as any).c;
const permCount = (db.prepare('SELECT COUNT(*) as c FROM permissions').get() as any).c;
const inviteCount = (db.prepare('SELECT COUNT(*) as c FROM invitations').get() as any).c;
const auditCount = (db.prepare('SELECT COUNT(*) as c FROM audit_log').get() as any).c;

console.log(`Seeded: ${orgCount} orgs, ${userCount} users, ${memberCount} memberships, ${roleCount} roles, ${permCount} permissions, ${inviteCount} invitations, ${auditCount} audit events`);
