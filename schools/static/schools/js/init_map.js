var mymap = L.map('main-map', {zoomControl: false}).setView([1.35, 103.75], 12);
new L.Control.Zoom({position: 'bottomleft'}).addTo(mymap);

// OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
    foo: 'bar',
    minZoom: 12,
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(mymap);

//OneMap tile layer
// L.tileLayer('https://maps-{s}.onemap.sg/v3/Original/{z}/{x}/{y}.png', {
//     minZoom: 12,
//     maxZoom: 18,
//     attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
// }).addTo(mymap);

//set map Max Bounds
mymap.setMaxBounds([[1.16, 103.45], [1.49, 104.155]]);
