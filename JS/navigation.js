const ALGO_META =
{
  segment:  { title: 'Segment Tree',          badge: 'Range Sum Query' },
  bfs:      { title: 'Breadth-First Search',  badge: 'Graph' },
  dfs:      { title: 'Depth-First Search',    badge: 'Graph' },
  dijkstra: { title: "Dijkstra's Algorithm",  badge: 'Weighted Graph' },
};

function openAlgo(algo)
{
  currentAlgo = algo;
  animRunning = false;

  nodes = {}; edges = []; nodeColors = {}; edgeColors = {};
  distances = {}; nodeLabels = {};
  stArr = []; stTree = []; stN = 0; stNodeColors = {};

  document.getElementById('menuScreen').classList.remove('active');
  document.getElementById('algoScreen').classList.add('active');

  const meta = ALGO_META[algo];
  document.getElementById('algoTitle').textContent = meta.title;
  document.getElementById('algoBadge').textContent = meta.badge;

  buildSidebar();
  setTimeout(() => { resizeCanvas(); showOverlay(true); }, 50);
}

function goBack()
{
  animRunning = false;
  document.getElementById('algoScreen').classList.remove('active');
  document.getElementById('menuScreen').classList.add('active');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function buildSidebar()
{
  const sb = document.getElementById('sidebar');
  sb.innerHTML = (currentAlgo === 'segment') ? segmentSidebar() : graphSidebar();
}

function segmentSidebar()
{
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

function graphSidebar()
{
  const isDijk    = currentAlgo === 'dijkstra';
  const edgeHelp  = isDijk
    ? 'e.g. 0-1:4 0-2:2 1-3:5 2-1:1 2-3:8'
    : 'e.g. 0-1 0-2 1-3 2-4';

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
        oninput="animSpeed=+this.value; this.nextElementSibling.textContent=this.value+'ms'"
        style="flex:1">
      <span>600ms</span>
    </div>
  </div>
  <div class="panel"><h4>Log</h4><div class="log" id="log"></div></div>`;
}
