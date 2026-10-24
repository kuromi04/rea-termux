const fs = require('fs');
const commands = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/Projects/rea-termux/rea-commands.json', 'utf8'));

// Categorización neural
const clusters = [
  { id: 'CORE', label: 'Core & Engine', color: '#00f3ff', match: /^(analyze|doctor|setup|uninstall|update|providers|capabilities|evidence|evaluate)/ },
  { id: 'ANDROID', label: 'Android & ADB', color: '#00ff88', match: /^(capture-adb|collect-adb|decode-android|project-android|pull-adb|push-adb|read-adb|resolve-adb|search-android|start-adb|stop-adb|trace-android|uninstall-adb)/ },
  { id: 'BINARY', label: 'Native & Binary', color: '#ff0055', match: /^(address-to|annotate-native|cutter|debug-with|decompile|demangle|disassemble|dump-memory|find-|inspect-|list-|locate-|modify-|patch-|read-bytes|resolve-native|search-bytes|trace-dylib|trace-native|xrefs)/ },
  { id: 'WEB_JS', label: 'Web & JavaScript', color: '#ffe600', match: /^(analyze-javascript|analyze-web|capture-browser|capture-electron|capture-web|compare-application|compare-javascript|compare-source|compare-web|discover-webmcp|extract-sourcemaps|format-javascript|reconcile-javascript|recover-javascript|trace-javascript|trace-web)/ },
  { id: 'MANAGED', label: 'Managed & .NET & WASM', color: '#b537f2', match: /^(compare-managed|compare-wasm|project-managed|verify-managed|inspect-managed|inspect-wasm|decode-interface)/ },
  { id: 'ENV', label: 'Agent Env & Replay', color: '#ff8800', match: /^(environment-|build-reconstruction|export-|import-|list-environment)/ }
];

const nodes = [];
const links = [];

// Nodo Central
nodes.push({
  id: 'REA_ROOT',
  name: 'REA 6.7.0 CORE',
  category: 'ROOT',
  isCluster: true,
  val: 28,
  color: '#ffffff',
  desc: 'Reverse Engineer Anything - Unified Neural Matrix',
  cmd: 'rea --help'
});

// Nodos Clusters
clusters.forEach(c => {
  nodes.push({
    id: c.id,
    name: c.label,
    category: 'CLUSTER',
    isCluster: true,
    val: 18,
    color: c.color,
    desc: `Agrupación neuronal: ${c.label}. Selecciona una de sus neuronas hijas para ejecutar un comando específico.`,
    cmd: `rea --help`
  });
  links.push({
    source: 'REA_ROOT',
    target: c.id,
    color: c.color
  });
});

// Nodos Comandos (Neuronas operativas)
commands.forEach(cmd => {
  let matchedCluster = clusters.find(c => c.match.test(cmd.name));
  if (!matchedCluster) {
    matchedCluster = clusters[0]; // fallback CORE
  }
  nodes.push({
    id: cmd.name,
    name: cmd.name,
    category: matchedCluster.id,
    isCluster: false,
    val: 8,
    color: matchedCluster.color,
    desc: cmd.desc,
    cmd: `rea ${cmd.name}`
  });
  links.push({
    source: matchedCluster.id,
    target: cmd.name,
    color: matchedCluster.color
  });
});

const graphData = { nodes, links };
fs.writeFileSync('/data/data/com.termux/files/home/Projects/rea-termux/graph-data.json', JSON.stringify(graphData));
console.log('Graph data regenerated with correct command mapping');
