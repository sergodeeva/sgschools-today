String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function fmt_autocomplete_str(name, note, address) {
    return '<div><div class="autocomplete-name-type-container"><div class="autocomplete-item-name"><strong>'
        + name
        + '</strong></div><div class="autocomplete-item-type">'
        + note
        + '</div></div><div class="autocomplete-item-address">'
        + address
        + '</div></div>';
}

function getAutocompleteElement(item) {
    var elementString = '<div></div>';
    if(item.properties && item.properties.type){
        elementString = fmt_autocomplete_str(item.properties.name, item.properties.type, item.properties.address);
    }

    else if(item.SEARCHVAL){
        var note = 'place';
        //if (!(item.BUILDING === 'NIL')){note = 'building';}
        //else if (!(item.BLK_NO === '')){note = 'block';}
        elementString = fmt_autocomplete_str(item.SEARCHVAL.toTitleCase(), note, item.ADDRESS.toTitleCase());
    }

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
          success: function(result) {
              let json = JSON.parse(result);
              if (json.features){
                  //parse local db results
                  response(json.features);
              }
              else if (json.results){
                  //parse onemap results
                  response(json.results);
              }
          },
          error: function(error) {console.log(error);}
        });
      },
      focus: function(event, ui) {
          if (ui.item.properties.type){
              $("#search-input").val(ui.item.properties.name);
          }
          else if(ui.item.SEARCHVAL){
              $("#search-input").val(ui.item.SEARCHVAL.toTitleCase());
          }
        return false;
      },
      select: function(event, ui) {
        // TODO: to make autocomplete work on all the pages
          var display = "";
          if (ui.item.properties && ui.item.properties.type){
              display = ui.item.properties.name;
              showOnMap(ui.item.properties.type, ui.item.properties.pk, true);
          }
          else if(ui.item.SEARCHVAL){
              display = ui.item.SEARCHVAL.toTitleCase();
              let lat = parseFloat(ui.item.LATITUDE);
              let lng = parseFloat(ui.item.LONGITUDE);
              let geoLocation = L.latLng(lat, lng);
              let popMsgTitle = [display, ui.item.ADDRESS.toTitleCase(), 'GPS: '+lat.toFixed(8)+', '+lng.toFixed(8)];
              flyTo(geoLocation);
              showCurrLocation(geoLocation, popMsgTitle);
          }
          $("#search-input").val(display);
          document.activeElement.blur();
          $("search-input").blur();
          return false;
      }
    })
    .data("ui-autocomplete")._renderItem = function(ul, item) {
      return $("<li>").append(getAutocompleteElement(item)).appendTo(ul);
  };
});
