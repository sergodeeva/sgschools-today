//circle layer
var range = L.layerGroup();

//create markers group
var schools = L.featureGroup();
var kindergartens = L.layerGroup();

// specify popup options
var customOptions =
    {
        'maxWidth': '400',
        'width': '200',
        'className': 'popupCustom'
    };

// specify school marker (font-awesome icon)
var schoolMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'school',
    markerColor: 'blue'
});

// specify kindergarten marker (font-awesome icon)
var kindergartenMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'child',
    markerColor: 'orange'
});

//schools_json from Django view
var schools_list = schools_json.features;

schools_list.forEach(function (school) {
    var lng = school.geometry.coordinates[0];
    var lat = school.geometry.coordinates[1];
    var school_id = school.properties.pk;
    var customPopup = '<b>' + school.properties.name + '</b><br/>';
    customPopup += '<button type="button" class="popup-btn circle btn btn-info"  data-toggle="button">circle</button>';
    customPopup += '<button type="button" class="popup-btn show-kindergarten btn btn-info" school-id=' + school_id + '>show</button>';
    marker = L.marker([lat, lng], {icon: schoolMarker}).bindPopup(customPopup, customOptions);
    schools.addLayer(marker);
});

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
            range.addLayer(L.circle([lat, lng], {radius: 1000, color: 'red', opacity: .5}));
            range.addLayer(L.circle([lat, lng], {radius: 2000, opacity: .5}));
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
    if (mymap.getZoom() < 14) {
        mymap.flyTo([clickedMarker.getLatLng().lat, clickedMarker.getLatLng().lng], 14);
    } else {
        mymap.flyTo([clickedMarker.getLatLng().lat, clickedMarker.getLatLng().lng]);
    }

});

//get related kindergarten (ajax)
function find_kindergarten(school_id) {
    $.ajax({
        type: "GET",
        url: '/get-kindergarten/',
        data: {
            'schoolId': school_id
        },
        async: false,
        success: function (result) {

            kindergartens.clearLayers();
            var response_list = JSON.parse(result).features
            if (response_list.length > 0) {

                response_list.forEach(function (kindergarten) {
                    console.log(kindergarten.properties.name);
                    var lat = kindergarten.geometry.coordinates[1];
                    var lng = kindergarten.geometry.coordinates[0];
                    marker = L.marker([lat, lng], {icon: kindergartenMarker});
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