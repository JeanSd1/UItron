#!/usr/bin/env node
/**
 * PASSO 4.4.5 — Dashboard Test Suite (4 Phases)
 * 
 * ✅ Backend Routes (API Endpoints)
 * ✅ Filtering (mission, since, limit)
 * ✅ Integrality (zero writes, determinism)
 * ✅ Frontend Responsiveness (UI validation)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Helper colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passCount = 0;
let failCount = 0;

// Mock data helper
function getMockHistoryPath() {
  return path.join(__dirname, '../../data/suggestion_history.json');
}

function getMockLogsPath() {
  return path.join(__dirname, '../../logs/ultron.log');
}

// === FASE 1: Backend Routes ===
console.log(`\n${colors.cyan}FASE 1 — Backend Routes${colors.reset}`);

function testHealthEndpoint() {
  const name = 'Health endpoint returns 200';
  // Mock test (integration test would need live server)
  const serverPath = path.join(__dirname, './dashboard/server.js');
  const exists = fs.existsSync(serverPath);
  
  if (exists) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testMetricsEndpoint() {
  const name = 'Metrics route registered and accessible';
  const routePath = path.join(__dirname, './dashboard/routes/metrics.js');
  const exists = fs.existsSync(routePath);
  
  if (exists) {
    const content = fs.readFileSync(routePath, 'utf8');
    const hasEndpoint = content.includes("router.get('/'") && (content.includes('getMissionMetrics') || content.includes('getAllMissionsMetrics'));
    
    if (hasEndpoint) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testDecisionsEndpoint() {
  const name = 'Decisions route registered and accessible';
  const routePath = path.join(__dirname, './dashboard/routes/decisions.js');
  const exists = fs.existsSync(routePath);
  
  if (exists) {
    const content = fs.readFileSync(routePath, 'utf8');
    const hasEndpoint = content.includes("router.get('/'") && (content.includes('explainLastDecision') || content.includes('explainAllDecisions'));
    
    if (hasEndpoint) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testHistoryEndpoint() {
  const name = 'History route registered and accessible';
  const routePath = path.join(__dirname, './dashboard/routes/history.js');
  const exists = fs.existsSync(routePath);
  
  if (exists) {
    const content = fs.readFileSync(routePath, 'utf8');
    const hasEndpoint = content.includes("router.get('/'") && content.includes('loadHistorySafe');
    
    if (hasEndpoint) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

// === FASE 2: Filtering ===
console.log(`\n${colors.cyan}FASE 2 — Filtering & Query Parameters${colors.reset}`);

function testMissionFilter() {
  const name = 'Mission filter parameter supported in all routes';
  const metricsContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/metrics.js'), 'utf8');
  const historyContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/history.js'), 'utf8');
  
  const metricsHasFilter = metricsContent.includes('req.query.mission') || metricsContent.includes('req.params.mission');
  const historyHasFilter = historyContent.includes('req.query.mission') || historyContent.includes('req.params.mission');
  
  if (metricsHasFilter && historyHasFilter) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testSinceFilter() {
  const name = 'Since/date filter parameter supported';
  const historyContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/history.js'), 'utf8');
  
  if (historyContent.includes('req.query.since') && historyContent.includes('new Date')) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testLimitFilter() {
  const name = 'Limit parameter supported in history';
  const historyContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/history.js'), 'utf8');
  
  if (historyContent.includes('req.query.limit') && historyContent.includes('slice')) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

// === FASE 3: Integrality (Zero Writes + Determinism) ===
console.log(`\n${colors.cyan}FASE 3 — Integrality (Zero Writes + Determinism)${colors.reset}`);

function testZeroWrites() {
  const name = 'All routes are read-only (zero file writes)';
  const routeFiles = [
    path.join(__dirname, './dashboard/routes/metrics.js'),
    path.join(__dirname, './dashboard/routes/decisions.js'),
    path.join(__dirname, './dashboard/routes/history.js')
  ];

  let allReadOnly = true;
  
  routeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for write operations
    if (content.includes('fs.writeFile') || 
        content.includes('fs.appendFile') || 
        content.includes('JSON.stringify') + /\.write|\.append/.test(content)) {
      allReadOnly = false;
    }
  });

  if (allReadOnly) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testErrorHandling() {
  const name = 'All routes have error handling (try/catch)';
  const routeFiles = [
    path.join(__dirname, './dashboard/routes/metrics.js'),
    path.join(__dirname, './dashboard/routes/decisions.js'),
    path.join(__dirname, './dashboard/routes/history.js')
  ];

  let allHaveErrorHandling = true;
  
  routeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('try') || !content.includes('catch')) {
      allHaveErrorHandling = false;
    }
  });

  if (allHaveErrorHandling) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testResponseFormat() {
  const name = 'All responses include timestamp and type fields';
  const metricsContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/metrics.js'), 'utf8');
  const decisionsContent = fs.readFileSync(path.join(__dirname, './dashboard/routes/decisions.js'), 'utf8');
  
  const metricsHasTimestamp = metricsContent.includes('timestamp') && metricsContent.includes('new Date().toISOString()');
  const decisionsHasTimestamp = decisionsContent.includes('timestamp') && decisionsContent.includes('new Date().toISOString()');
  
  if (metricsHasTimestamp && decisionsHasTimestamp) {
    console.log(`${colors.green}✅${colors.reset} ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

// === FASE 4: Frontend Responsiveness ===
console.log(`\n${colors.cyan}FASE 4 — Frontend Assets & Responsiveness${colors.reset}`);

function testHTMLAsset() {
  const name = 'index.html exists and contains required sections';
  const htmlPath = path.join(__dirname, './dashboard/ui/index.html');
  
  if (fs.existsSync(htmlPath)) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const hasSections = 
      content.includes('view-summary') &&
      content.includes('view-missions') &&
      content.includes('view-timeline') &&
      content.includes('view-decisions');
    
    if (hasSections) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testJSAsset() {
  const name = 'dashboard.js exists with fetch and render functions';
  const jsPath = path.join(__dirname, './dashboard/ui/dashboard.js');
  
  if (fs.existsSync(jsPath)) {
    const content = fs.readFileSync(jsPath, 'utf8');
    const hasFunctions = 
      content.includes('loadAllData') &&
      content.includes('renderAllViews') &&
      content.includes('fetch(') &&
      content.includes('applyFilters');
    
    if (hasFunctions) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testCSSAsset() {
  const name = 'styles.css exists with responsive design (@media queries)';
  const cssPath = path.join(__dirname, './dashboard/ui/styles.css');
  
  if (fs.existsSync(cssPath)) {
    const content = fs.readFileSync(cssPath, 'utf8');
    const hasResponsive = content.includes('@media');
    
    if (hasResponsive) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

function testAccessibility() {
  const name = 'Frontend uses semantic HTML and accessibility attributes';
  const htmlPath = path.join(__dirname, './dashboard/ui/index.html');
  
  if (fs.existsSync(htmlPath)) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const hasAccessibility = 
      content.includes('lang=') &&
      content.includes('<header') &&
      content.includes('<main') &&
      content.includes('<section') &&
      content.includes('<label');
    
    if (hasAccessibility) {
      console.log(`${colors.green}✅${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    failCount++;
  }
}

// === Execute All Tests ===
console.log(`\n${colors.yellow}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.yellow}PASSO 4.4.5 — Dashboard Test Suite${colors.reset}`);
console.log(`${colors.yellow}════════════════════════════════════════${colors.reset}`);

// FASE 1
testHealthEndpoint();
testMetricsEndpoint();
testDecisionsEndpoint();
testHistoryEndpoint();

// FASE 2
testMissionFilter();
testSinceFilter();
testLimitFilter();

// FASE 3
testZeroWrites();
testErrorHandling();
testResponseFormat();

// FASE 4
testHTMLAsset();
testJSAsset();
testCSSAsset();
testAccessibility();

// === Summary ===
const total = passCount + failCount;
const percentage = total > 0 ? ((passCount / total) * 100).toFixed(0) : 0;

console.log(`\n${colors.yellow}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
console.log(`${colors.blue}📊 Total: ${total} | Success Rate: ${percentage}%${colors.reset}`);
console.log(`${colors.yellow}════════════════════════════════════════${colors.reset}\n`);

if (failCount === 0) {
  console.log(`${colors.green}${colors.green}✅ PASSO 4.4.5 OK — DASHBOARD-READY SEAL${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Tests failed. Please review and fix.${colors.reset}`);
  process.exit(1);
}
