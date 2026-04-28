const USE_BACKEND = true;
const API_URL = 'http://localhost:5000';

// ── Kahn's Topological Sort with DP Critical Path ────────────
function kahnSort(subjects, edges, credits, maxCreditsLimit) {
  const n = subjects.length;
  const idx = {};
  subjects.forEach((s, i) => idx[s.trim()] = i);

  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  const errors = [];

  for (const [from, to] of edges) {
    const u = idx[from.trim()], v = idx[to.trim()];
    if (u === undefined) { errors.push(`Unknown subject: "${from.trim()}"`); continue; }
    if (v === undefined) { errors.push(`Unknown subject: "${to.trim()}"`); continue; }
    adj[u].push(v);
    indegree[v]++;
  }

  const deg = [...indegree];
  const queue = [];
  const result = [];
  
  for (let i = 0; i < n; i++) {
    if (deg[i] === 0) {
      queue.push(i);
      queue.sort((a,b) => 
          (credits[subjects[a]]||0) - 
          (credits[subjects[b]]||0)
      );
    }
  }

  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    for (const nb of adj[node]) {
      if (--deg[nb] === 0) {
        queue.push(nb);
        queue.sort((a,b) => 
            (credits[subjects[a]]||0) - 
            (credits[subjects[b]]||0)
        );
      }
    }
  }

  const hasCycle = result.length !== n;
  let cyclePath = [];
  let criticalPath = [];
  let maxCredits = 0;
  let weeklyPlan = [];

  if (hasCycle) {
    errors.push('Circular dependency detected — a valid study order is not possible.');
    
    // Find a cycle among nodes with indegree > 0
    const visited = new Array(n).fill(0); // 0: unvisited, 1: visiting, 2: visited
    const parent = new Array(n).fill(-1);
    
    let cycleStart = -1, cycleEnd = -1;
    function dfs(u) {
      visited[u] = 1;
      for(const v of adj[u]){
        if(visited[v] === 0){
          parent[v] = u;
          if(dfs(v)) return true;
        } else if(visited[v] === 1){
          cycleStart = v;
          cycleEnd = u;
          return true;
        }
      }
      visited[u] = 2;
      return false;
    }
    
    for(let i=0; i<n; i++){
      if(deg[i] > 0 && visited[i] === 0) {
        if(dfs(i)) break;
      }
    }
    
    if(cycleStart !== -1){
      let curr = cycleEnd;
      const path = [];
      const seenNodes = new Set();
      while(curr !== cycleStart && 
            curr !== -1 && 
            !seenNodes.has(curr)){
          seenNodes.add(curr);
          path.push(subjects[curr]);
          curr = parent[curr];
      }
      if(curr === cycleStart) {
          path.push(subjects[cycleStart]);
          path.reverse();
          path.push(subjects[cycleStart]);
          cyclePath = path;
      }
    }

  } else {
    // DP for critical path
    const dist = new Array(n).fill(0);
    const parentDP = new Array(n).fill(-1);
    
    for(let i=0; i<n; i++){
       dist[i] = credits[subjects[i].trim()] || 0;
    }
    
    let endNode = -1;
    let maxDist = -1;
    
    for(let u of result){
      for(let v of adj[u]){
        const w_v = credits[subjects[v].trim()] || 0;
        if(dist[u] + w_v > dist[v]){
          dist[v] = dist[u] + w_v;
          parentDP[v] = u;
        }
      }
    }
    
    for(let i=0; i<n; i++){
      if(dist[i] > maxDist){
        maxDist = dist[i];
        endNode = i;
      }
    }
    
    maxCredits = maxDist;
    if(endNode !== -1){
      let curr = endNode;
      while(curr !== -1){
        criticalPath.push(subjects[curr]);
        curr = parentDP[curr];
      }
      criticalPath.reverse();
    }

    // Weekly Plan grouping
    let currentWeekSubjects = [];
    let currentWeekCredits = 0;
    let weekNumber = 1;

    for (let u of result) {
      const w = credits[subjects[u].trim()] || 0;
      if(currentWeekCredits + w > maxCreditsLimit && currentWeekSubjects.length > 0){
        weeklyPlan.push({ week: weekNumber, subjects: [...currentWeekSubjects], totalCredits: currentWeekCredits});
        weekNumber++;
        currentWeekSubjects = [];
        currentWeekCredits = 0;
      }
      currentWeekSubjects.push(subjects[u]);
      currentWeekCredits += w;
    }
    if(currentWeekSubjects.length > 0){
        weeklyPlan.push({ week: weekNumber, subjects: [...currentWeekSubjects], totalCredits: currentWeekCredits});
    }
  }

  return { subjects, edges, adj, result, hasCycle, cyclePath, criticalPath, maxCredits, weeklyPlan, maxCreditsLimit, credits, errors };
}

// ── Test Cases ───────────────────────────────────────────────
const TEST_CASES = {
  1: {
    subjects: ['Math', 'Physics', 'Chemistry', 'Biology'],
    credits: {'Math': 3, 'Physics': 4, 'Chemistry': 4, 'Biology': 3},
    edges: [['Math','Physics'],['Physics','Chemistry'],['Chemistry','Biology']]
  },
  2: {
    subjects: ['Math', 'Physics', 'Chemistry', 'Biology'],
    credits: {'Math': 3, 'Physics': 4, 'Chemistry': 2, 'Biology': 4},
    edges: [['Math','Physics'],['Math','Chemistry'],['Physics','Biology'],['Chemistry','Biology']]
  },
  3: {
    subjects: ['A', 'B', 'C'],
    credits: {'A': 2, 'B': 3, 'C': 4},
    edges: [['A','B'],['B','C'],['C','A']]
  },
  4: {
    subjects: ['Math', 'Physics', 'History', 'Geography'],
    credits: {'Math': 3, 'Physics': 4, 'History': 3, 'Geography': 2},
    edges: [['Math','Physics'],['History','Geography']]
  }
};

// ── Node color palette (one per node, cycles through) ────────
const NODE_COLORS = [
  { fill: '#7c6fff', glow: 'rgba(124,111,255,0.4)',  text: '#fff' },
  { fill: '#3ecf8e', glow: 'rgba(62,207,142,0.4)',   text: '#fff' },
  { fill: '#f59e0b', glow: 'rgba(245,158,11,0.4)',   text: '#fff' },
  { fill: '#38bdf8', glow: 'rgba(56,189,248,0.4)',   text: '#fff' },
  { fill: '#f472b6', glow: 'rgba(244,114,182,0.4)',  text: '#fff' },
  { fill: '#a78bfa', glow: 'rgba(167,139,250,0.4)',  text: '#fff' },
  { fill: '#34d399', glow: 'rgba(52,211,153,0.4)',   text: '#fff' },
  { fill: '#fb923c', glow: 'rgba(251,146,60,0.4)',   text: '#fff' },
];
const CYCLE_COLOR = { fill: '#f87171', glow: 'rgba(248,113,113,0.4)', text: '#fff' };
const CRITICAL_COLOR = { fill: '#3b82f6', glow: 'rgba(59,130,246,0.6)', text: '#fff' };

// ── Graph layout ─────────────────────────────────────────────
function computeLayout(n, adj, result) {
  const rank = new Array(n).fill(0);
  const visited = new Array(n).fill(false);

  result.forEach((node, i) => { rank[node] = i; });

  const rankMap = {};
  for (let i = 0; i < n; i++) {
    const r = rank[i];
    if (!rankMap[r]) rankMap[r] = [];
    rankMap[r].push(i);
  }

  return { rank, rankMap };
}

function isCycleEdge(data, uName, vName) {
   if(!data.cyclePath) return false;
   for(let i=0; i<data.cyclePath.length-1; i++){
       if(data.cyclePath[i] === uName && data.cyclePath[i+1] === vName) return true;
   }
   return false;
}

function isCriticalEdge(data, uName, vName) {
   if(!data.criticalPath) return false;
   for(let i=0; i<data.criticalPath.length-1; i++){
       if(data.criticalPath[i] === uName && data.criticalPath[i+1] === vName) return true;
   }
   return false;
}

function renderGraph(data) {
  // SAFETY FIXES
  if (!data || !data.subjects) return;
  
  if (!data.result || data.result.length === 0) {
    data.result = data.subjects.map((_,i) => i);
  } else if (typeof data.result[0] === 'string') {
    // convert names to indices
    data.result = data.result.map(name =>
      data.subjects.indexOf(name)
    ).filter(i => i !== -1);
  }

  const canvas = document.getElementById('graphCanvas');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 260;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const n = data.subjects.length;
  if (n === 0) return;

  const nodeR = Math.min(30, Math.max(20, 120 / n));
  
  const colors = data.subjects.map((name, i) => {
    if (data.hasCycle && data.cyclePath && data.cyclePath.includes(name)) {
        return CYCLE_COLOR; 
    }
    if (!data.hasCycle && data.criticalPath && data.criticalPath.includes(name)) {
        return CRITICAL_COLOR;
    }
    return NODE_COLORS[i % NODE_COLORS.length];
  });

  let pos;
  if (n <= 6) {
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) * 0.36;
    pos = data.subjects.map((_, i) => ({
      x: cx + r * Math.cos((2 * Math.PI * i / n) - Math.PI / 2),
      y: cy + r * Math.sin((2 * Math.PI * i / n) - Math.PI / 2),
    }));
  } else {
    const orderIdx = {};
    data.result.forEach((node, i) => { orderIdx[node] = i; });
    for (let i = 0; i < n; i++) if (orderIdx[i] === undefined) orderIdx[i] = n;

    const cols = Math.ceil(Math.sqrt(n));
    pos = data.subjects.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const totalCols = Math.min(cols, n);
      const totalRows = Math.ceil(n / cols);
      return {
        x: (W / (totalCols + 1)) * (col + 1),
        y: (H / (totalRows + 1)) * (row + 1),
      };
    });
  }

  for (let u = 0; u < n; u++) {
    for (const v of data.adj[u]) {
        const isCE = isCycleEdge(data, data.subjects[u], data.subjects[v]);
        const isCritE = isCriticalEdge(data, data.subjects[u], data.subjects[v]);
        drawArrow(ctx, pos[u], pos[v], nodeR, isCE, isCritE);
    }
  }

  data.subjects.forEach((name, i) => {
    const { x, y } = pos[i];
    const c = colors[i];

    const grd = ctx.createRadialGradient(x, y, nodeR * 0.5, x, y, nodeR * 2);
    grd.addColorStop(0, c.glow);
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, nodeR * 2, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = c.fill;
    ctx.fill();

    if (!data.hasCycle) {
      const rank = data.result.indexOf(i) + 1;
      ctx.beginPath();
      ctx.arc(x + nodeR - 7, y - nodeR + 7, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1320';
      ctx.fill();
      ctx.fillStyle = c.fill;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rank, x + nodeR - 7, y - nodeR + 7);
    }

    const w = data.credits[name] !== undefined ? data.credits[name] : 0;
    const labelStr = name.length > 7 ? name.slice(0, 6) + '…' : name;
    
    // Draw subject name
    const fontSize = Math.min(11, Math.max(9, nodeR * 0.40));
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = c.text;
    ctx.fillText(labelStr, x, y - 4);
    
    // Draw credits
    ctx.font = `400 ${fontSize - 1}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`(${w} cr)`, x, y + 8);
  });
}

function drawArrow(ctx, from, to, nodeR, isCycleE, isCritE) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const ux = dx / dist, uy = dy / dist;
  const sx = from.x + ux * (nodeR + 2);
  const sy = from.y + uy * (nodeR + 2);
  const ex = to.x   - ux * (nodeR + 8);
  const ey = to.y   - uy * (nodeR + 8);

  let strokeColor = 'rgba(255,255,255,0.15)';
  let headColor = 'rgba(255,255,255,0.25)';
  let dash = [];
  let lineWidth = 1.5;

  if (isCycleE) {
      strokeColor = 'rgba(248,113,113,0.8)';
      headColor = 'rgba(248,113,113,1)';
      dash = [5, 4];
      lineWidth = 2.5;
  } else if (isCritE) {
      strokeColor = 'rgba(59,130,246,0.8)';
      headColor = 'rgba(59,130,246,1)';
      lineWidth = 2.5;
  }

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);

  const angle = Math.atan2(ey - sy, ex - sx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.38), ey - 10 * Math.sin(angle - 0.38));
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.38), ey - 10 * Math.sin(angle + 0.38));
  ctx.closePath();
  ctx.fillStyle = headColor;
  ctx.fill();
}

// ── UI helpers ───────────────────────────────────────────────

let _numSubjects = 0;
let _numEdges    = 0;
let _maxCreditsWeek = 10;

function unlock(id) { document.getElementById(id).classList.remove('locked'); }
function markDone(id) {
  const el = document.getElementById(id);
  el.classList.add('done');
  el.classList.remove('locked');
}

function goStep2() {
  const val = parseInt(document.getElementById('numSubjects').value);
  if (!val || val < 1) { flashError('numSubjects', 'Enter ≥ 1'); return; }
  _numSubjects = val;
  markDone('step1');

  const fields = document.getElementById('subjectFields');
  fields.innerHTML = '';
  for (let i = 0; i < val; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'pair-row-subject';
    wrap.innerHTML = `
      <input type="text" id="sub_${i}" placeholder="e.g. Subject ${i+1}" autocomplete="off"/>
      <input type="number" id="cred_${i}" class="credit-input" min="1" max="20" value="3" placeholder="Credits"/>
    `;
    fields.appendChild(wrap);
  }
  document.getElementById('step2Next').style.display = 'block';
  unlock('step2');
  document.getElementById('sub_0').focus();
}

function goStep3() {
  for (let i = 0; i < _numSubjects; i++) {
    if (!document.getElementById(`sub_${i}`).value.trim()) {
      flashError(`sub_${i}`, 'Required'); return;
    }
    const cap = parseInt(document.getElementById(`cred_${i}`).value);
    if(isNaN(cap) || cap < 1 || cap > 20) {
       flashError(`cred_${i}`, '1-20'); return;
    }
  }
  markDone('step2');
  unlock('step3');
  document.getElementById('maxCreditsWeek').focus();
}

function goStep4() {
  const v = parseInt(document.getElementById('maxCreditsWeek').value);
  if (isNaN(v) || v < 1) { flashError('maxCreditsWeek', 'Min 1'); return; }
  _maxCreditsWeek = v;
  markDone('step3');
  unlock('step4');
  document.getElementById('numEdges').focus();
}

function goStep5() {
  const val = parseInt(document.getElementById('numEdges').value);
  if (isNaN(val) || val < 0) { flashError('numEdges', 'Enter 0 or more'); return; }
  _numEdges = val;
  markDone('step4');

  const fields = document.getElementById('edgeFields');
  fields.innerHTML = '';

  if (val === 0) {
    document.getElementById('generateBtn').style.display = 'flex';
    unlock('step5');
    return;
  }

  const names = getSubjectNames();
  fields.innerHTML = `<datalist id="subjectList">${names.map(n => `<option value="${n}">`).join('')}</datalist>`;

  for (let i = 0; i < val; i++) {
    const row = document.createElement('div');
    row.innerHTML = `
      <div class="pair-label">Pair ${i + 1} — A studied before B</div>
      <div class="pair-row">
        <input type="text" id="from_${i}" placeholder="A" list="subjectList" autocomplete="off"/>
        <div class="pair-arrow">→</div>
        <input type="text" id="to_${i}" placeholder="B" list="subjectList" autocomplete="off"/>
      </div>`;
    fields.appendChild(row);
  }

  document.getElementById('generateBtn').style.display = 'flex';
  unlock('step5');
  document.getElementById('from_0').focus();
}

function getSubjectNames() {
  return Array.from({ length: _numSubjects }, (_, i) =>
    document.getElementById(`sub_${i}`).value.trim()
  );
}

function runWizard() {
  const subjects = [];
  const credits = {};
  
  const seenSubjects = new Set();
  for (let i = 0; i < _numSubjects; i++) {
      const s = document.getElementById(
          `sub_${i}`).value.trim();
      if (seenSubjects.has(s)) {
          flashError(`sub_${i}`, 'Duplicate!');
          return;
      }
      seenSubjects.add(s);
      subjects.push(s);
      credits[s] = parseInt(
          document.getElementById(
              `cred_${i}`).value) || 3;
  }
  
  const subjectSet = new Set(subjects);
  const edges = [];
  const inputErrors = [];

  for (let i = 0; i < _numEdges; i++) {
    const from = document.getElementById(`from_${i}`)?.value.trim();
    const to   = document.getElementById(`to_${i}`)?.value.trim();
    if (!from || !to) continue;
    if (!subjectSet.has(from)) {
        inputErrors.push(
            `Pair ${i+1}: "${from}" is not a known subject.`
        );
        continue;
    }
    if (!subjectSet.has(to)) {
        inputErrors.push(
            `Pair ${i+1}: "${to}" is not a known subject.`
        );
        continue;
    }
    edges.push([from, to]);
  }

  if (inputErrors.length) {
    const data = { subjects, edges: [], adj: [], result: [], hasCycle: false, errors: inputErrors, cyclePath: [], criticalPath: [], weeklyPlan: [] };
    renderErrors(inputErrors, data);
    return;
  }

  if (USE_BACKEND) {
    const payload = {
      subjects: subjects.map(s => ({
        name: s,
        weight: credits[s] || 3
      })),
      edges: edges.map(([from, to]) => ({
        from, to
      })),
      maxCreditsPerWeek: _maxCreditsWeek
    }
    
    document.getElementById('generateBtn').textContent = 'Generating...'
    document.getElementById('generateBtn').disabled = true
    
    fetch(API_URL + '/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('generateBtn').textContent = 'Generate Study Order'
      document.getElementById('generateBtn').disabled = false
      
      data.subjects = subjects
      data.edges = edges
      data.adj = buildAdjFromEdges(subjects, edges)
      data.credits = credits
      data.maxCreditsLimit = _maxCreditsWeek
      
      if (data.order && data.order.length) {
          data.result = data.order.map(name =>
              subjects.indexOf(name)
          ).filter(i => i !== -1)
      } else {
          data.result = subjects.map((_,i) => i)
      }
      
      if (!data.cyclePath) data.cyclePath = []
      if (!data.criticalPath) data.criticalPath = []
      if (!data.weeklyPlan) data.weeklyPlan = []
      
      render(data)
    })
    .catch(err => {
      document.getElementById('generateBtn').textContent = 'Generate Study Order'
      document.getElementById('generateBtn').disabled = false
      
      renderErrors(
        ['Server error: ' + err.message +
         '. Make sure node server.js is running.'],
        { hasCycle: false, cyclePath: [],
          subjects, edges, adj: [],
          credits, weeklyPlan: [] }
      )
    })
    
  } else {
    render(kahnSort(subjects, edges, credits, _maxCreditsWeek));
  }
}

function renderErrors(errors, data) {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultArea').style.display = 'block';

  const banner = document.getElementById('statusBanner');
  banner.className = 'status-banner error';
  banner.innerHTML = `<span class="status-icon">✕</span> Errors found in study plan generator.`;

  const errorBox = document.getElementById('errorBox');
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.innerHTML = errors.map(e => `• ${e}`).join('<br/>');
  errorBox.style.display = 'block';

  const cycleBox = document.getElementById('cycleBox');
  if (data.hasCycle && 
      data.cyclePath && 
      data.cyclePath.length) {
      cycleBox.style.display = 'block';
      let pathHtml = '';
      for (let i = 0; i < data.cyclePath.length; i++) {
         pathHtml += `<span class="cycle-highlight">${data.cyclePath[i]}</span>`;
         if (i < data.cyclePath.length - 1) {
             pathHtml += `<span class="path-arrow">→</span>`;
         }
      }
      document.getElementById('cyclePath').innerHTML = pathHtml;
  } else {
      cycleBox.style.display = 'none';
  }

  document.getElementById('orderSection').style.display = 'none';
  document.getElementById('inputRecap').innerHTML = '';

  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function buildAdjFromEdges(subjects, edges) {
  const idx = {}
  subjects.forEach((s,i) => idx[s] = i)
  const adj = subjects.map(() => [])
  for (const [from, to] of edges) {
    if (idx[from] !== undefined && 
        idx[to] !== undefined) {
      adj[idx[from]].push(idx[to])
    }
  }
  return adj
}

function flashError(inputId, msg) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.borderColor = 'var(--danger)';
  el.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.15)';
  const prev = el.placeholder;
  el.placeholder = msg;
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; el.placeholder = prev; }, 2000);
}

function runTest(n) {
  const tc = TEST_CASES[n]
  
  if (USE_BACKEND) {
    const payload = {
      subjects: tc.subjects.map(s => ({
        name: s,
        weight: tc.credits[s] || 3
      })),
      edges: tc.edges.map(([from,to]) => ({
        from, to
      })),
      maxCreditsPerWeek: 10
    }
    
    fetch(API_URL + '/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      data.subjects = tc.subjects
      data.edges = tc.edges
      data.adj = buildAdjFromEdges(tc.subjects, tc.edges)
      data.credits = tc.credits
      data.maxCreditsLimit = 10
      
      if (data.order && data.order.length) {
          data.result = data.order.map(name =>
              tc.subjects.indexOf(name)
          ).filter(i => i !== -1)
      } else {
          data.result = tc.subjects.map((_,i) => i)
      }
      
      if (!data.cyclePath) data.cyclePath = []
      if (!data.criticalPath) data.criticalPath = []
      if (!data.weeklyPlan) data.weeklyPlan = []
      
      render(data)
    })
    .catch(err => {
      console.error('Backend error:', err)
      render(kahnSort(tc.subjects, tc.edges, tc.credits, 10))
    })
  } else {
    render(kahnSort(tc.subjects, tc.edges, tc.credits, 10))
  }
}

function clearAll() {
  _numSubjects = 0; _numEdges = 0; _maxCreditsWeek = 10;
  document.getElementById('numSubjects').value = '';
  document.getElementById('numEdges').value = '';
  if(document.getElementById('maxCreditsWeek')) document.getElementById('maxCreditsWeek').value = '10';
  document.getElementById('subjectFields').innerHTML = '';
  document.getElementById('edgeFields').innerHTML = '';
  document.getElementById('step2Next').style.display = 'none';
  document.getElementById('generateBtn').style.display = 'none';
  ['step1','step2','step3','step4','step5'].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
       el.classList.remove('done');
       if (id !== 'step1') el.classList.add('locked');
    }
  });
  document.getElementById('resultArea').style.display = 'none';
  document.getElementById('emptyState').style.display = 'flex';
}

// ── Render ───────────────────────────────────────────────────
function render(data) {
  if (!data.cyclePath) data.cyclePath = []
  if (!data.criticalPath) data.criticalPath = []
  if (!data.weeklyPlan) data.weeklyPlan = []
  if (!data.errors) data.errors = []
  if (!data.credits) data.credits = {}
  if (!data.edges) data.edges = []

  window._lastData = data;
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultArea').style.display = 'block';

  const banner = document.getElementById('statusBanner');
  if (data.hasCycle) {
    banner.className = 'status-banner error';
    banner.innerHTML = `<span class="status-icon">✕</span> Could not generate a study order — circular dependency found.`;
    renderErrors(data.errors, data);
  } else {
    banner.className = 'status-banner success';
    banner.innerHTML = `<span class="status-icon">✓</span> Schedule planned successfully for ${data.weeklyPlan.length} week(s).`;
    
    const errorBox = document.getElementById('errorBox');
    errorBox.style.display = 'none';
  }

  const colors = data.subjects.map((name, i) => {
    if (data.hasCycle && data.cyclePath && data.cyclePath.includes(name)) {
        return CYCLE_COLOR; 
    }
    if (!data.hasCycle && data.criticalPath && data.criticalPath.includes(name)) {
        return CRITICAL_COLOR;
    }
    return NODE_COLORS[i % NODE_COLORS.length];
  });

  const recap = document.getElementById('inputRecap');
  recap.innerHTML = `
    <div class="recap-section">
      <div class="recap-label">Subjects (${data.subjects.length})</div>
      <div class="tag-row">${data.subjects.map((s, i) =>
        `<span class="tag tag-subject" style="background:${colors[i].fill}22;color:${colors[i].fill};border-color:${colors[i].fill}44">${s} (${data.credits[s]})</span>`
      ).join('')}</div>
      <div style="margin-top: 8px; color: #cbd5e1; font-size: 13px;">Max Credits / Week: ${data.maxCreditsLimit}</div>
    </div>
    ${data.edges.length ? `
    <div class="recap-section" style="margin-top: 12px;">
      <div class="recap-label">Prerequisites (${data.edges.length})</div>
      <div class="tag-row">${data.edges.map(([f, t]) =>
        `<span class="tag tag-edge">${f}<span class="arrow">→</span>${t}</span>`
      ).join('')}</div>
    </div>` : ''}
  `;

  const orderSection = document.getElementById('orderSection');
  const orderList = document.getElementById('orderList');
  const cpBox = document.getElementById('criticalPathBox');
  orderList.innerHTML = '';

  if (data.hasCycle) {
    orderSection.style.display = 'none';
  } else {
    orderSection.style.display = 'block';
    
    // Render Weekly Plan
    data.weeklyPlan.forEach((wp) => {
        const maxL = data.maxCreditsLimit;
        const pct = Math.min(100, (wp.totalCredits / maxL) * 100);
        
        let colorClass = 'bg-red';
        if (wp.totalCredits / maxL < 0.70) colorClass = 'bg-green';
        else if (wp.totalCredits / maxL <= 0.90) colorClass = 'bg-orange';
        
        let subHtml = wp.subjects.map(s => {
            const idx = data.subjects.indexOf(s);
            const c = colors[idx];
            return `<div class="tag" style="background:${c.fill}33;color:#fff;border-color:${c.fill};padding:4px 8px;border-radius:4px;">${s} (${data.credits[s]})</div>`;
        }).join('');
        
        orderList.innerHTML += `
           <div class="weekly-plan-card">
               <div class="week-header">
                   <span>Week ${wp.week}</span>
                   <span>${wp.totalCredits} / ${maxL} credits</span>
               </div>
               <div class="week-progress-bar-container">
                   <div class="week-progress-bar ${colorClass}" style="width: ${pct}%"></div>
               </div>
               <div class="week-subjects">${subHtml}</div>
           </div>
        `;
    });

    // Render Critical Path
    if(data.criticalPath && data.criticalPath.length) {
       cpBox.style.display = 'block';
       let pathHtml = '';
       for(let i=0; i<data.criticalPath.length; i++) {
           pathHtml += `<span class="cp-highlight">${data.criticalPath[i]}</span>`;
           if(i < data.criticalPath.length - 1){
               pathHtml += ` <span class="path-arrow">→</span> `;
           }
       }
       pathHtml += ` &nbsp;&nbsp;<span style="color:#fff; font-weight:bold;">= ${data.maxCredits} credits total</span>`;
       document.getElementById('criticalPathContent').innerHTML = pathHtml;
    } else {
       cpBox.style.display = 'none';
    }
  }

  requestAnimationFrame(() => renderGraph(data));
}

window.addEventListener('resize', () => {
  clearTimeout(window._rt);
  window._rt = setTimeout(() => { if (window._lastData) renderGraph(window._lastData); }, 150);
});
