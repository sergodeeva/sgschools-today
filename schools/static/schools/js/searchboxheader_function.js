function getAutocompleteElement(item) {
    var schoolType = item.school_type === 'pri' ? 'primary' : item.school_type === 'sec' ? 'secondary' : 'kindergarten';
    var elementString =
        '<div><div class="autocomplete-name-type-container"><div class="autocomplete-item-name"><strong>'
        + item.properties.name
        + '</strong></div><div class="autocomplete-item-type">'
        + schoolType
        + '</div></div><div class="autocomplete-item-address">'
        + item.properties.address
        + '</div></div>';

   return elementString
}

$(document).ready(function() {
  $("#search-input").autocomplete({
      minLength: 1,
      source: function(request, response) {
        $.ajax({
          type: "GET",
          url: "/api/get-all-schools",
          dataType: "json",
          data: {query: $("#search-input").val()},
          success: function(result) {response(JSON.parse(result).features);},
          error: function(error) {console.log(error);}
        });
      },
      focus: function(event, ui) {
        $("#search-input").val(ui.item.properties.name);
        return false;
      },
      select: function(event, ui) {
        // TODO: to make autocomplete work on all the pages
        $("#search-input").val(ui.item.properties.name);
        showOnMap(ui.item.school_type, ui.item.properties.pk, true);
        document.activeElement.blur();
        $("search-input").blur();
        return false;
      }
    })
    .data("ui-autocomplete")._renderItem = function(ul, item) {
    return $("<li>")
      .append(getAutocompleteElement(item))
      .appendTo(ul);
  };
});
