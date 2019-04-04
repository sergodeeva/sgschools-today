//circle layer
var range = L.layerGroup();

// create markers group
var schools = L.featureGroup();
var kindergartens = L.layerGroup();

// popup options
var customOptions =
    {
        'maxWidth': '400',
        'width': '200',
        'className': 'popupCustom'
    };

// school marker config (font-awesome icon)
var schoolMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'school',
    markerColor: 'blue'
});

// kindergarten marker config (font-awesome icon)
var kindergartenMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'child',
    markerColor: 'orange'
});


//create marker for the input data
function getMarker(school) {
    var Popup = getPopup(school);
    var lat = school.geometry.coordinates[1];
    var lng = school.geometry.coordinates[0];
    return L.marker([lat, lng], {icon: schoolMarker}).bindPopup(Popup, customOptions);
}

// generate popup for the point on map
function getPopup(school) {
    var school_id = school.properties.pk;
    var customPopup = '<b>' + school.properties.name + '</b><br/>';
    customPopup += '<button type="button" class="popup-btn circle btn btn-info"  data-toggle="button">circle</button>';
    customPopup += '<button type="button" class="popup-btn show-kindergarten btn btn-info" school-id=' + school_id + '>show</button>';
    return customPopup;
}

//add markers group to map
schools.addTo(mymap);

//popup functions
mymap.on('popupopen', function (ev) {
    var lat, lng;
    lat = ev.popup.getLatLng().lat;
    lng = ev.popup.getLatLng().lng;

    $('button.circle').click(function () {
        if (!$(this).hasClass('active')) {
            mymap.removeLayer(range);
            range.clearLayers();
            range.addLayer(L.circle([lat, lng], {radius: 1000, color: 'red', opacity: .3}));
            range.addLayer(L.circle([lat, lng], {radius: 2000, opacity: .3}));
            range.addTo(mymap);
        } else {
            mymap.removeLayer(range);
            range.clearLayers();
        }

    });

    $('button.show-kindergarten').click(function () {
            find_kindergarten($(this).attr('school-id'));
        }
    );
});

//draw range
schools.on('click', function (ev) {
    var clickedMarker = ev.layer;
    goTo(clickedMarker.getLatLng().lat, clickedMarker.getLatLng().lng)
});

// set map center to the specific point
function goTo(lat, lng) {
    if (mymap.getZoom() < 14) {
        mymap.flyTo([lat, lng], 14);
    } else {
        mymap.flyTo([lat, lng]);
    }
}

//get related kindergarten (ajax)
function find_kindergarten(school_id) {
    $.ajax({
        type: "GET",
        url: 'api/get-kindergarten/',
        data: {
            'schoolId': school_id
        },
        async: false,
        success: function (result) {

            kindergartens.clearLayers();
            var response_list = JSON.parse(result).features;
            if (response_list.length > 0) {

                response_list.forEach(function (kindergarten) {
                    console.log(kindergarten.properties.name);
                    var lat = kindergarten.geometry.coordinates[1];
                    var lng = kindergarten.geometry.coordinates[0];
                    var marker = L.marker([lat, lng], {icon: kindergartenMarker});
                    kindergartens.addLayer(marker);
                })
            }
            kindergartens.addTo(mymap);
        },
        error: function (error) {
            console.log(error);
        }
    })
}