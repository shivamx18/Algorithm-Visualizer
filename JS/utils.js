const sleep = ms => new Promise(r => setTimeout(r, ms));

function resizeCanvas()
{
  const area    = canvas.parentElement;
  canvas.width  = area.clientWidth;
  canvas.height = area.clientHeight;
  redraw();
}
window.addEventListener('resize', resizeCanvas);

function showOverlay(visible)
{
  document.getElementById('overlayMsg').style.display = visible ? '' : 'none';
}

function log(msg, cls = 'ev-info')
{
  const el = document.getElementById('log');
  if (!el) return;
  const line = document.createElement('div');
  line.className  = cls;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function clearLog()
{
  const el = document.getElementById('log');
  if (el) el.innerHTML = '';
}

function lightenNode(col)
{
  const map =
  {
    [C.nodeActive]:  '#7c3aed',
    [C.nodeVisited]: '#059669',
    [C.nodePath]:    '#d97706',
    '#388bfd':       '#60a5fa',
    '#3fb950':       '#34d399',
    '#f78166':       '#f87171',
    '#3b0764':       '#7c3aed',
    '#7c2d12':       '#b45309',
  };
  return map[col] || '#4b5563';
}

function lightenSeg(hex)
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
