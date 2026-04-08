async function dijkstra(start)
{
  const adj = {};
  for (const id in nodes) adj[id] = [];
  for (const e of edges)
  {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push({ node: e.to, w: e.weight });
  }

  const dist    = {};
  const prev    = {};
  const visited = new Set();

  for (const id in nodes) { dist[id] = Infinity; }
  dist[start]        = 0;
  nodeLabels[start]  = 'd=0';

  const pq = [[0, start]];
  log(`Start: ${start},  dist = 0`, 'ev-info');

  while (pq.length)
  {
    if (!animRunning) return;

    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;

    visited.add(u);
    nodeColors[u] = C.nodeVisited;
    log(`Settle: ${u}   d = ${d}`, 'ev-found');
    redraw();
    await sleep(animSpeed);

    for (const { node: v, w } of (adj[u] || []))
    {
      const newD = d + w;

      edgeColors[`${u}-${v}`] = '#f97316';
      redraw();
      await sleep(animSpeed * 0.4);

      if (newD < dist[v])
      {
        dist[v]           = newD;
        prev[v]           = u;
        nodeColors[v]     = C.nodeActive;
        nodeLabels[v]     = `d=${newD}`;
        edgeColors[`${u}-${v}`] = C.edgeActive;

        pq.push([newD, v]);
        log(`  Relax ${u} → ${v}:  d = ${newD}`, 'ev-visit');
        redraw();
        await sleep(animSpeed * 0.4);
      }
      else
      {
        edgeColors[`${u}-${v}`] = edgeColors[`${u}-${v}`] || '';
        redraw();
      }
    }
  }

  log(`--- Shortest paths from ${start} ---`, 'ev-info');

  for (const id in nodes)
  {
    if (id === start) continue;

    if (dist[id] < Infinity)
    {
      log(`  ${start} → ${id}:  cost = ${dist[id]}`, 'ev-found');

      let cur = id;
      while (prev[cur])
      {
        edgeColors[`${prev[cur]}-${cur}`] = C.edgePath;
        cur = prev[cur];
      }
    }
    else
    {
      log(`  ${id}: unreachable`, 'ev-info');
    }
  }

  redraw();
  log('Dijkstra complete ✓', 'ev-found');
}
