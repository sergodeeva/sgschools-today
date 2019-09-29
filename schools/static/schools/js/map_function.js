// create markers group
var schoolsLG = L.layerGroup();
schoolsLG.addTo(mymap);
var kindergartensLG = L.layerGroup();
kindergartensLG.addTo(mymap);
var geoCenterLG = L.layerGroup();
geoCenterLG.addTo(mymap);

// rangeCirclesLG layer
var rangeCirclesLG = L.layerGroup();
rangeCirclesLG.addTo(mymap);

var onekmRange;
var twokmRange;

// popup options
var customOptions = {
  maxWidth: "380",
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

//container ids
var id_1km_btn = '1km-btn';
var id_2km_btn = '2km-btn';

function getGeoLocationMarker(geoLocation, poptitle=null) { //todo: call APIs to convert geolocation to postal code
  let centerGeo = [geoLocation.lat,geoLocation.lng];
  var popup = '<b class="popup-title">'+poptitle+'</b><br/>';
  popup += '<p class="popup-content">' + 'add translated geo/postal info here'+ '</p>';
  popup += '<div class="popup-btn-container">';
  popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1km</button>';
  popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2km</button></br></div>';
  return L.marker(geoLocation, geoLocationMarker).bindPopup(popup,customOptions);
}

//create marker for the input data
function getMarker(school, schoolType, markerType) {
  var popup = getPopup(school, schoolType, markerType);
  var lat = school.geometry.coordinates[1];
  var lng = school.geometry.coordinates[0];

  return L.marker([lat, lng], { icon: markerType }).bindPopup(popup, customOptions);
}

// generate popup for the point on map
function getPopup(school, schoolType, markerType) {
  var lat = school.geometry.coordinates[1];
  var lng = school.geometry.coordinates[0];
  let centerGeo = [lat, lng];
  var path = schoolType === "PrimarySchool" ? "primary" : schoolType === "SecondarySchool" ? "secondary" : "kindergarten";

  var popup =
    '<strong class="popup-title"><a href="/' + path + "/" + school.properties.pk + '">' +
        school.properties.name + "</a></strong><br/> " + school.properties.address + '<br/>' +
        '<a target="_blank" href="mailto:' + school.properties.email_address + '">' + school.properties.email_address + '</a><br/>' +
        '<a href="tel:' + school.properties.phone_number + '">' + school.properties.phone_number + '</a><br/>' +
        '<a target="_blank" href="' + school.properties.website_url + '">' + school.properties.website_url + '</a><br/>';

  if (schoolType === "PrimarySchool") {
    if (school.properties.kindergartens.length !== 0) {
      popup += '<p class="popup-content">The school has co-located kindergarten</p>';
    } else {
      popup += '<p class="popup-content">There is no co-located kindergartens</p>';
    }

    popup += '<div class="popup-btn-container">';
    popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1km</button>';
    popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2km</button></br></div>';
  }
  return popup;
}

function handleKmBtnClick(btnId, geoLocation){
  if(btnId === id_1km_btn){
    if (rangeCirclesLG.hasLayer(onekmRange)) {
      rangeCirclesLG.removeLayer(onekmRange);
    }
    else {
      rangeCirclesLG.addLayer(onekmRange);
      showSchoolsWithin(geoLocation, 1000);
    }

  }
  else if(btnId === id_2km_btn){
    if (rangeCirclesLG.hasLayer(twokmRange)) {
      rangeCirclesLG.removeLayer(twokmRange);
    }
    else {
      rangeCirclesLG.addLayer(twokmRange);
      showSchoolsWithin(geoLocation, 2000);
    }
  }
}

function showSchoolsWithin(centerCoo, radius){
  g_all_schools.forEach(function (item, idx, arr) {
    let lat = item.geometry.coordinates[1];
    let lng = item.geometry.coordinates[0];
    let itemGeo = [lat, lng];
    let distance = getDistanceBetween(centerCoo, itemGeo);
    if (distance <= radius){
      if (item.school_type === 'PrimarySchool'){ //todo : change APIs to support all schoolsLG
        var marker = getMarker(item, item.school_type, schoolMarker);
        if(!schoolsLG.hasLayer(marker)){ schoolsLG.addLayer(marker);}
        else {schoolsLG.removeLayer(marker);}
      }
    }
  })
}

//p1 and p2 are Latlng type
function getDistanceBetween(p1, p2){
    let ll1 = L.latLng([p1[0],p1[1]]);
    let ll2 = L.latLng([p2[0],p2[1]]);
    return ll1.distanceTo(ll2); //unit meters
}

mymap.on('locationfound', function (locationEvent) {
  flyTo(locationEvent.latlng);
  var oppMsgTitle = 'Detected Location: ' + locationEvent.latlng.lat.toString() +', '+locationEvent.latlng.lng.toString();
  showCurrLocation(locationEvent.latlng, oppMsgTitle);
});

//triggers 'locationfound' event
function locateUser() {
  mymap.locate({ setView: true });
}


// set map center to the specific point
function flyTo(coordinates) {
  mymap.flyTo(coordinates, 15);
}

function clearAllLayers() {
  schoolsLG.clearLayers();
  kindergartensLG.clearLayers();
  rangeCirclesLG.clearLayers();
  geoCenterLG.clearLayers()
}

function showCurrLocation(latlng, poptitle=null){
  clearAllLayers();
  prepareCircleMarker(latlng);
  var marker = getGeoLocationMarker(latlng, poptitle);
  geoCenterLG.addLayer(marker);
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
          if (type === "PrimarySchool") {
            marker = getMarker(point, type, schoolMarker);
            schoolsLG.addLayer(marker);

            if (point.properties.kindergartens.length !== 0) {
              for (var i = 0, len = point.properties.kindergartens.length; i < len; i++) {
                showOnMap("kindergarten", point.properties.kindergartens[i], false, false);
              }
            }
          } else if (type === "Kindergarten" || type == "SecondarySchool") {
            marker = getMarker(point, type, kindergartenMarker);
            kindergartensLG.addLayer(marker);
          }
          if (move === true) {
            var lat = point.geometry.coordinates[1];
            var lng = point.geometry.coordinates[0];
            var coordinates = [lat, lng];
            prepareCircleMarker(coordinates);
            flyTo(coordinates);
          }
        });
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function prepareCircleMarker(coordinates) {
  onekmRange = L.circle(coordinates, { radius: 1000, color: "red", opacity: 0.3 });
  twokmRange = L.circle(coordinates, { radius: 2000, opacity: 0.3 });
}

//todo need to study loading performace of ll labrary