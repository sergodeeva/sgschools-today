var mymap = L.map('main-map').setView([1.32, 103.83], 12);

//set OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
    foo: 'bar',
    minZoom: 12,
    maxZoom: 17,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(mymap);

//set map Max Bounds
mymap.setMaxBounds([[1.1, 103.5], [1.5, 104.2]]);
