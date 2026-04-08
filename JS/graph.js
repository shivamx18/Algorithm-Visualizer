const PRESETS =
{
  bfs1:
  {
    nodes:  ['0','1','2','3','4','5','6'],
    edges:  [['0','1',1],['0','2',1],['1','3',1],['1','4',1],['2','5',1],['2','6',1]],
    layout: 'tree',
  },
  bfs2:
  {
    nodes:  ['0','1','2','3','4','5'],
    edges:  [['0','1',1],['0','3',1],['1','2',1],['1','4',1],['3','4',1],['4','5',1],['2','5',1]],
    layout: 'grid',
  },
  bfs3:
  {
    nodes:  ['0','1','2','3','4','5'],
    edges:  [['0','1',1],['1','2',1],['3','4',1],['4','5',1]],
    layout: 'circle',
  },
  dijkstra1:
  {
    nodes:  ['0','1','2','3','4'],
    edges:  [['0','1',4],['0','2',2],['1','3',5],['2','1',1],['2','3',8],['2','4',10],['3','4',2],['1','4',6]],
    layout: 'circle',
  },
  dijkstra2:
  {
    nodes:  ['A','B','C','D'],
    edges:  [['A','B',1],['A','C',4],['B','C',2],['B','D',5],['C','D',1]],
    layout: 'diamond',
  },
  dijkstra3:
  {
    nodes:  ['0','1','2','3','4'],
    edges:  [['0','1',3],['1','2',2],['2','3',4],['3','4',1],['0','2',10]],
    layout: 'linear',
  },
};

function loadPreset(key)
{
  const p = PRESETS[key];
  if (!p) return;

  document.getElementById('nodesIn').value = p.nodes.join(' ');
  document.getElementById('edgesIn').value = p.edges
    .map(([u, v, w]) => currentAlgo === 'dijkstra' ? `${u}-${v}:${w}` : `${u}-${v}`)
    .join(' ');

  buildGraphFromData(p.nodes, p.edges, p.layout);
}

function buildGraph()
{
  const rawN     = document.getElementById('nodesIn').value.trim().split(/\s+/);
  const rawE     = document.getElementById('edgesIn').value.trim().split(/\s+/).filter(Boolean);
  const edgesData = [];

  for (const e of rawE)
  {
    const parts = e.split(':');
    const uv    = parts[0].split('-');
    if (uv.length !== 2) { alert(`Bad edge: ${e}`); return; }
    edgesData.push([uv[0], uv[1], parts[1] ? +parts[1] : 1]);
  }

  buildGraphFromData(rawN, edgesData, 'circle');
}

function buildGraphFromData(nodeList, edgesData, layout)
{
  nodes = {}; edges = [];
  nodeColors = {}; edgeColors = {};
  distances  = {}; nodeLabels = {};

  const W  = canvas.width,  H  = canvas.height;
  const cx = W / 2,         cy = H / 2;
  const r  = Math.min(W, H) * 0.36;

  nodeList.forEach((id, i) =>
  {
    let x, y;

    if (layout === 'tree')
    {
      const row    = i === 0 ? 0 : i <= 2 ? 1 : 2;
      const cols   = i === 0 ? 1 : i <= 2 ? 2 : 4;
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
      x = W * dp[i][0];
      y = H * dp[i][1];

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

    nodes[id]      = { x, y, id };
    nodeColors[id] = C.nodeDef;
    distances[id]  = Infinity;
    nodeLabels[id] = '';
  });

  edges = edgesData.map(([f, t, w]) => ({ from: f, to: t, weight: w }));

  clearLog();
  log(`Graph built: ${nodeList.length} nodes, ${edges.length} edges`, 'ev-info');
  showOverlay(false);
  redraw();
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

function redraw()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentAlgo === 'segment') { drawSegTree(); return; }
  if (!Object.keys(nodes).length) return;

  const directed = currentAlgo === 'dijkstra';
  const W  = canvas.width;
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
    ctx.lineWidth   = lw;

    const dx   = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux   = dx / dist,  uy = dy / dist;
    const sx   = a.x + ux * NR,        sy = a.y + uy * NR;
    const ex   = b.x - ux * (NR + 6),  ey = b.y - uy * (NR + 6);

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const angle = Math.atan2(ey - sy, ex - sx);
    const aSize = directed ? 11 : 10;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - aSize * Math.cos(angle - 0.4), ey - aSize * Math.sin(angle - 0.4));
    ctx.lineTo(ex - aSize * Math.cos(angle + 0.4), ey - aSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    if (currentAlgo === 'dijkstra')
    {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.fillStyle = C.weightBg;
      ctx.fillRect(mx - 11, my - 9, 22, 16);
      ctx.fillStyle    = C.weightText;
      ctx.font         = 'bold 11px Segoe UI';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.weight, mx, my);
    }

    ctx.restore();
  });

  for (const id in nodes)
  {
    const n   = nodes[id];
    const col = nodeColors[id] || C.nodeDef;

    if (col !== C.nodeDef)
    {
      ctx.beginPath();
      ctx.arc(n.x, n.y, NR + 4, 0, Math.PI * 2);
      ctx.fillStyle = col + '44';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, NR, 0, Math.PI * 2);
    ctx.fillStyle   = col;
    ctx.fill();
    ctx.strokeStyle = col === C.nodeDef ? C.nodeDefBorder : lightenNode(col);
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.fillStyle    = C.textPrimary;
    ctx.font         = `bold ${Math.max(10, NR * 0.55)}px Segoe UI`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, n.x, n.y);

    if (nodeLabels[id])
    {
      ctx.fillStyle = '#6b7280';
      ctx.font      = '10px Segoe UI';
      ctx.fillText(nodeLabels[id], n.x, n.y + NR + 13);
    }
  }
}
