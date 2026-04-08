async function bfs(start)
{
  const adj = buildAdj(false);
  const vis  = {};
  const queue = [start];
  vis[start] = true;

  nodeColors[start] = C.nodeActive;
  log(`Start: ${start}`, 'ev-visit');
  redraw();
  await sleep(animSpeed);

  while (queue.length)
  {
    if (!animRunning) return;

    const u = queue.shift();

    nodeColors[u] = C.nodeVisited;
    log(`Visit: ${u}`, 'ev-visit');
    redraw();
    await sleep(animSpeed);

    for (const v of (adj[u] || []))
    {
      if (!vis[v])
      {
        vis[v] = true;

        nodeColors[v]            = C.nodeActive;
        edgeColors[`${u}-${v}`]  = C.edgeActive;
        edgeColors[`${v}-${u}`]  = C.edgeActive;
        queue.push(v);

        log(`  Enqueue: ${v}  (from ${u})`, 'ev-info');
        redraw();
        await sleep(animSpeed * 0.5);
      }
    }
  }

  log('BFS complete ✓', 'ev-found');
}
