var mymap = L.map("main-map", { zoomControl: false }).setView([1.35, 103.75], 12);
new L.Control.Zoom({ position: "topright" }).addTo(mymap);

// OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
  minZoom: 12,
  maxZoom: 18,
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | <a href="/about">About</a>'
}).addTo(mymap);

mymap.setMaxBounds([[1.16, 103.45], [1.49, 104.155]]);
