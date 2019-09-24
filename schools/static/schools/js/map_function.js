// create markers group
var schools = L.layerGroup();
schools.addTo(mymap);
var kindergartens = L.layerGroup();
kindergartens.addTo(mymap);
var geoLocations = L.layerGroup();
geoLocations.addTo(mymap);

// range layer
var range = L.layerGroup();
range.addTo(mymap);

var onekmRange;
var twokmRange;

// popup options
var customOptions = {
  maxWidth: "400",
  width: "200",
  className: "popupCustom"
};

// school marker config (font-awesome icon)
var schoolMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "school",
  markerColor: "blue"
});

// kindergarten marker config (font-awesome icon)
var kindergartenMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "child",
  markerColor: "orange"
});

var geoLocationMarker = L.AwesomeMarkers.icon({
    prefix: "fa",
    icon: "thumbtack",
    markerColor: "darkgreen"
});

function getGeoLocationMarker(geoLocation) { //todo: call APIs to convert geolocation to postal code
     var popup = '<b class="popup-title">Pinned Location</b><br/>';
     popup += '<p class="popup-content">' + geoLocation + '</p>';

    return L.marker(geoLocation, geoLocationMarker).bindPopup(popup,customOptions);
}

//create marker for the input data
function getMarker(school, markerType) {
  var popup = getPopup(school, markerType);
  var lat = school.geometry.coordinates[1];
  var lng = school.geometry.coordinates[0];

  return L.marker([lat, lng], { icon: markerType }).bindPopup(popup, customOptions);
}

// generate popup for the point on map
function getPopup(school, markerType) {
  var schoolType = markerType === schoolMarker ? "primary" : "kindergarten";
  var popup =
    '<b class="popup-title"><a href="/' + schoolType + "/" + school.properties.pk + '">' +
        school.properties.name + "</a></b><br/>";

  if (markerType === schoolMarker) {
    if (school.properties.kindergartens.length !== 0) {
      popup += '<p class="popup-content">The school has co-located kindergarten</p>';
    } else {
      popup += '<p class="popup-content">There is no co-located kindergartens</p>';
    }

    popup += '<div class="popup-btn-container">';
    popup +=
      '<button class="popup-btn circle btn btn-info one-km" data-toggle="button">1km</button>';
    popup +=
      '<button class="popup-btn circle btn btn-info two-km" data-toggle="button">2km</button></br></div>';
  }
  return popup;
}

//popup functions
mymap.on("popupopen", function(ev) {
  if (range.hasLayer(onekmRange)) {
    $("button.circle.one-km").addClass("active");
  }
  if (range.hasLayer(twokmRange)) {
    $("button.circle.two-km").addClass("active");
  }
  $("button.circle").click(function() {
    if (!$(this).hasClass("active")) {
      if ($(this).hasClass("one-km") && !range.hasLayer(onekmRange)) {
        range.addLayer(onekmRange);
      } else if ($(this).hasClass("two-km") && !range.hasLayer(twokmRange)) {
        range.addLayer(twokmRange);
      }
    } else {
      if ($(this).hasClass("one-km")) {
        range.removeLayer(onekmRange);
      } else if ($(this).hasClass("two-km")) {
        range.removeLayer(twokmRange);
      }
    }
  });
});


mymap.on('locationfound', function (locationEvent) {
  showCurrLocation(locationEvent.latlng);
});

function locateUser() {
  mymap.locate({ setView: true });

}


// set map center to the specific point
function goTo(lat, lng) {
  if (mymap.getZoom() < 14) {
    mymap.flyTo([lat, lng], 14);
  } else {
    mymap.flyTo([lat, lng]);
  }
}

function clearAllLayers() {
  schools.clearLayers();
  kindergartens.clearLayers();
  range.clearLayers();
  geoLocations.clearLayers()
}

function showCurrLocation(latlng){
  clearAllLayers();
  var marker = getGeoLocationMarker(latlng);
  geoLocations.addLayer(marker);
}

function showOnMap(type, id, move, clear_layer=true) {

  if (clear_layer){
    clearAllLayers();
  }

  $.ajax({
    type: "GET",
    url: "api/get-detail/",
    data: {
      type: type,
      id: id
    },
    async: true,
    success: function(result) {
      var response = JSON.parse(result).features;
      if (response.length > 0) {
        response.forEach(function(point) {
          var marker;
          if (type === "school") {
            marker = getMarker(point, schoolMarker);
            schools.addLayer(marker);

            if (point.properties.kindergartens.length !== 0) {
              for (var i = 0, len = point.properties.kindergartens.length; i < len; i++) {
                showOnMap("kindergarten", point.properties.kindergartens[i], false, false);
              }
            }
          } else if (type === "kindergarten") {
            marker = getMarker(point, kindergartenMarker);
            kindergartens.addLayer(marker);
          }
          if (move === true) {
            var lat = point.geometry.coordinates[1];
            var lng = point.geometry.coordinates[0];
            onekmRange = L.circle([lat, lng], { radius: 1000, color: "red", opacity: 0.3 });
            twokmRange = L.circle([lat, lng], { radius: 2000, opacity: 0.3 });
            goTo(lat, lng);
          }
        });
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
}
