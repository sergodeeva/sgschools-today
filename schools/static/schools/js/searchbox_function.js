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
    schools.clearLayers();
    kindergartens.clearLayers();
    range.clearLayers();
    showOnMap(searchType, target_id);

});

