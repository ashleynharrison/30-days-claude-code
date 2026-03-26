import db from './database.js';

// Clear existing data
db.exec('DELETE FROM forecasts');
db.exec('DELETE FROM anomalies');
db.exec('DELETE FROM budgets');
db.exec('DELETE FROM cost_records');
db.exec('DELETE FROM services');
db.exec('DELETE FROM providers');

// --- Providers ---
const insertProvider = db.prepare('INSERT INTO providers (name, slug, monthly_budget) VALUES (?, ?, ?)');
insertProvider.run('Amazon Web Services', 'aws', 8500);
insertProvider.run('Google Cloud Platform', 'gcp', 3200);
insertProvider.run('Microsoft Azure', 'azure', 2800);
insertProvider.run('Vercel', 'vercel', 420);

// --- Services ---
const insertService = db.prepare('INSERT INTO services (provider_id, name, category, description) VALUES (?, ?, ?, ?)');

// AWS services (provider_id = 1)
insertService.run(1, 'EC2 Instances', 'compute', 'Virtual servers for application workloads');
insertService.run(1, 'RDS PostgreSQL', 'database', 'Managed PostgreSQL databases');
insertService.run(1, 'S3 Storage', 'storage', 'Object storage for assets and backups');
insertService.run(1, 'CloudFront CDN', 'network', 'Content delivery network');
insertService.run(1, 'Lambda Functions', 'compute', 'Serverless function execution');
insertService.run(1, 'ECS Fargate', 'compute', 'Containerized workloads');
insertService.run(1, 'ElastiCache Redis', 'database', 'In-memory caching layer');
insertService.run(1, 'Route 53', 'network', 'DNS management');

// GCP services (provider_id = 2)
insertService.run(2, 'Cloud Run', 'compute', 'Serverless container platform');
insertService.run(2, 'Cloud SQL', 'database', 'Managed PostgreSQL on GCP');
insertService.run(2, 'BigQuery', 'analytics', 'Data warehouse and analytics');
insertService.run(2, 'Cloud Storage', 'storage', 'Object storage');
insertService.run(2, 'Pub/Sub', 'messaging', 'Event streaming and messaging');

// Azure services (provider_id = 3)
insertService.run(3, 'App Service', 'compute', 'Managed web application hosting');
insertService.run(3, 'Cosmos DB', 'database', 'Globally distributed database');
insertService.run(3, 'Blob Storage', 'storage', 'Object storage');
insertService.run(3, 'Azure Functions', 'compute', 'Serverless functions');
insertService.run(3, 'Azure AI Services', 'ai', 'Cognitive services and AI APIs');

// Vercel services (provider_id = 4)
insertService.run(4, 'Edge Functions', 'compute', 'Edge-deployed serverless functions');
insertService.run(4, 'Bandwidth', 'network', 'CDN and data transfer');
insertService.run(4, 'Build Minutes', 'compute', 'CI/CD build execution');

// --- Cost Records (90 days of daily data) ---
const insertCost = db.prepare('INSERT INTO cost_records (service_id, date, amount, usage_quantity, usage_unit) VALUES (?, ?, ?, ?, ?)');

function generateDailyCosts(serviceId: number, baseAmount: number, variance: number, unit: string, baseUsage: number, usageVariance: number, trend: number = 0) {
  const today = new Date('2026-03-26');
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTrend = trend * (90 - i) / 90;
    const amount = Math.max(0, baseAmount + dayTrend + (Math.random() - 0.5) * variance * 2);
    const usage = Math.max(0, baseUsage + (Math.random() - 0.5) * usageVariance * 2);
    insertCost.run(serviceId, dateStr, Math.round(amount * 100) / 100, Math.round(usage * 10) / 10, unit);
  }
}

// AWS costs
generateDailyCosts(1, 95, 15, 'instance-hours', 720, 50, 20);    // EC2 — trending up
generateDailyCosts(2, 42, 5, 'instance-hours', 48, 5, 0);        // RDS
generateDailyCosts(3, 18, 4, 'GB-stored', 2400, 200, 5);         // S3
generateDailyCosts(4, 12, 3, 'TB-transferred', 8.5, 2, 0);       // CloudFront
generateDailyCosts(5, 8, 3, 'invocations-M', 4.2, 1.5, 3);      // Lambda — trending up
generateDailyCosts(6, 65, 10, 'vCPU-hours', 480, 40, 0);         // ECS Fargate
generateDailyCosts(7, 28, 3, 'node-hours', 48, 2, 0);            // ElastiCache
generateDailyCosts(8, 2.5, 0.5, 'queries-M', 12, 3, 0);         // Route 53

// GCP costs
generateDailyCosts(9, 35, 8, 'vCPU-seconds-M', 2.1, 0.5, 8);    // Cloud Run — trending up
generateDailyCosts(10, 22, 4, 'instance-hours', 24, 3, 0);       // Cloud SQL
generateDailyCosts(11, 38, 10, 'TB-scanned', 6.2, 2, 5);         // BigQuery — trending up
generateDailyCosts(12, 6, 2, 'GB-stored', 850, 100, 0);          // Cloud Storage
generateDailyCosts(13, 3, 1, 'messages-M', 8.5, 3, 0);           // Pub/Sub

// Azure costs
generateDailyCosts(14, 32, 6, 'instance-hours', 360, 30, 0);     // App Service
generateDailyCosts(15, 28, 5, 'RU-hours-K', 400, 50, 10);        // Cosmos DB — trending up
generateDailyCosts(16, 5, 1.5, 'GB-stored', 620, 80, 0);         // Blob Storage
generateDailyCosts(17, 4, 1.5, 'executions-M', 1.8, 0.5, 0);    // Azure Functions
generateDailyCosts(18, 22, 6, 'API-calls-K', 45, 15, 12);        // AI Services — trending up

// Vercel costs
generateDailyCosts(19, 6, 2, 'invocations-M', 3.2, 1, 0);       // Edge Functions
generateDailyCosts(20, 5, 1.5, 'TB-transferred', 2.8, 0.8, 0);  // Bandwidth
generateDailyCosts(21, 3, 1, 'minutes', 1200, 300, 0);           // Build Minutes

// --- Budgets (last 3 months) ---
const insertBudget = db.prepare('INSERT INTO budgets (provider_id, month, budget, actual, forecast) VALUES (?, ?, ?, ?, ?)');

// January
insertBudget.run(1, '2026-01', 8500, 7920, 8100);
insertBudget.run(2, '2026-01', 3200, 2980, 3050);
insertBudget.run(3, '2026-01', 2800, 2640, 2700);
insertBudget.run(4, '2026-01', 420, 385, 400);

// February
insertBudget.run(1, '2026-02', 8500, 8340, 8500);
insertBudget.run(2, '2026-02', 3200, 3180, 3250);
insertBudget.run(3, '2026-02', 2800, 2780, 2850);
insertBudget.run(4, '2026-02', 420, 410, 420);

// March (in progress)
insertBudget.run(1, '2026-03', 8500, 7200, 8850);
insertBudget.run(2, '2026-03', 3200, 2900, 3450);
insertBudget.run(3, '2026-03', 2800, 2500, 2980);
insertBudget.run(4, '2026-03', 420, 370, 440);

// --- Anomalies ---
const insertAnomaly = db.prepare('INSERT INTO anomalies (service_id, date, expected_amount, actual_amount, deviation_pct, severity, resolved, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

insertAnomaly.run(1, '2026-03-12', 98, 185, 88.8, 'high', 1, 'Auto-scaling triggered by load test — 14 extra instances spun up');
insertAnomaly.run(11, '2026-03-15', 40, 112, 180.0, 'critical', 0, 'Unpartitioned query scanned full 6TB dataset — needs query optimization');
insertAnomaly.run(18, '2026-03-18', 24, 68, 183.3, 'high', 0, 'New AI feature drove 3x API call volume — review rate limiting');
insertAnomaly.run(5, '2026-03-20', 10, 28, 180.0, 'medium', 1, 'Recursive Lambda invocation from misconfigured trigger — fixed');
insertAnomaly.run(15, '2026-03-22', 30, 52, 73.3, 'medium', 0, 'Cosmos DB RU consumption spiking — possible missing index');
insertAnomaly.run(6, '2026-03-24', 68, 142, 108.8, 'high', 0, 'ECS task count doubled after deploy — health check misconfiguration');
insertAnomaly.run(9, '2026-03-25', 38, 72, 89.5, 'medium', 0, 'Cloud Run cold starts increased after region expansion');

// --- Forecasts (next 3 months) ---
const insertForecast = db.prepare('INSERT INTO forecasts (provider_id, month, predicted_amount, confidence_low, confidence_high, method) VALUES (?, ?, ?, ?, ?, ?)');

// April forecasts
insertForecast.run(1, '2026-04', 9100, 8600, 9600, 'linear_trend');
insertForecast.run(2, '2026-04', 3500, 3200, 3800, 'linear_trend');
insertForecast.run(3, '2026-04', 3050, 2750, 3350, 'linear_trend');
insertForecast.run(4, '2026-04', 450, 400, 500, 'linear_trend');

// May forecasts
insertForecast.run(1, '2026-05', 9450, 8800, 10100, 'linear_trend');
insertForecast.run(2, '2026-05', 3700, 3300, 4100, 'linear_trend');
insertForecast.run(3, '2026-05', 3200, 2850, 3550, 'linear_trend');
insertForecast.run(4, '2026-05', 470, 410, 530, 'linear_trend');

// June forecasts
insertForecast.run(1, '2026-06', 9800, 9000, 10600, 'linear_trend');
insertForecast.run(2, '2026-06', 3900, 3400, 4400, 'linear_trend');
insertForecast.run(3, '2026-06', 3350, 2950, 3750, 'linear_trend');
insertForecast.run(4, '2026-06', 490, 420, 560, 'linear_trend');

console.log('Seeded infrastructure cost tracker database:');
console.log('  4 providers');
console.log('  21 services');
console.log('  ~1,890 daily cost records (90 days × 21 services)');
console.log('  12 budget entries (3 months × 4 providers)');
console.log('  7 anomalies');
console.log('  12 forecasts (3 months × 4 providers)');
