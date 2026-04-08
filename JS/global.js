let currentAlgo = '';
let animRunning  = false;
let animSpeed    = 600;

const canvas = document.getElementById('mainCanvas');
const ctx    = canvas.getContext('2d');

let nodes      = {};
let edges      = [];
let nodeColors = {};
let edgeColors = {};
let distances  = {};
let nodeLabels = {};

let stArr        = [];
let stTree       = [];
let stN          = 0;
let stNodeColors = {};

const C =
{
  nodeDef:       '#0d0d0d',
  nodeDefBorder: '#2a2a2a',
  nodeActive:    '#3b0764',
  nodeVisited:   '#022c22',
  nodePath:      '#1c1917',

  edgeDef:     '#1f1f1f',
  edgeActive:  '#a78bfa',
  edgeVisited: '#34d399',
  edgePath:    '#fbbf24',

  textPrimary: '#e2e8f0',
  textMuted:   '#6b7280',

  segDefault: '#0d0d0d',
  segActive:  '#7c2d12',
  segMatch:   '#064e3b',
  segPartial: '#1a1a2e',

  weightBg:   '#0a0a0a',
  weightText: '#fb923c',
};
