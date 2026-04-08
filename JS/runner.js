async function runAlgo()
{
  if (!Object.keys(nodes).length)
  {
    alert('Build the graph first.');
    return;
  }
  if (animRunning) return;

  for (const id in nodes)
  {
    nodeColors[id] = C.nodeDef;
    nodeLabels[id] = '';
  }
  for (const e of edges)
  {
    edgeColors[`${e.from}-${e.to}`] = '';
    edgeColors[`${e.to}-${e.from}`] = '';
  }
  clearLog();
  redraw();

  const startInput = document.getElementById('startNode');
  const start      = String(startInput ? startInput.value : Object.keys(nodes)[0]);

  if (!nodes[start])
  {
    alert(`Start node "${start}" not found in graph.`);
    return;
  }

  animRunning = true;

  if      (currentAlgo === 'bfs')      await bfs(start);
  else if (currentAlgo === 'dfs')      await dfs(start);
  else if (currentAlgo === 'dijkstra') await dijkstra(start);

  animRunning = false;
}
