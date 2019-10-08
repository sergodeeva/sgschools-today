// create markers group
var schoolsLG = L.layerGroup();
schoolsLG.addTo(mymap);

var geoCenterLG = L.layerGroup();
geoCenterLG.addTo(mymap);

// rangeCircles group
var rangeCircle1KmLG = L.layerGroup();
rangeCircle1KmLG.addTo(mymap);

var rangeCircle2KmLG = L.layerGroup();
rangeCircle2KmLG.addTo(mymap);

var oneKmCircleMaker;
var twoKmCircleMaker;

// popup options
var customOptions = {
  maxWidth: "380",
  width: "200",
  className: "popupCustom"
};

// school marker config (font-awesome icon)
var primarySchoolMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "school",
  markerColor: "blue"
});

// school marker config (font-awesome icon)
var secondarySchoolMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "square-root-alt",
  markerColor: "green"
});

// kindergarten marker config (font-awesome icon)
var kindergartenMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "child",
  markerColor: "orange"
});

var geoLocationMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "globe-asia",
  markerColor: "purple"
});

//container ids
var id_1km_btn = '1km-btn';
var id_2km_btn = '2km-btn';

//markers stored in this dictionary is used for instance reference tracing
let markers = {
  's':{}, //for schools {[lat, lng]: maker_instance}
  'u':{}, //for user's current location {[lat, lng]: maker_instance}
};

function populateMakerInstance(keys, outArr){
  keys.forEach(function (k , i , a) {
    if (k in markers['s']){
      outArr.push(markers['s'][k]);
    }
    if (k in markers['u']){
      outArr.push(markers['u'][k]);
    }
  });
}

function cacheMarker(type, key, marker){
  if (type === 's'){
    markers[type][key] = marker;
  }
  else if (type === 'u'){
    markers[type] = {}; //must clear to avoid mem leak
    markers[type][key] = marker;
  }
}

function getGeoLocationMarker(geoLocation, poptitle) {
  let centerGeo = [geoLocation.lat,geoLocation.lng];
  var popup = '<strong class="popup-title"><a href="" onclick="return false;">'+ poptitle[0] +'</a></strong></br><a href="" onclick="return false;">'+ poptitle[1] + '</a><p>' + poptitle[2] +'</p>';
  popup += '<div class="popup-btn-container">';
  popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1 Km</button>';
  popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2 Km</button></br></div>';
  let marker =  L.marker(geoLocation, {icon: geoLocationMarker}).bindPopup(popup,customOptions);
  cacheMarker('u',centerGeo, marker);
  return marker;
}

//create marker for the input data
function getMarker(school) {
  let lat = school.geometry.coordinates[1];
  let lng = school.geometry.coordinates[0];
  let centerGeo = [lat, lng];

  var markerType = school.school_type === "pri" ? primarySchoolMarker : school.school_type === "sec" ? secondarySchoolMarker : kindergartenMarker;

  var popup = getPopup(school);

  let marker= L.marker(centerGeo, { icon: markerType }).bindPopup(popup, customOptions);
  cacheMarker('s', centerGeo, marker);
  return marker;
}

// generate popup for the point on map
function getPopup(school) {
  var lat = school.geometry.coordinates[1];
  var lng = school.geometry.coordinates[0];
  let centerGeo = [lat, lng];
  var path = school.school_type === "pri" ? "primary" : school.school_type === "sec" ? "secondary" : "kindergarten";

  var email = '';
  if (school.properties.email_address){
    email =  '<a target="_blank" href="mailto:' + school.properties.email_address + '">' + school.properties.email_address + '</a><br/>';
  }

  var popup = '<strong class="popup-title"><a href="/' + path + "/" + school.properties.pk + '">' +
        school.properties.name + "</a></strong><br/>" + school.properties.address + '<br/>' + email +
        '<a href="tel:' + school.properties.phone_number + '">' + school.properties.phone_number + '</a><br/>' +
        '<a target="_blank" href="' + school.properties.website_url + '">' + school.properties.website_url + '</a><br/>';

  if (school.school_type === "pri") {
    if (school.properties.kindergartens.length !== 0) {
      popup += '<p class="popup-content">The school has co-located kindergarten</p>';
    } else {
      popup += '<p class="popup-content">There is no co-located kindergartens</p>';
    }
  }else{
    popup += '<p class="popup-content"></p>' //keep the layout consistent
  }

  popup += '<div class="popup-btn-container">';
  popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1 Km</button>';
  popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2 Km</button></br></div>';

  return popup;
}

var prev_click = [null, null];
function click_on_same_marker(curr_click){
  let ret = (curr_click[0] === prev_click[0]) && (curr_click[1] === prev_click[1]);
  prev_click = curr_click;
  return ret;
}

function handleKmBtnClick(btnId, geoLocation){

  if (!click_on_same_marker(geoLocation)){
    prepareCircleMarker(geoLocation);
    clearAllLMarkers([geoLocation]);
  }

  if(btnId === id_1km_btn){
    if (!rangeCircle1KmLG.hasLayer(oneKmCircleMaker)){
      rangeCircle1KmLG.addLayer(oneKmCircleMaker);
      showSchoolsWithin(geoLocation, 1000, rangeCircle1KmLG);
    }
    else{
      clearMarkers(rangeCircle1KmLG, [geoLocation]);
    }
  }

  if(btnId === id_2km_btn){
    if (!rangeCircle2KmLG.hasLayer(twoKmCircleMaker)){
      rangeCircle2KmLG.addLayer(twoKmCircleMaker);
      showSchoolsWithin(geoLocation, 2000, rangeCircle2KmLG);
    }
    else{
       clearMarkers(rangeCircle2KmLG, [geoLocation]);
    }
  }
}

function showSchoolsWithin(centerCoo, radius, layerGroup){
  g_all_schools.forEach(function (school, idx, arr) {
    let lat = school.geometry.coordinates[1];
    let lng = school.geometry.coordinates[0];
    let itemGeo = [lat, lng];
    let distance = getDistanceBetween(centerCoo, itemGeo);
    if ((0 < distance) && (distance <= radius)){
      let marker = getMarker(school);
      layerGroup.addLayer(marker);
    }
  });
}

//p1 and p2 are Latlng type
function getDistanceBetween(p1, p2){
    let ll1 = L.latLng([p1[0],p1[1]]);
    let ll2 = L.latLng([p2[0],p2[1]]);
    return ll1.distanceTo(ll2); //unit meters
}

mymap.on('locationfound', function (locationEvent) {
  decode_geolocation(locationEvent.latlng);
});

function decode_geolocation(latlng){
  var popMsgTitle = ['GPS Location', '', latlng['lat'].toFixed(8) + ', ' + latlng['lng'].toFixed(8)];
    $.ajax({
        type: "GET",
        url: "api/geo-to-address/",
        data: {
          lat:latlng['lat'],
          lng:latlng['lng'],
        },
        async: true,
        success: function (result) {
          var response = JSON.parse(result);
          if (response.results.length > 0){
            popMsgTitle[0] = response.results[0].formatted;
            let addresses = response.results[0].formatted.split(', ');
            if (addresses.length > 2){
              popMsgTitle[0] = addresses[0];
              popMsgTitle[1] = addresses[1]+', '+addresses[2];
              popMsgTitle[2] = 'GPS: '+latlng['lat'].toFixed(8) + ', ' + latlng['lng'].toFixed(8);
            }
          }

          flyTo(latlng);
          showCurrLocation(latlng, popMsgTitle);
        },

        error: function(error) {
            flyTo(latlng);
            showCurrLocation(latlng, popMsgTitle);
            console.log(error);
        }
    });
}

//triggers 'locationfound' event
function locateUser() {
  mymap.locate({ setView: true });
}


// set map center to the specific point
function flyTo(coordinates) {
  mymap.flyTo(coordinates, 15);
}


// clear all markers except those in exception list
function clearMarkers(layerGroup, except_marker_keys=null){
  if (except_marker_keys === null){
    layerGroup.clearLayers();
  }
  else {
    var except_marker_instances = [];
    populateMakerInstance(except_marker_keys, except_marker_instances);
    layerGroup.eachLayer(function (marker) {
      if (!except_marker_instances.includes(marker)){
        layerGroup.removeLayer(marker);
      }
    });
  }
}

function clearAllLMarkers(except_marker_keys=null) {
  let lgs = [schoolsLG, geoCenterLG, rangeCircle1KmLG, rangeCircle2KmLG];
  lgs.forEach(function (lg, idx, arr) {
    clearMarkers(lg, except_marker_keys);
  });

}

function showCurrLocation(latlng, poptitle){
  clearAllLMarkers();
  prepareCircleMarker(latlng);
  var marker = getGeoLocationMarker(latlng, poptitle);
  geoCenterLG.addLayer(marker);
}

function showOnMap(type, id, move, clear_layer=true) {

  if (clear_layer){
    clearAllLMarkers();
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
        response.forEach(function(school) {

          schoolsLG.addLayer(getMarker(school));

          if (type === "pri") {
            if (school.properties.kindergartens.length !== 0) {
              for (var i = 0, len = school.properties.kindergartens.length; i < len; i++) {
                showOnMap("kin", school.properties.kindergartens[i], false, false);
              }
            }
          }
          if (move === true) {
            var lat = school.geometry.coordinates[1];
            var lng = school.geometry.coordinates[0];
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
  oneKmCircleMaker = L.circle(coordinates, { radius: 1000, color: "red", opacity: 0.3 });
  twoKmCircleMaker = L.circle(coordinates, { radius: 2000, opacity: 0.3 });
}

//todo need to study loading performace of ll labrary