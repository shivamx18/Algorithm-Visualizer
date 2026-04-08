async function dfs(start)
{
  const adj = buildAdj(false);
  const vis  = {};

  await _dfsRec(start, null, adj, vis);

  log('DFS complete ✓', 'ev-found');
}

async function _dfsRec(u, parent, adj, vis)
{
  if (!animRunning) return;

  vis[u]            = true;
  nodeColors[u]     = '#7c2d12';
  log(`Visit: ${u}`, 'ev-visit');
  redraw();
  await sleep(animSpeed);

  for (const v of (adj[u] || [])) {
    if (!vis[v])
    {
      edgeColors[`${u}-${v}`] = '#fb923c';
      edgeColors[`${v}-${u}`] = '#fb923c';
      redraw();
      await sleep(animSpeed * 0.4);

      await _dfsRec(v, u, adj, vis);

      nodeColors[u] = C.nodeVisited;
      log(`  Backtrack to: ${u}`, 'ev-info');
      redraw();
      await sleep(animSpeed * 0.3);
    }
  }
}
