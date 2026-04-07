let currentAlgo = '';
let animRunning = false;
let animSpeed = 600;
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let nodes = {};
let edges = [];
let nodeColors = {};
let edgeColors  = {};
let distances   = {};
let nodeLabels  = {};

let stArr = [], stTree = [], stN = 0;
let stNodeColors = {};

const C = {
  nodeDef:      '#0d0d0d',
  nodeDefBorder:'#2a2a2a',
  nodeActive:   '#3b0764',
  nodeVisited:  '#022c22',
  nodePath:     '#1c1917',

  edgeDef:      '#1f1f1f',
  edgeActive:   '#a78bfa',
  edgeVisited:  '#34d399',
  edgePath:     '#fbbf24',

  textPrimary:  '#e2e8f0',
  textMuted:    '#6b7280',

  segDefault:   '#0d0d0d',
  segActive:    '#7c2d12',
  segMatch:     '#064e3b',
  segPartial:   '#1a1a2e',

  weightBg:     '#0a0a0a',
  weightText:   '#fb923c',
};

function resizeCanvas() {
  const area = canvas.parentElement;
  canvas.width  = area.clientWidth;
  canvas.height = area.clientHeight;
  redraw();
}
window.addEventListener('resize', resizeCanvas);

function openAlgo(algo) {
  currentAlgo = algo;
  animRunning = false;
  nodes = {}; edges = []; nodeColors = {}; edgeColors = {};
  distances = {}; nodeLabels = {};
  stArr = []; stTree = []; stN = 0; stNodeColors = {};

  document.getElementById('menuScreen').classList.remove('active');
  document.getElementById('algoScreen').classList.add('active');

  const titles = {
    segment: 'Segment Tree',
    bfs:     'Breadth-First Search',
    dfs:     'Depth-First Search',
    dijkstra:"Dijkstra's Algorithm"
  };
  const badges = {
    segment: 'Tree',
    bfs:     'Graph',
    dfs:     'Graph',
    dijkstra:'Weighted Graph'
  };

  document.getElementById('algoTitle').textContent = titles[algo];
  document.getElementById('algoBadge').textContent = badges[algo];
  buildSidebar();
  setTimeout(() => { resizeCanvas(); showOverlay(true); }, 50);
}

function goBack() {
  animRunning = false;
  document.getElementById('algoScreen').classList.remove('active');
  document.getElementById('menuScreen').classList.add('active');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showOverlay(v) {
  document.getElementById('overlayMsg').style.display = v ? '' : 'none';
}

function buildSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = (currentAlgo === 'segment') ? segmentSidebar() : graphSidebar();
}

function segmentSidebar() {
  return `
  <div class="panel">
    <h4>Input Array</h4>
    <label>Values (space-separated)</label>
    <input type="text" id="arrInput" value="3 1 4 1 5 9 2 6" placeholder="e.g. 1 2 3 4 5">
    <br>
    <button class="btn btn-primary" style="margin-top:10px" onclick="buildSegTree()">Build Tree</button>
  </div>
  <div class="panel">
    <h4>Range Query (Sum)</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label>Left (L)</label><input type="number" id="ql" value="1" min="0"></div>
      <div><label>Right (R)</label><input type="number" id="qr" value="5" min="0"></div>
    </div>
    <button class="btn btn-success" onclick="querySegTree()">Query Range</button>
  </div>
  <div class="panel">
    <h4>Point Update</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label>Index</label><input type="number" id="ui" value="2" min="0"></div>
      <div><label>New Value</label><input type="number" id="uv" value="7"></div>
    </div>
    <button class="btn btn-warning" onclick="updateSegTree()">Update</button>
  </div>
  <div class="panel"><h4>Log</h4><div class="log" id="log"></div></div>`;
}

function graphSidebar() {
  const isDijk = currentAlgo === 'dijkstra';
  const presets = isDijk
    ? `<div class="panel"><h4>Presets</h4><div class="presets">
        <button class="btn-sm" onclick="loadPreset('dijkstra1')">5-node graph</button>
        <button class="btn-sm" onclick="loadPreset('dijkstra2')">Diamond</button>
        <button class="btn-sm" onclick="loadPreset('dijkstra3')">Linear chain</button>
      </div></div>`
    : `<div class="panel"><h4>Presets</h4><div class="presets">
        <button class="btn-sm" onclick="loadPreset('bfs1')">Binary tree</button>
        <button class="btn-sm" onclick="loadPreset('bfs2')">Grid 2×3</button>
        <button class="btn-sm" onclick="loadPreset('bfs3')">Disconnected</button>
      </div></div>`;

  const edgeHelp = isDijk
    ? 'e.g. 0-1:4 0-2:2 1-3:5 2-1:1 2-3:8'
    : 'e.g. 0-1 0-2 1-3 2-4';

  return `
  ${presets}
  <div class="panel">
    <h4>Custom Graph</h4>
    <label>Nodes (space-separated)</label>
    <input type="text" id="nodesIn" placeholder="0 1 2 3 4" value="0 1 2 3 4">
    <br><br>
    <label>Edges ${isDijk ? '(u-v:weight)' : '(u-v)'}</label>
    <input type="text" id="edgesIn" placeholder="${edgeHelp}" value="${edgeHelp}">
    <br><br>
    <label>Start Node</label>
    <input type="number" id="startNode" value="0" min="0">
    <br>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn btn-primary" style="flex:1" onclick="buildGraph()">Build</button>
      <button class="btn btn-success" style="flex:1" onclick="runAlgo()">&#9654; Run</button>
    </div>
  </div>
  <div class="panel">
    <h4>Speed</h4>
    <div class="speed-row">Fast
      <input type="range" min="100" max="1500" value="600"
        oninput="animSpeed=+this.value;this.nextElementSibling.textContent=this.value+'ms'"
        style="flex:1">
      <span>600ms</span>
    </div>
  </div>
  <div class="panel"><h4>Log</h4><div class="log" id="log"></div></div>`;
}

function log(msg, cls = 'ev-info') {
  const el = document.getElementById('log');
  if (!el) return;
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}
function clearLog() {
  const el = document.getElementById('log');
  if (el) el.innerHTML = '';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildSegTree() {
  const raw = document.getElementById('arrInput').value.trim().split(/\s+/);
  stArr = raw.map(Number);
  if (stArr.some(isNaN) || stArr.length === 0) { alert('Invalid array'); return; }
  stN = stArr.length;
  stTree = new Array(4 * stN).fill(0);
  stNodeColors = {};
  stBuild(1, 0, stN - 1);
  clearLog();
  log(`Built segment tree for [${stArr.join(', ')}]`, 'ev-info');
  showOverlay(false);
  drawSegTree();
}

function stBuild(node, l, r) {
  if (l === r) { stTree[node] = stArr[l]; return; }
  const m = (l + r) >> 1;
  stBuild(2 * node, l, m);
  stBuild(2 * node + 1, m + 1, r);
  stTree[node] = stTree[2 * node] + stTree[2 * node + 1];
}

async function querySegTree() {
  if (stN === 0) { alert('Build tree first'); return; }
  const L = +document.getElementById('ql').value;
  const R = +document.getElementById('qr').value;
  if (isNaN(L) || isNaN(R) || L < 0 || R >= stN || L > R) {
    alert(`Invalid range. Use 0..${stN - 1}`); return;
  }
  stNodeColors = {};
  clearLog();
  log(`Querying sum [${L}, ${R}]`, 'ev-info');
  const result = await stQuery(1, 0, stN - 1, L, R);
  log(`Result: ${result}`, 'ev-found');
  drawSegTree();
}

async function stQuery(node, l, r, ql, qr) {
  stNodeColors[node] = C.segActive;
  drawSegTree();
  await sleep(animSpeed * 0.5);
  if (ql <= l && r <= qr) {
    stNodeColors[node] = C.segMatch;
    drawSegTree();
    log(`  Node ${node} [${l},${r}] = ${stTree[node]} ✓`, 'ev-found');
    await sleep(animSpeed * 0.5);
    return stTree[node];
  }
  if (qr < l || r < ql) {
    stNodeColors[node] = '#111111';
    drawSegTree();
    log(`  Node ${node} [${l},${r}] out of range`, 'ev-info');
    return 0;
  }
  const m = (l + r) >> 1;
  const left  = await stQuery(2 * node, l, m, ql, qr);
  const right = await stQuery(2 * node + 1, m + 1, r, ql, qr);
  stNodeColors[node] = C.segPartial;
  drawSegTree();
  return left + right;
}

async function updateSegTree()
{
  if (stN === 0) { alert('Build tree first'); return; }
  const idx = +document.getElementById('ui').value;
  const val = +document.getElementById('uv').value;
  if (isNaN(idx) || idx < 0 || idx >= stN) {
    alert(`Index must be 0..${stN - 1}`); return;
  }
  stArr[idx] = val;
  stNodeColors = {};
  clearLog();
  log(`Updating index ${idx} → ${val}`, 'ev-info');
  await stUpdate(1, 0, stN - 1, idx, val);
  log('Update complete', 'ev-found');
  drawSegTree();
}

async function stUpdate(node, l, r, idx, val) {
  stNodeColors[node] = C.segActive;
  drawSegTree();
  await sleep(animSpeed * 0.4);
  if (l === r) {
    stTree[node] = val;
    stNodeColors[node] = C.segMatch;
    drawSegTree();
    return;
  }
  const m = (l + r) >> 1;
  if (idx <= m) await stUpdate(2 * node, l, m, idx, val);
  else          await stUpdate(2 * node + 1, m + 1, r, idx, val);
  stTree[node] = stTree[2 * node] + stTree[2 * node + 1];
  stNodeColors[node] = C.segPartial;
  drawSegTree();
  await sleep(animSpeed * 0.3);
}

function drawSegTree() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (stN === 0) return;

  const positions = {};
  const depth = Math.ceil(Math.log2(stN)) + 1;
  const W = canvas.width, H = canvas.height;
  const nodeR = Math.max(18, Math.min(28, W / (stN * 2.5)));
  const levelH = Math.min(90, (H - 40) / depth);

  function pos(node, l, r, d) {
    if (node >= 4 * stN || stTree[node] === undefined) return;
    const cx = W * ((l + r + 1) / (2 * stN));
    const cy = 40 + d * levelH;
    positions[node] = { x: cx, y: cy, l, r };
    if (l === r) return;
    const m = (l + r) >> 1;
    pos(2 * node, l, m, d + 1);
    pos(2 * node + 1, m + 1, r, d + 1);
  }
  pos(1, 0, stN - 1, 0);


  for (const nid in positions)
  {
    const p = positions[nid];
    const left  = positions[2 * nid];
    const right = positions[2 * nid + 1];
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1.5;
    if (left)  { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(left.x,  left.y);  ctx.stroke(); }
    if (right) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(right.x, right.y); ctx.stroke(); }
  }

  for (const nid in positions) {
    const { x, y, l, r } = positions[nid];
    const col    = stNodeColors[nid] || C.segDefault;
    const border = stNodeColors[nid] ? lighten(col) : '#2a2a2a';

    ctx.beginPath();
    ctx.arc(x, y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${Math.max(10, nodeR * 0.6)}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stTree[nid] ?? '', x, y);

    if (nodeR > 16) {
      ctx.fillStyle = '#4b5563';
      ctx.font = `${Math.max(8, nodeR * 0.4)}px Segoe UI`;
      ctx.fillText(`[${l},${r}]`, x, y + nodeR + 10);
    }
  }
}

function lighten(hex)
{
  const map =
  {
    [C.segActive]:  '#b45309',
    [C.segMatch]:   '#059669',
    [C.segPartial]: '#7c3aed',
    '#111111':      '#1f1f1f',
  };
  return map[hex] || '#3f3f3f';
}

const PRESETS =
{
  bfs1:
  {
    nodes: ['0','1','2','3','4','5','6'],
    edges: [['0','1',1],['0','2',1],['1','3',1],['1','4',1],['2','5',1],['2','6',1]],
    layout: 'tree'
  },
  bfs2:
  {
    nodes: ['0','1','2','3','4','5'],
    edges: [['0','1',1],['0','3',1],['1','2',1],['1','4',1],['3','4',1],['4','5',1],['2','5',1]],
    layout: 'grid'
  },
  bfs3:
  {
    nodes: ['0','1','2','3','4','5'],
    edges: [['0','1',1],['1','2',1],['3','4',1],['4','5',1]],
    layout: 'circle'
  },
  dijkstra1:
  {
    nodes: ['0','1','2','3','4'],
    edges: [['0','1',4],['0','2',2],['1','3',5],['2','1',1],['2','3',8],['2','4',10],['3','4',2],['1','4',6]],
    layout: 'circle'
  },
  dijkstra2:
  {
    nodes: ['A','B','C','D'],
    edges: [['A','B',1],['A','C',4],['B','C',2],['B','D',5],['C','D',1]],
    layout: 'diamond'
  },
  dijkstra3:
  {
    nodes: ['0','1','2','3','4'],
    edges: [['0','1',3],['1','2',2],['2','3',4],['3','4',1],['0','2',10]],
    layout: 'linear'
  }
};

function loadPreset(key)
{
  const p = PRESETS[key];
  if (!p) return;
  const nodeStr = p.nodes.join(' ');
  const edgeStr = p.edges
    .map(([u,v,w]) => currentAlgo === 'dijkstra' ? `${u}-${v}:${w}` : `${u}-${v}`)
    .join(' ');
  document.getElementById('nodesIn').value = nodeStr;
  document.getElementById('edgesIn').value = edgeStr;
  buildGraphFromData(p.nodes, p.edges, p.layout);
}

function buildGraph()
{
  const rawN = document.getElementById('nodesIn').value.trim().split(/\s+/);
  const rawE = document.getElementById('edgesIn').value.trim().split(/\s+/).filter(Boolean);
  const edgesData = [];
  for (const e of rawE)
  {
    const parts = e.split(':');
    const uv = parts[0].split('-');
    if (uv.length !== 2) { alert(`Bad edge: ${e}`); return; }
    edgesData.push([uv[0], uv[1], parts[1] ? +parts[1] : 1]);
  }
  buildGraphFromData(rawN, edgesData, 'circle');
}

function buildGraphFromData(nodeList, edgesData, layout)
{
  nodes = {}; edges = [];
  nodeColors = {}; edgeColors = {};
  distances = {}; nodeLabels = {};
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.36;

  nodeList.forEach((id, i) =>
  {
    let x, y;
    if (layout === 'tree')
    {
      const row = i === 0 ? 0 : i <= 2 ? 1 : 2;
      const cols = i === 0 ? 1 : i <= 2 ? 2 : 4;
      const colIdx = i === 0 ? 0 : i <= 2 ? i - 1 : i - 3;
      x = W * (colIdx + 1) / (cols + 1);
      y = 80 + row * (H - 120) / 2;
    }
    else if (layout === 'grid')
    {
      x = W * 0.2 + (i % 3) * W * 0.3;
      y = H * 0.25 + Math.floor(i / 3) * H * 0.4;
    }
    else if (layout === 'diamond')
    {
      const dp = [[0.5,0.1],[0.15,0.5],[0.85,0.5],[0.5,0.9]];
      x = W * dp[i][0]; y = H * dp[i][1];
    }
    else if (layout === 'linear')
    {
      x = W * 0.1 + i * (W * 0.8 / (nodeList.length - 1 || 1));
      y = H / 2;
    }
    else
    {
      const angle = (2 * Math.PI * i / nodeList.length) - Math.PI / 2;
      x = cx + r * Math.cos(angle);
      y = cy + r * Math.sin(angle);
    }
    nodes[id] = { x, y, id };
    nodeColors[id] = C.nodeDef;
    distances[id] = Infinity;
    nodeLabels[id] = '';
  });

  edges = edgesData.map(([f, t, w]) => ({ from: f, to: t, weight: w }));
  clearLog();
  log(`Graph built: ${nodeList.length} nodes, ${edges.length} edges`, 'ev-info');
  showOverlay(false);
  redraw();
}

function redraw()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentAlgo === 'segment') { drawSegTree(); return; }
  if (!Object.keys(nodes).length) return;

  const directed = currentAlgo === 'dijkstra';
  const W = canvas.width;
  const NR = Math.max(18, Math.min(26, W * 0.04));

  edges.forEach(e =>
  {
    const a = nodes[e.from], b = nodes[e.to];
    if (!a || !b) return;
    const key = `${e.from}-${e.to}`;
    const col = edgeColors[key] || C.edgeDef;
    const lw  = edgeColors[key] ? 2.5 : 1.5;

    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;

    if (directed)
    {
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist, uy = dy / dist;
      const sx = a.x + ux * NR, sy = a.y + uy * NR;
      const ex = b.x - ux * (NR + 6), ey = b.y - uy * (NR + 6);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const angle = Math.atan2(ey - sy, ex - sx);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 11 * Math.cos(angle - 0.4), ey - 11 * Math.sin(angle - 0.4));
      ctx.lineTo(ex - 11 * Math.cos(angle + 0.4), ey - 11 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }
    else
    {
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist, uy = dy / dist;
      const sx = a.x + ux * NR, sy = a.y + uy * NR;
      const ex = b.x - ux * (NR + 6), ey = b.y - uy * (NR + 6);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const angle = Math.atan2(ey - sy, ex - sx);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }

    if (currentAlgo === 'dijkstra')
    {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.fillStyle = C.weightBg;
      ctx.fillRect(mx - 11, my - 9, 22, 16);
      ctx.fillStyle = C.weightText;
      ctx.font = 'bold 11px Segoe UI';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.weight, mx, my);
    }
    ctx.restore();
  });

  for (const id in nodes)
  {
    const n = nodes[id];
    const col = nodeColors[id] || C.nodeDef;

    if (col !== C.nodeDef) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, NR + 4, 0, Math.PI * 2);
      ctx.fillStyle = col + '44';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, NR, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = col === C.nodeDef ? C.nodeDefBorder : lightenNode(col);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = C.textPrimary;
    ctx.font = `bold ${Math.max(10, NR * 0.55)}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, n.x, n.y);

    if (nodeLabels[id]) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Segoe UI';
      ctx.fillText(nodeLabels[id], n.x, n.y + NR + 13);
    }
  }
}

function lightenNode(col) {
  const map = {
    [C.nodeActive]:  '#7c3aed',
    [C.nodeVisited]: '#059669',
    [C.nodePath]:    '#d97706',
    '#388bfd':       '#60a5fa',
    '#3fb950':       '#34d399',
    '#f78166':       '#f87171',
  };
  return map[col] || '#4b5563';
}

async function runAlgo() {
  if (!Object.keys(nodes).length) { alert('Build graph first'); return; }
  if (animRunning) return;

  for (const id in nodes)  { nodeColors[id] = C.nodeDef; nodeLabels[id] = ''; }
  for (const e of edges)   { edgeColors[`${e.from}-${e.to}`] = ''; edgeColors[`${e.to}-${e.from}`] = ''; }
  clearLog();
  redraw();

  const start = String(document.getElementById('startNode')?.value || Object.keys(nodes)[0]);
  if (!nodes[start]) { alert('Start node not found'); return; }
  animRunning = true;
  if      (currentAlgo === 'bfs')      await bfs(start);
  else if (currentAlgo === 'dfs')      await dfs(start);
  else if (currentAlgo === 'dijkstra') await dijkstra(start);
  animRunning = false;
}

async function bfs(start) {
  const adj = buildAdj(false);
  const vis = {}, queue = [start];
  vis[start] = true;
  nodeColors[start] = '#3b0764';
  log(`Start: ${start}`, 'ev-visit');
  redraw(); await sleep(animSpeed);

  while (queue.length) {
    const u = queue.shift();
    nodeColors[u] = C.nodeVisited;
    log(`Visit: ${u}`, 'ev-visit');
    redraw(); await sleep(animSpeed);

    for (const v of (adj[u] || [])) {
      if (!vis[v]) {
        vis[v] = true;
        nodeColors[v] = C.nodeActive;
        edgeColors[`${u}-${v}`] = C.edgeActive;
        edgeColors[`${v}-${u}`] = C.edgeActive;
        queue.push(v);
        log(`  Queue: ${v} (from ${u})`, 'ev-info');
        redraw(); await sleep(animSpeed * 0.5);
      }
    }
  }
  log('BFS complete ✓', 'ev-found');
}

async function dfs(start) {
  const adj = buildAdj(false);
  const vis = {};
  await dfsRec(start, null, adj, vis);
  log('DFS complete ✓', 'ev-found');
}

async function dfsRec(u, parent, adj, vis) {
  if (!animRunning) return;
  vis[u] = true;
  nodeColors[u] = '#7c2d12';
  log(`Visit: ${u}`, 'ev-visit');
  redraw(); await sleep(animSpeed);

  for (const v of (adj[u] || [])) {
    if (!vis[v]) {
      edgeColors[`${u}-${v}`] = '#fb923c';
      edgeColors[`${v}-${u}`] = '#fb923c';
      redraw(); await sleep(animSpeed * 0.4);
      await dfsRec(v, u, adj, vis);
      nodeColors[u] = C.nodeVisited;
      log(`  Backtrack to: ${u}`, 'ev-info');
      redraw(); await sleep(animSpeed * 0.3);
    }
  }
}

async function dijkstra(start) {
  const adj = {};
  for (const id in nodes) adj[id] = [];
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push({ node: e.to, w: e.weight });
  }

  const dist = {}, prev = {}, visited = new Set();
  for (const id in nodes) dist[id] = Infinity;
  dist[start] = 0;
  nodeLabels[start] = 'd=0';

  const pq = [[0, start]];
  log(`Start: ${start}, dist=0`, 'ev-info');

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    nodeColors[u] = C.nodeVisited;
    log(`Settle: ${u}  d=${d}`, 'ev-found');
    redraw(); await sleep(animSpeed);

    for (const { node: v, w } of (adj[u] || [])) {
      const newD = d + w;
      edgeColors[`${u}-${v}`] = '#f97316';
      redraw(); await sleep(animSpeed * 0.4);

      if (newD < dist[v]) {
        dist[v] = newD;
        prev[v] = u;
        nodeColors[v] = C.nodeActive;
        nodeLabels[v] = `d=${newD}`;
        edgeColors[`${u}-${v}`] = C.edgeActive;
        pq.push([newD, v]);
        log(`  Update ${v}: d=${newD} (via ${u})`, 'ev-visit');
        redraw(); await sleep(animSpeed * 0.4);
      }
      else
        {
        edgeColors[`${u}-${v}`] = edgeColors[`${u}-${v}`] || '';
        redraw();
      }
    }
  }

  log('--- Shortest paths from ' + start + ' ---', 'ev-info');
  for (const id in nodes)
  {
    if (id !== start && dist[id] < Infinity)
    {
      log(`  ${start}→${id}: ${dist[id]}`, 'ev-found');
      let cur = id;
      while (prev[cur])
      {
        edgeColors[`${prev[cur]}-${cur}`] = C.edgePath;
        cur = prev[cur];
      }
    }
    else if (dist[id] === Infinity && id !== start)
    {
      log(`  ${id}: unreachable`, 'ev-info');
    }
  }
  redraw();
  log('Dijkstra complete ✓', 'ev-found');
}

function buildAdj(directed)
{
  const adj = {};
  for (const id in nodes) adj[id] = [];
  for (const e of edges)
  {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
    if (!directed)
    {
      if (!adj[e.to]) adj[e.to] = [];
      adj[e.to].push(e.from);
    }
  }
  return adj;
}
