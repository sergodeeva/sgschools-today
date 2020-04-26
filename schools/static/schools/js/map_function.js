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

// route group
var routesLG;

var routeALG = L.layerGroup();
routeALG.addTo(mymap);

var routeAMarker_CAR = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "car",
  markerColor: "blue"
});
var routeAMarker_CYCLE = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "bicycle",
  markerColor: "orange"
});
var routeAMarker_WALK = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "street-view",
  markerColor: "gray"
});
var routeAMarker_TRANSIT = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "bus",
  markerColor: "gray"
});
/////////////

var oneKmCircleMaker;
var twoKmCircleMaker;

// popup options
var customOptions = {
  maxWidth: "380",
  width: "200",
  className: "popupCustom"
};

var geoLocationMarker = L.AwesomeMarkers.icon({
  prefix: "fa",
  icon: "globe-asia",
  markerColor: "purple"
});

//container ids
var id_1km_btn = '1km-btn';
var id_2km_btn = '2km-btn';
var id_route_btn = 'route-btn';

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

//Use this function to show current location
function getGeoLocationMarker(geoLocation, poptitle) {  
  let centerGeo = [geoLocation.lat,geoLocation.lng];
  var shareParams = geoLocation.lat +','+geoLocation.lng+',false';   
  var linkstr=homeUrl + "?params="+ geoLocation.lat +'_'+geoLocation.lng+'_false';   

  var popup = '<strong class="popup-title"><a href="" onclick="return false;">'+ poptitle[0] +'</a></strong></br>'+ poptitle[1] + '<p>' + poptitle[2] +'</p>';
  popup += '<div class="popup-btn-container">';
  popup += '<div class="btn-group" role="group">';
  popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1 Km</button>';
  popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2 Km</button></br>';
  popup += '<button id="btnGroupDrop1" type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
  popup += 'Share';
  popup += '</button>';
  popup += '<div class="dropdown-menu" aria-labelledby="btnGroupDrop1">';   
  popup += '<button class="dropdown-item d-none d-md-block" id="btnWhatsappLg" onclick="handleBtnWhatsappClick('+ shareParams +')">Whatsapp</button>';     
  popup += '<button class="dropdown-item d-sm-none" id="btnWhatsappsm" onclick="handleBtnSmallWhatsappClick('+ shareParams +')">Whatsapp</button>';     
  popup += '<button class="dropdown-item" id="btnFBMessanger" onclick="handleBtnFBMessangerClick('+ shareParams +')">Messenger</button>';    
  popup += '<a class="dropdown-item popup-a-btn" href="mailto:?subject=<SG Schools>Check out this location&amp;body=Check out this location ' + linkstr + '">Mail</a>'
  popup += '<button class="dropdown-item" id="btnCopyLink" onclick="handleBtnCopyLinkClick('+ shareParams +')">Copy Link</button>';    
  popup += '</div>';
  popup += '<button id="'+id_route_btn+'" type="button" class="btn btn-success btn-sm" onclick="handleRouteBtnClick(this.id,'+JSON.stringify(centerGeo)+',' + "'"+ poptitle[0] +"'" + ')">Route</button>';
  popup += '</div>';  
  popup += '</div>';
  let marker =  L.marker(geoLocation, {icon: geoLocationMarker}).bindPopup(popup,customOptions);
  cacheMarker('u',centerGeo, marker);
  return marker;
}

// Function returns a marker icon of a given color and type
function getMarkerIcon(icon, color) {
    return L.AwesomeMarkers.icon({
        prefix: "fa",
        icon: icon,
        markerColor: color});
    }

//create marker for the input data
function getMarker(school) {
  let lat = school.geometry.coordinates[1];
  let lng = school.geometry.coordinates[0];
  let centerGeo = [lat, lng];

  var markers = {
    "primary": getMarkerIcon("school", "blue"),
    "secondary": getMarkerIcon("square-root-alt", "green"),
    "kindergarten": getMarkerIcon("child", "orange"),
    "library": getMarkerIcon("book", "purple"),
    "default": getMarkerIcon("school", "blue")
  }

  var markerType = school.properties.type in markers ? markers[school.properties.type] : markers["default"];

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
  var path = school.properties.type;

  var email = '';
  if (school.properties.email_address){
    email =  '<a target="_blank" href="mailto:' + school.properties.email_address + '">' + school.properties.email_address + '</a><br/>';
  }
  var phone_number = '';
  if (school.properties.phone_number){
    phone_number =  '<a href="tel:' + school.properties.phone_number + '">' + school.properties.phone_number + '</a><br/>';
  }
  var website_url = '';
  if (school.properties.website_url && school.properties.website_url != ''){
    website_url =  '<a target="_blank" href="' + school.properties.website_url + '">' + 'Visit website' + '</a><br/>';
  }

  var popup = '<strong class="popup-title"><a href="/' + path + "/" + school.properties.pk + '">' +
        school.properties.name + "</a></strong><br/>" + school.properties.address + '<br/>'
        + email + phone_number + website_url;

  if (school.properties.type === "primary") {
    if (school.properties.collocated) {
      popup += '<p class="popup-content">The school has co-located kindergarten</p>';
    } else {
      popup += '<p class="popup-content">There is no co-located kindergartens</p>';
    }
  }else{
    popup += '<p class="popup-content"></p>' //keep the layout consistent
  }
  var shareParams = '\''+ school.properties.type +'\','+ school.properties.pk +',true';
  var linkstr=homeUrl + "?params="+ school.properties.type +'_'+ school.properties.pk +'_true';

  popup += '<div class="popup-btn-container">';
  popup += '<div class="btn-group" role="group">';
  popup += '<button id="'+id_1km_btn+'" class="popup-btn circle btn btn-info btn-sm one-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">1 Km</button>';
  popup += '<button id="'+id_2km_btn+'" class="popup-btn circle btn btn-info btn-sm two-km" data-toggle="button" onclick="handleKmBtnClick(this.id,'+JSON.stringify(centerGeo)+')">2 Km</button>';
  popup += '<button id="btnGroupDrop1" type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
  popup += 'Share';
  popup += '</button>';
  popup += '<div class="dropdown-menu" aria-labelledby="btnGroupDrop1">';    
  popup += '<button class="dropdown-item d-none d-md-block" id="btnWhatsappLg" onclick="handleBtnWhatsappClick('+ shareParams +')">Whatsapp</button>';     
  popup += '<button class="dropdown-item d-sm-none" id="btnWhatsappsm" onclick="handleBtnSmallWhatsappClick('+ shareParams +')">Whatsapp</button>';       
  popup += '<button class="dropdown-item" id="btnFBMessanger" onclick="handleBtnFBMessangerClick('+ shareParams +')">Messenger</button>';    
  popup += '<a class="dropdown-item popup-a-btn" href="mailto:?subject=<SG Schools>Check out this location&amp;body=Check out this location ' + linkstr + '">Mail</a>'
  popup += '<button class="dropdown-item" id="btnCopyLink" onclick="handleBtnCopyLinkClick('+ shareParams +')">Copy Link</button>';    
  popup += '</div>';  
  popup += '<button id="'+id_route_btn+'" type="button" class="btn btn-success btn-sm" onclick="handleRouteBtnClick(this.id,'+JSON.stringify(centerGeo)+',' + "'"+ school.properties.address +"'" + ')">Route</button>';
  popup += '</div>';
  popup += '</div>';
  popup += '<br />';
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
      // console.log(school)
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
  mymap.locate({ setView: true, maxZoom: 12 });
}

// set map center to the specific point
function flyTo(coordinates) {
  mymap.flyTo(coordinates, 14);
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
  let lgs = [schoolsLG, geoCenterLG, rangeCircle1KmLG, rangeCircle2KmLG, routeALG];
  lgs.forEach(function (lg, idx, arr) {
    clearMarkers(lg, except_marker_keys);
  });
  clearRoute();//Mai Ngin
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

/****************************************************/
/*Sundee: Routing */
/****************************************************/
var routeALatLng;
var routeBLatLng;
var selectedRouteType;
var selectedTransportMode; //TRANSIT, BUS, RAIL
var token = '-';
var timeoutRetryCount = 0;

function showRouteContainer() {
    if ($(".route-col-container").hasClass('hide')) {
        $(".route-col-container").removeClass('hide');

        // when first time showing route container, hide the route details
        if (!$(".route-details-block").hasClass('hide')) {
          $(".route-details-block").addClass('hide');
        }
        $("#inputRouteAA").val("");
        $("#inputRouteA").val("");     
        $("#inputRouteA").focus();

    } else {
        hideRouteContainer();
    }
}

function hideRouteContainer() {
    $(".route-col-container").addClass('hide');
    $(".route-details-block").addClass('hide');
    clearAllLMarkers()
    // clear all the map routing
}

// When popup "Route" button click
function handleRouteBtnClick(_btn, geoLocation, address) {
  routeBLatLng = geoLocation;
    
  $("#inputRouteB").val(address);
  showRouteContainer();
}

// When user click on "Find Route" button
async function findRoute(routeType, mode) {
  selectedRouteType = routeType;
  selectedTransportMode = mode;
  getAndUpdateToken();  
  var routeA_address;
  // Find routeA Lat, Lng
  if($("#inputRouteAA").val()){
    routeA_address = $("#inputRouteAA").val(); 
  }else{
    routeA_address = $("#inputRouteA").val(); 
  }
  
  //var routeA_address = '21 Compassvale Walk' //Mai Ngin Temp
  $.ajax({
    type: "GET",
    url: "api/get_all_address/",
    data: {
      query:routeA_address,
    },
    async: true,
    success: function (result) {
      var response = JSON.parse(result);
      
      routeALatLng = null;
      if (response.results != null && response.results.length > 0) {
        routeALatLng = [response.results[0].LATITUDE, response.results[0].LONGITUDE];
      }
      
      if (routeALatLng != null && routeALatLng != "" && routeBLatLng != null && routeBLatLng != "") {
        fetch_routes(routeType, mode);
        if ($(".route-details-block").hasClass('hide')) {
          $(".route-details-block").removeClass('hide');
        }
      } else {
        alert('Invalid Address');
      }
    },
    error: function(error) {
      console.log(error);
    }
  }); 
}

async function get_tokens() {
  var form = new FormData();
  form.append("email", "sundeentu@gmail.com");
  form.append("password", "Sundee1988");  
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://developers.onemap.sg/privateapi/auth/post/getToken",
    "method": "POST",
    "processData": false,
    "contentType": false,
    "mimeType": "multipart/form-data",
    "data": form
  }
  try{
    let response = await  $.ajax(settings);
    let result = JSON.parse(response);
    return [result.access_token, result.expiry_timestamp];
  }catch(error){
    console.log(error)
  }

}

function draw_routes(route_geometry) {
  $.ajax({
    type: "GET",
    url: "api/decode_route_geometry/",
    data: {
      query:route_geometry,
    },
    async: true,
    success: function (result) {

      if (result != null) {
        clearRoute();
        routesLG = L.polyline(result, {color:'green',weight: 5,opacity: 0.8,smoothFactor: 1});     
        routesLG.addTo(mymap);

        clearMarkers(routeALG);
        // need to clear the marker.
        let marker =  L.marker(result[0], {icon: selectedRouteType == 'drive'?routeAMarker_CAR:selectedRouteType == 'cycle'?routeAMarker_CYCLE:selectedRouteType == 'walk'?routeAMarker_WALK:routeAMarker_TRANSIT});
        cacheMarker('u',result[0], marker);
        routeALG.addLayer(marker);
      }
    },
    error: function(error) {
        console.log(error);
    }
  }); 
}

function fetch_routes(routeType, mode) {
  selectedRouteType = routeType;
  selectedTransportMode = mode;
  $.ajax({
        type: "GET",
        url: "api/get-routes/",
        data: {
          slat:routeALatLng[0],
          slng:routeALatLng[1],
          elat:routeBLatLng[0], 
          elng:routeBLatLng[1],
          rType:routeType,
          token:token,
          mode:mode
        },
        async: true,
        success: function (result) {
          var response = JSON.parse(result);

          if(response.error){
            timeoutRetryCount += 1;
            if(timeoutRetryCount < 3){
              fetch_routes(routeType, mode);
            }
            else{
              alert("Connection is interrupted! Please refresh your browser again.")
            }            
            
          }
          else if (result.includes("Your token has expired")) {
            get_tokens();
          }
          else if (response.status == 0) {            
            if (routeType == 'drive' || routeType == 'cycle' || routeType == 'walk') {
              draw_routes(response.route_geometry);
              update_route_instructions(response.route_instructions, response.route_summary);
            }             
          }          
          else{         
            legs = response.plan.itineraries[0].legs;
            geoArr = [];
            for (var i = 0; i < legs.length; i++) {   
              geoArr.push(legs[i].legGeometry.points);
              // console.log(legs[i].legGeometry.points)
            }
            jsonLegs = JSON.stringify(geoArr);            
            draw_routes_pt(jsonLegs);            
            update_route_instructions_pt(response.plan);
          }
        },
        error: function(error) {
          //debugger;
          console.log(error);
        }
    });
}

function update_route_instructions(instructions, summary) {
  var startloc = $("#inputRouteA").val();
  var endloc = $("#inputRouteB").val();
  
  $('.route-details-content').html('');

  var htmlText = '<div class="container">';
  htmlText += '<div class="row">';
  htmlText += '<div class="col">';
  if (summary.start_point.length > 0) {
    // htmlText += '<span class="label"><small>Start Point: <b>' + summary.start_point + '</b></small></span><br />';
    htmlText += '<span class="label"><small>Start Point: <b>' + startloc + '</b></small></span><br />';
  } 
  if (summary.end_point.length > 0) {
    //htmlText += '<span class="label"><small>End Point: <b>' + summary.end_point + '</b></small></span><br />';
    htmlText += '<span class="label"><small>End Point: <b>' + endloc + '</b></small></span><br />';
  }
  htmlText += '<span class="label"><small>Total Time: <b>' + (summary.total_time/60).toFixed(2) + ' (Mins)</b></small></span><br />' +
          '<span class="label"><small>Total Dist: <b>' + summary.total_distance + ' (meters)</b></small></span>' +
        '</div>';
  htmlText += '</div><hr />';
  for (var i = 0; i < instructions.length; i++) {
    htmlText += '<div class="row">';
    var turnIcon = 'fa fa-road';
    if (instructions[i][0].includes('left') || instructions[i][0].includes('Left')) {
      turnIcon = 'fa fa-share';
    } else if (instructions[i][0].includes('right') || instructions[i][0].includes('Right')) {
      turnIcon = 'fa fa-reply';
    } 
    htmlText += '<div class="col">' +
        '<h6><span class="route-drive-point '+ turnIcon +'"></span>' + instructions[i][5] + '</h6>'+
      '</div>' +
      '<div class="col text-right">' + 
        '<span class="badge badge-primary">' + instructions[i][1] + '</span>' +
      '</div>' + 
      '</div>';
    htmlText += '<div class="row">';
    htmlText += '<div class="col">' +
          '<span class="label"><small>' + instructions[i][9] + '</small></span>' +
        '</div>' +
      '</div> <hr />';
  }
  htmlText += '</div><div class="route-end-drive"></div>';
  $('.route-details-content').html(htmlText);
}
//todo need to study loading performace of ll labrary


/****************************************************/
/*Mai Ngin: Public Transport Routing */
/****************************************************/
var routesPtG = [];

function update_route_instructions_pt(plan){
  var startloc = $("#inputRouteA").val();
  var endloc = $("#inputRouteB").val();
  var htmlText = '<div class="container">';
  htmlText += '<div class="row">';
  htmlText += '<div class="col">';
  htmlText += '<span class="label"><small>Start Point: <b>' + startloc + '</b></small></span><br />';
  htmlText += '<span class="label"><small>End Point: <b>' + endloc + '</b></small></span><br />';
  htmlText += '<span class="label"><small>Total Time: <b>' + (plan.itineraries[0].duration/60).toFixed(2) + ' (Mins)</b></small></span><br />';
  htmlText += '<span class="label"><small>Fare: <b>$' + plan.itineraries[0].fare + '</b></small></span><br />';
  if( plan.itineraries[0].transfers > 0){
    htmlText += '<span class="label"><small>Transfers: <b>' + plan.itineraries[0].transfers + '</b></small></span><br />';
  }  
  htmlText +='<hr>';
  legs = plan.itineraries[0].legs;
  for (var i = 0; i < legs.length; i++) {      
      checkIfMRT =4 //Mai Ngin Temp
      if(legs[i].mode == 'WALK'){
          //Walk [xxx] m
          htmlText += '<div class="row"><div class="col"><h6>Walk '+legs[i].distance +' m</h6></div></div>';
          if(legs[i].to.stopCode){  //MRT
            if(legs[i].to.stopCode ==4){
              //Walk towards [Station Name] (Station Code)
              htmlText += '<div class="row"><div class="col"><span class="label"><small>Walk towards '+legs[i].to.name +' ('+ legs[i].to.stopCode +')</small></span></div></div><hr>';
            } else { //Bus
              //Walk towards Bus Stop @ [Bus Stop Name] (B[Bus Stop Code])
              htmlText += '<div class="row"><div class="col"><span class="label"><small>Walk towards Bus Stop @ '+legs[i].to.name +' (B'+ legs[i].to.stopCode +')</small></span></div></div><hr>';
            }
          } else {
            //Walk towards path
            htmlText += '<div class="row"><div class="col"><span class="label"><small>Walk towards '+legs[i].to.name + '</small></span></div></div><hr>';
          }
      }else if(legs[i].mode=='BUS'){
          //Take Bus [Bus No.] (B[Bus Stop Code])
          htmlText += '<div class="row"><div class="col"><h6>Take Bus '+legs[i].route +' (B'+ legs[i].from.stopCode +')</h6></div></div>';
          //[No of Stop] Stops later alight at 
          htmlText += '<div class="row"><div class="col"><span class="label"><small>'+ legs[i].numIntermediateStops +' Stops later alight at ';          
          //if rail, [Bus Stop Name], (B[Bus Stop Code])
          //else bus,[Station Name] (Station Code)
          if(legs[i].to.stopCode){  
            if(legs[i].to.stopCode.length ==4) {//MRT
              htmlText += legs[i].to.name + ' ('+ legs[i].to.stopCode +')'
            }else{
              htmlText += legs[i].to.name + ' (B'+ legs[i].to.stopCode +')'
            }
          }else{
            htmlText += legs[i].to.name;
          }
          htmlText += '</small></span></div></div><hr>';                       
      }else{ //RAIL
        htmlText += '<div class="row"><div class="col"><h6>'+ legs[i].from.name +'</h6></div></div>';
        //[No of Stop] Stops later alight at 
        htmlText += '<div class="row"><div class="col"><span class="label"><small>Board the train. '+ legs[i].numIntermediateStops +' Stops later alight at ';
        htmlText += legs[i].to.name + ' ('+ legs[i].to.stopCode +')</small></span></div></div><hr>';
      }
  }
  $('.route-details-content').html(htmlText);
}

//Plot Polyline for public transport mode.
function draw_routes_pt(route_geometry){
  $.ajax({
    type: "GET",
    url: "api/decode_route_geometry_multi/",
    data: {
      query:route_geometry,
    },
    async: true,
    success: function (result) {
      if (result != null){        
        for(var i = 0; i < result.length; i++){         
          if(i==0){                       
            clearRoute();
            routesPtG = [];       
            clearMarkers(routeALG);
            let marker =  L.marker(result[i][0], {icon: selectedRouteType == 'drive'?routeAMarker_CAR:selectedRouteType == 'cycle'?routeAMarker_CYCLE:selectedRouteType == 'walk'?routeAMarker_WALK:routeAMarker_TRANSIT});
            cacheMarker('u',result[i][0], marker);
            routeALG.addLayer(marker);             
          }
          if(i < result.length-1){
            result[i].push(result[i+1][0])
          }
          routesLG = L.polyline(result[i], {color:'green',weight: 5,opacity: 0.8,smoothFactor: 1});
          routesLG.addTo(mymap);
          routesPtG.push(routesLG)          
        }
      }           
    },
    error: function(error) {
        console.log(error);
    }
  }); 
}

function clearRoute(){
  if (routesLG != null) {
    routesLG.removeFrom(mymap);
    routesLG = null;
  }
  if (routesPtG.length > 0) {
    for (var i = 0; i < routesPtG.length; i++){
      routesPtG[i].removeFrom(mymap)
      routesPtG.slice(i+1)
    }
  }     
}

/****************************************************/
/*Mai Ngin: Sharing Location */
/****************************************************/
// var homeUrl = 'http://127.0.0.1:8000'; //MAI_TODO replace with live domain name
var homeUrl = 'https://sgschools.today'; //live domain name

// Whatsapp Desktop
function handleBtnWhatsappClick(val1,val2,isSchool){
  var uri=homeUrl + "?params="+val1+"_"+val2+"_"+isSchool;    
  window.open('https://web.whatsapp.com/send?text='+uri);
  
}

// Whatsapp Mobile
function handleBtnSmallWhatsappClick(val1,val2,isSchool){
  var uri=homeUrl + "?params="+val1+"_"+val2+"_"+isSchool;    
  window.open('https://api.whatsapp.com/send?text='+uri);  
}


function handleBtnFBMessangerClick(val1,val2,isSchool){   
  var linkstr=homeUrl + "?params="+val1+"_"+val2+"_"+isSchool;      
  FB.ui({
    method: 'send',
    link: linkstr,
  });
}

function handleBtnCopyLinkClick(val1,val2,isSchool){   
  var linkstr=homeUrl + "?params="+val1+"_"+val2+"_"+isSchool;      
  var txtArea = document.createElement('textarea');
  txtArea.value = linkstr;
  txtArea.setAttribute('readonly', '');
  txtArea.style.position = 'absolute';
  txtArea.style.left = '-9999px';
  document.body.appendChild(txtArea);
  txtArea.select();
  document.execCommand('copy');
  document.body.removeChild(txtArea);
  alert("Copied the link");  
}

async function get_token_local(){
  let result;
  try{
    result = await $.ajax({
      url: "api/get_onemap_token/",
      type: 'GET',
      async: true,
    });
    var response = JSON.parse(result);
    var currDt = new Date();
    var currEpoch = currDt.getTime()/1000.0;

    if(response.features.length > 0){
      if(response.features[0].properties.expiryTimeStamp - 10800 < currEpoch){ //if expiry time is before 3hours, get a new token  
        return "No valid token";        
      } 
      else {
        return response.features[0].properties.token;
      }
    }    
    else{
      return "No valid token";        
    }
  }catch(error){
    console.log(error);      
  }  
}

async function getAndUpdateToken(){
  if(token=='-'){    
    let localtoken = await get_token_local();    //get local token   
    if(localtoken == 'No valid token'){
      var resultArray = await get_tokens();  //get token from OneMap API
      var tkn = resultArray[0];
      var exp = resultArray[1];
      update_token_db(tkn,exp);
      token = tkn;
    }
    else{
      token=localtoken;
    }
  }
}

function update_token_db(oneMapToken,expiry){
  $.ajax({
    type: "POST",
    url: "api/update_onemap_token/",
    data: {
      token: oneMapToken,
      expiryTimeStamp: expiry,
    },
    success: function (result) {
      console.log("successfully updated in db")
    },
    async: true,
    error: function(error) {
      console.log(error);
    }
  });
}

/****************************************************/