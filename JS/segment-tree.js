function buildSegTree()
{
  const raw = document.getElementById('arrInput').value.trim().split(/\s+/);
  stArr = raw.map(Number);

  if (stArr.some(isNaN) || stArr.length === 0)
  {
    alert('Invalid array — enter space-separated numbers.');
    return;
  }

  stN          = stArr.length;
  stTree       = new Array(4 * stN).fill(0);
  stNodeColors = {};

  _stBuild(1, 0, stN - 1);

  clearLog();
  log(`Built segment tree for [${stArr.join(', ')}]`, 'ev-info');
  showOverlay(false);
  drawSegTree();
}

function _stBuild(node, l, r)
{
  if (l === r) { stTree[node] = stArr[l]; return; }
  const m = (l + r) >> 1;
  _stBuild(2 * node,     l,     m);
  _stBuild(2 * node + 1, m + 1, r);
  stTree[node] = stTree[2 * node] + stTree[2 * node + 1];
}

async function querySegTree()
{
  if (stN === 0) { alert('Build the tree first.'); return; }

  const L = +document.getElementById('ql').value;
  const R = +document.getElementById('qr').value;

  if (isNaN(L) || isNaN(R) || L < 0 || R >= stN || L > R)
  {
    alert(`Invalid range. Indices must be between 0 and ${stN - 1}.`);
    return;
  }

  stNodeColors = {};
  clearLog();
  log(`Querying sum [${L}, ${R}]`, 'ev-info');

  const result = await _stQuery(1, 0, stN - 1, L, R);

  log(`Result: ${result}`, 'ev-found');
  drawSegTree();
}

async function _stQuery(node, l, r, ql, qr)
{
  stNodeColors[node] = C.segActive;
  drawSegTree();
  await sleep(animSpeed * 0.5);

  if (ql <= l && r <= qr)
  {
    stNodeColors[node] = C.segMatch;
    drawSegTree();
    log(`  Node ${node} [${l},${r}] = ${stTree[node]} ✓`, 'ev-found');
    await sleep(animSpeed * 0.5);
    return stTree[node];
  }

  if (qr < l || r < ql)
  {
    stNodeColors[node] = '#111111';
    drawSegTree();
    log(`  Node ${node} [${l},${r}] out of range`, 'ev-info');
    return 0;
  }

  const m     = (l + r) >> 1;
  const left  = await _stQuery(2 * node,     l,     m, ql, qr);
  const right = await _stQuery(2 * node + 1, m + 1, r, ql, qr);

  stNodeColors[node] = C.segPartial;
  drawSegTree();
  return left + right;
}

async function updateSegTree()
{
  if (stN === 0) { alert('Build the tree first.'); return; }

  const idx = +document.getElementById('ui').value;
  const val = +document.getElementById('uv').value;

  if (isNaN(idx) || idx < 0 || idx >= stN)
  {
    alert(`Index must be between 0 and ${stN - 1}.`);
    return;
  }

  stArr[idx]   = val;
  stNodeColors = {};
  clearLog();
  log(`Updating index ${idx} → ${val}`, 'ev-info');

  await _stUpdate(1, 0, stN - 1, idx, val);

  log('Update complete', 'ev-found');
  drawSegTree();
}

async function _stUpdate(node, l, r, idx, val)
{
  stNodeColors[node] = C.segActive;
  drawSegTree();
  await sleep(animSpeed * 0.4);

  if (l === r)
  {
    stTree[node]       = val;
    stNodeColors[node] = C.segMatch;
    drawSegTree();
    return;
  }

  const m = (l + r) >> 1;
  if (idx <= m) await _stUpdate(2 * node,     l,     m, idx, val);
  else          await _stUpdate(2 * node + 1, m + 1, r, idx, val);

  stTree[node]       = stTree[2 * node] + stTree[2 * node + 1];
  stNodeColors[node] = C.segPartial;
  drawSegTree();
  await sleep(animSpeed * 0.3);
}

function drawSegTree()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (stN === 0) return;

  const positions = {};
  const depth     = Math.ceil(Math.log2(stN)) + 1;
  const W = canvas.width, H = canvas.height;
  const nodeR  = Math.max(18, Math.min(28, W / (stN * 2.5)));
  const levelH = Math.min(90, (H - 40) / depth);

  function computePos(node, l, r, d)
  {
    if (node >= 4 * stN || stTree[node] === undefined) return;
    const cx = W * ((l + r + 1) / (2 * stN));
    const cy = 40 + d * levelH;
    positions[node] = { x: cx, y: cy, l, r };
    if (l === r) return;
    const m = (l + r) >> 1;
    computePos(2 * node,     l,     m, d + 1);
    computePos(2 * node + 1, m + 1, r, d + 1);
  }
  computePos(1, 0, stN - 1, 0);

  for (const nid in positions)
  {
    const p     = positions[nid];
    const left  = positions[2 * nid];
    const right = positions[2 * nid + 1];
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth   = 1.5;
    if (left)  { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(left.x,  left.y);  ctx.stroke(); }
    if (right) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(right.x, right.y); ctx.stroke(); }
  }

  for (const nid in positions)
  {
    const { x, y, l, r } = positions[nid];
    const col    = stNodeColors[nid] || C.segDefault;
    const border = stNodeColors[nid] ? lightenSeg(col) : '#2a2a2a';

    ctx.beginPath();
    ctx.arc(x, y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle   = col;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle    = '#e2e8f0';
    ctx.font         = `bold ${Math.max(10, nodeR * 0.6)}px Segoe UI`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stTree[nid] ?? '', x, y);

    if (nodeR > 16)
    {
      ctx.fillStyle = '#4b5563';
      ctx.font      = `${Math.max(8, nodeR * 0.4)}px Segoe UI`;
      ctx.fillText(`[${l},${r}]`, x, y + nodeR + 10);
    }
  }
}
