$("#search-input").bind('input propertychange', function () {
    var searchValue = $(this).val().toLowerCase();
    var searchType = $("input[name='search-type']:checked").val();

    $("div .radio-beauty-container").hide().filter(function () {
        return ($(this).attr("name").toLowerCase().indexOf(searchValue) > -1) && ($(this).attr("class").indexOf(searchType) > -1);
    }).show();

});

$("input.search-type:radio").bind('input propertychange', function () {
    var searchType = $(this).val();
    var searchValue = $("#search-input").val().toLowerCase();

    $("div .radio-beauty-container").hide().filter(function () {
        return ($(this).attr("name").toLowerCase().indexOf(searchValue) > -1) && ($(this).attr("class").indexOf(searchType) > -1);
    }).show();

});

$("input[type=radio][name='schoolOnSelect']").change(function () {
    var searchType = $("input[name='search-type']:checked").val();
    var target_id = $(this).val();
    get_school_detail(searchType, target_id);

});

function get_school_detail(type, id) {
    $.ajax({
        type: "GET",
        url: 'api/get-detail/',
        data: {
            'type': type,
            'id': id
        },
        async: true,
        success: function (result) {
            schools.clearLayers();
            kindergartens.clearLayers();
            var response = JSON.parse(result).features;
            if (response.length > 0) {
                response.forEach(function (point) {
                    var marker;
                    if (type === 'school') {
                        marker = getMarker(point, schoolMarker)
                        schools.addLayer(marker);
                        schools.addTo(mymap);
                    } else if (type ==='kindergarten') {
                        marker = getMarker(point, kindergartenMarker)
                        kindergartens.addLayer(marker);
                        kindergartens.addTo(mymap);
                    }
                    goTo(point.geometry.coordinates[1], point.geometry.coordinates[0]);
                })
            }

        },
        error: function (error) {
            console.log(error);
        }
    })
}