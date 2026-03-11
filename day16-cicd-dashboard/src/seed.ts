import db from './database.js';

// Clear existing data
db.exec('DELETE FROM uptime_checks');
db.exec('DELETE FROM deployments');
db.exec('DELETE FROM build_stages');
db.exec('DELETE FROM builds');
db.exec('DELETE FROM pipelines');
db.exec('DELETE FROM projects');

// --- Projects ---
const insertProject = db.prepare(`
  INSERT INTO projects (name, repo_url, default_branch, language, team, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const projects = [
  ['web-app', 'github.com/acme/web-app', 'main', 'TypeScript', 'Frontend', 'active'],
  ['api-server', 'github.com/acme/api-server', 'main', 'Go', 'Backend', 'active'],
  ['mobile-app', 'github.com/acme/mobile-app', 'develop', 'Swift', 'Mobile', 'active'],
  ['data-pipeline', 'github.com/acme/data-pipeline', 'main', 'Python', 'Data', 'active'],
  ['admin-portal', 'github.com/acme/admin-portal', 'main', 'TypeScript', 'Frontend', 'active'],
  ['auth-service', 'github.com/acme/auth-service', 'main', 'Go', 'Platform', 'active'],
  ['landing-page', 'github.com/acme/landing-page', 'main', 'TypeScript', 'Marketing', 'active'],
  ['ml-service', 'github.com/acme/ml-service', 'main', 'Python', 'Data', 'active'],
];

for (const p of projects) {
  insertProject.run(...p);
}

// --- Pipelines ---
const insertPipeline = db.prepare(`
  INSERT INTO pipelines (project_id, name, trigger_type, config_file)
  VALUES (?, ?, ?, ?)
`);

const pipelines = [
  [1, 'CI', 'push', '.github/workflows/ci.yml'],
  [1, 'Deploy Production', 'manual', '.github/workflows/deploy.yml'],
  [2, 'CI', 'push', '.github/workflows/ci.yml'],
  [2, 'Deploy Production', 'tag', '.github/workflows/deploy.yml'],
  [3, 'CI', 'push', '.github/workflows/ci.yml'],
  [3, 'TestFlight', 'manual', '.github/workflows/testflight.yml'],
  [4, 'CI', 'push', '.github/workflows/ci.yml'],
  [5, 'CI', 'push', '.github/workflows/ci.yml'],
  [5, 'Deploy Production', 'manual', '.github/workflows/deploy.yml'],
  [6, 'CI', 'push', '.github/workflows/ci.yml'],
  [6, 'Deploy Production', 'tag', '.github/workflows/deploy.yml'],
  [7, 'CI', 'push', '.github/workflows/ci.yml'],
  [7, 'Deploy Preview', 'pull_request', '.github/workflows/preview.yml'],
  [8, 'CI', 'push', '.github/workflows/ci.yml'],
];

for (const p of pipelines) {
  insertPipeline.run(...p);
}

// --- Builds ---
const insertBuild = db.prepare(`
  INSERT INTO builds (pipeline_id, project_id, branch, commit_sha, commit_message, author, status, started_at, finished_at, duration_seconds, trigger)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const authors = ['ashley', 'marcus', 'elena', 'james', 'priya', 'david'];
const commitMessages = [
  'Fix responsive layout on dashboard',
  'Add user authentication middleware',
  'Update dependencies to latest versions',
  'Refactor database connection pooling',
  'Add rate limiting to API endpoints',
  'Fix memory leak in websocket handler',
  'Update README with deployment guide',
  'Add pagination to list endpoints',
  'Fix CORS headers for staging',
  'Implement caching layer for queries',
  'Add health check endpoint',
  'Fix timezone bug in date formatting',
  'Migrate to new auth provider',
  'Add unit tests for payment module',
  'Optimize image loading pipeline',
  'Fix N+1 query in user listing',
  'Add Sentry error tracking',
  'Update CI config for parallel tests',
  'Fix flaky test in auth flow',
  'Add dark mode support',
];

function randomSha(): string {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 14) + 8); // 8am-10pm
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

// Generate realistic builds over last 14 days
const buildData: Array<{
  pipelineId: number; projectId: number; branch: string; sha: string;
  message: string; author: string; status: string; startedAt: string;
  finishedAt: string | null; duration: number | null; trigger: string;
}> = [];

// web-app CI builds — mostly passing, one recent failure
for (let i = 13; i >= 0; i--) {
  const status = i === 1 ? 'failed' : 'success';
  const dur = 120 + Math.floor(Math.random() * 60);
  const started = randomDate(i);
  const finished = status === 'failed' ? randomDate(i) : started;
  buildData.push({
    pipelineId: 1, projectId: 1, branch: 'main', sha: randomSha(),
    message: commitMessages[i % commitMessages.length], author: authors[i % authors.length],
    status, startedAt: started, finishedAt: finished, duration: dur, trigger: 'push',
  });
}

// api-server CI — stable, all green
for (let i = 10; i >= 0; i--) {
  const dur = 90 + Math.floor(Math.random() * 40);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 3, projectId: 2, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 5) % commitMessages.length], author: authors[(i + 1) % authors.length],
    status: 'success', startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

// mobile-app CI — flaky tests, multiple failures
for (let i = 7; i >= 0; i--) {
  const status = i === 3 || i === 1 || i === 0 ? 'failed' : 'success';
  const dur = 300 + Math.floor(Math.random() * 120);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 5, projectId: 3, branch: 'develop', sha: randomSha(),
    message: commitMessages[(i + 8) % commitMessages.length], author: authors[(i + 2) % authors.length],
    status, startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

// data-pipeline CI — slow builds
for (let i = 6; i >= 0; i--) {
  const dur = 480 + Math.floor(Math.random() * 180);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 7, projectId: 4, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 12) % commitMessages.length], author: authors[(i + 3) % authors.length],
    status: 'success', startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

// admin-portal CI — one running build
for (let i = 5; i >= 0; i--) {
  const status = i === 0 ? 'running' : 'success';
  const dur = i === 0 ? null : 150 + Math.floor(Math.random() * 50);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 8, projectId: 5, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 15) % commitMessages.length], author: authors[(i + 4) % authors.length],
    status, startedAt: started, finishedAt: i === 0 ? null : started, duration: dur, trigger: 'push',
  });
}

// auth-service CI — critical, all green
for (let i = 4; i >= 0; i--) {
  const dur = 75 + Math.floor(Math.random() * 30);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 10, projectId: 6, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 3) % commitMessages.length], author: authors[i % authors.length],
    status: 'success', startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

// landing-page CI — infrequent
for (let i = 12; i >= 0; i -= 4) {
  const dur = 45 + Math.floor(Math.random() * 20);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 12, projectId: 7, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 7) % commitMessages.length], author: 'ashley',
    status: 'success', startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

// ml-service CI — long builds, recent failure
for (let i = 5; i >= 0; i--) {
  const status = i === 0 ? 'failed' : 'success';
  const dur = 600 + Math.floor(Math.random() * 300);
  const started = randomDate(i);
  buildData.push({
    pipelineId: 14, projectId: 8, branch: 'main', sha: randomSha(),
    message: commitMessages[(i + 10) % commitMessages.length], author: authors[(i + 5) % authors.length],
    status, startedAt: started, finishedAt: started, duration: dur, trigger: 'push',
  });
}

for (const b of buildData) {
  insertBuild.run(
    b.pipelineId, b.projectId, b.branch, b.sha,
    b.message, b.author, b.status, b.startedAt,
    b.finishedAt, b.duration, b.trigger,
  );
}

// --- Build Stages ---
const insertStage = db.prepare(`
  INSERT INTO build_stages (build_id, name, status, started_at, finished_at, duration_seconds, log_summary)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const stageNames = ['checkout', 'install', 'lint', 'test', 'build', 'deploy'];

// Add stages for the last few builds of each project
const recentBuilds = db.prepare(`
  SELECT id, status, started_at, duration_seconds FROM builds ORDER BY id DESC LIMIT 20
`).all() as Array<{ id: number; status: string; started_at: string; duration_seconds: number | null }>;

for (const build of recentBuilds) {
  const totalDur = build.duration_seconds || 180;
  const stageCount = build.status === 'failed' ? Math.floor(Math.random() * 3) + 2 : stageNames.length;
  let elapsed = 0;

  for (let i = 0; i < stageCount; i++) {
    const isLast = i === stageCount - 1;
    const stageDur = isLast && build.status === 'failed'
      ? Math.floor(totalDur * 0.1)
      : Math.floor(totalDur / stageNames.length);
    const stageStatus = isLast && build.status === 'failed' ? 'failed' : 'success';
    const logSummary = stageStatus === 'failed'
      ? `Error: ${['Test suite failed (3 failures)', 'Build compilation error', 'Lint errors found (12)', 'OOM killed during test'][Math.floor(Math.random() * 4)]}`
      : null;

    insertStage.run(
      build.id, stageNames[i], stageStatus,
      build.started_at, build.started_at,
      stageDur, logSummary,
    );
    elapsed += stageDur;
  }
}

// --- Deployments ---
const insertDeployment = db.prepare(`
  INSERT INTO deployments (project_id, build_id, environment, status, deployed_at, deployed_by, version, rollback_of)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const deployments = [
  // web-app — regular deploys
  [1, 1, 'production', 'success', randomDate(12), 'ashley', 'v2.14.0', null],
  [1, 5, 'production', 'success', randomDate(8), 'marcus', 'v2.15.0', null],
  [1, 10, 'production', 'success', randomDate(3), 'elena', 'v2.16.0', null],
  [1, 12, 'staging', 'success', randomDate(1), 'james', 'v2.17.0-rc1', null],
  // api-server — stable deploys
  [2, 16, 'production', 'success', randomDate(9), 'priya', 'v3.8.0', null],
  [2, 20, 'production', 'success', randomDate(5), 'marcus', 'v3.9.0', null],
  [2, 24, 'production', 'success', randomDate(1), 'elena', 'v3.10.0', null],
  // auth-service — with a rollback
  [6, 40, 'production', 'success', randomDate(4), 'david', 'v1.12.0', null],
  [6, 42, 'production', 'failed', randomDate(2), 'priya', 'v1.13.0', null],
  [6, 40, 'production', 'success', randomDate(2), 'priya', 'v1.12.0', 9], // rollback
  // admin-portal
  [5, 34, 'production', 'success', randomDate(6), 'ashley', 'v1.5.0', null],
  [5, 37, 'production', 'success', randomDate(2), 'james', 'v1.6.0', null],
  // landing-page — infrequent
  [7, 45, 'production', 'success', randomDate(8), 'ashley', 'v4.1.0', null],
];

for (const d of deployments) {
  insertDeployment.run(...d);
}

// --- Uptime Checks (last 24 hours, every 30 min) ---
const insertUptime = db.prepare(`
  INSERT INTO uptime_checks (project_id, environment, checked_at, status_code, response_time_ms, is_healthy)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const now = new Date();
for (const projectId of [1, 2, 5, 6, 7]) {
  for (let i = 48; i >= 0; i--) {
    const checkTime = new Date(now.getTime() - i * 30 * 60 * 1000);
    const checkedAt = checkTime.toISOString().replace('T', ' ').slice(0, 19);

    // Simulate a brief outage for auth-service 6 hours ago
    const isAuthOutage = projectId === 6 && i >= 10 && i <= 12;
    const statusCode = isAuthOutage ? 503 : 200;
    const responseTime = isAuthOutage ? 5000 : (80 + Math.floor(Math.random() * 120));
    const isHealthy = isAuthOutage ? 0 : 1;

    insertUptime.run(projectId, 'production', checkedAt, statusCode, responseTime, isHealthy);
  }
}

const buildCount = db.prepare('SELECT COUNT(*) as c FROM builds').get() as { c: number };
const deployCount = db.prepare('SELECT COUNT(*) as c FROM deployments').get() as { c: number };
const uptimeCount = db.prepare('SELECT COUNT(*) as c FROM uptime_checks').get() as { c: number };

console.log(`Seeded: 8 projects, 14 pipelines, ${buildCount.c} builds, ${deployCount.c} deployments, ${uptimeCount.c} uptime checks`);
console.log('Ready for CI/CD dashboard queries');
