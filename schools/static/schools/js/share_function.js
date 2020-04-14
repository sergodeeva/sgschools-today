/****************************************************/
/*Mai Ngin: Sharing Function*/
/****************************************************/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

$(document).ready(function() {     
    $.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
    FB.init({        
      appId: 142923497075830, 
      //appId: 1206925822667227, //Temp ID
      version: 'v3.2' 
    });     
  });

    var params = getUrlVars()["params"];     
    if(!params){
        return;
    } else {  
        params = params.toString().replace(/%2C/gi,"_");      
        var paramArray = params.toString().split('_');
        var val1 = paramArray[0];
        var val2 = paramArray[1];
        var isSchool = paramArray[2];
        if(isSchool=="true"){
            showOnMap(val1,val2,true,true);
        }else{
            var latlng = L.latLng(val1, val2);            
            decode_geolocation(latlng);            
        }      
    }  
});

/****************************************************/