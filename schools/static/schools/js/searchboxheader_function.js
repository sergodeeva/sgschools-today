const note_css = "display:flex;justify-content:center;align-items:center;"+
    "font-family:Fira%20Code,SFMono-Regular,Menlo,Monaco,Consolas,Liberation%20Mono,Courier%20New,monospace;" +
    "font-weight:500;" +
    "background:#f4f2ff;" +
    "font-size:1rem;" +
    "color:#9884fc;" +
    "padding:4px%2010px;" +
    "border-radius:5px;" +
    "line-height:1.5rem;" +
    "word-break:normal;";

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function fmt_autocomplete_str(name, note, address) {
    return '<div><div class="autocomplete-name-type-container"><div class="autocomplete-item-name"><strong>'
        + name
        + '</strong></div><div class="autocomplete-item-type" style='+note_css+'>'
        + note
        + '</div></div><div class="autocomplete-item-address">'
        + address
        + '</div></div>';
}

function getAutocompleteElement(item) {
    var elementString = '<div></div>';

    if(item.school_type){
        var schoolType = item.school_type === 'pri' ? 'primary' : item.school_type === 'sec' ? 'secondary' : 'kindergarten';
        elementString = fmt_autocomplete_str(item.properties.name, schoolType, item.properties.address);
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
          if (ui.item.school_type){
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
          if (ui.item.school_type){
              display = ui.item.properties.name;
              showOnMap(ui.item.school_type, ui.item.properties.pk, true);
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
