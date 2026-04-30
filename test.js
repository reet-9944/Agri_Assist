const query = `[out:json];(node["shop"="agrarian"](around:50000,30.9008,75.8573););out body;`;
fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query })
  .then(r => r.json())
  .then(d => console.log(d.elements))
  .catch(console.error);
