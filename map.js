window.onload = function() {
  // Config
  mapboxgl.accessToken = 'pk.eyJ1IjoiamNhcmxpbiIsImEiOiJjanoydmR2c3YwMDN1M25wbHcxaWR5MmFtIn0.Ch8mMZsJAEgNNBsP3RvZZA';
  // Map Options
  var mapOptions = {
    container: 'map', // container id
    style: 'mapbox://styles/jcarlin/ckbv1my5u11a71io4bkz9u7vu', // stylesheet location
    center: window.screen.width <= 480 ? [-94.447, 39.270] : [-97.966, 42.662],
    zoom: window.screen.width <= 480 ? 2.35 : 4.08,
    bearing: 0,
    pitch: 0,
    trackResize: true,
    // clearOnBlur: true
  };
  /**
   * - Mapbox Datasets are manually created in studio or imported GeoJSON file. 
   * - Datasets are exported as Tilesets.
   * - Datasets are exported as Tilesets
   * - Tilesets are a Data Source of a Layer (in the map Style)
   */
  // Mapbox dataset's Features from 'cities' dataset https://studio.mapbox.com/datasets/jcarlin/ckc3kii323otq22tfxg1p9plp/
  dispatchCitiesFeatures = "";

  // Mapbox Datasets API https://docs.mapbox.com/api/maps/#datasets
  var datasetsApiRequest = new XMLHttpRequest();

  // Handle the datasets response
  datasetsApiRequest.onreadystatechange = function() {
    if (datasetsApiRequest.readyState === 4) {
      dispatchCitiesFeatures = JSON.parse(datasetsApiRequest.responseText);
    }
  };

  // Mapbox dataset's Features from 'cities' dataset https://studio.mapbox.com/datasets/jcarlin/ckc3kii323otq22tfxg1p9plp/
  datasetsApiRequest.open('GET', 'https://api.mapbox.com/datasets/v1/jcarlin/ckc3kii323otq22tfxg1p9plp/features?access_token=pk.eyJ1IjoiamNhcmxpbiIsImEiOiJjanoydmR2c3YwMDN1M25wbHcxaWR5MmFtIn0.Ch8mMZsJAEgNNBsP3RvZZA');
  datasetsApiRequest.send();

  // The selected Search result
  var selectedLocation;
  
  // Mapbox Map
  var map = new mapboxgl.Map(mapOptions);

  // Create a Geocoder (search box) https://github.com/mapbox/mapbox-gl-geocoder
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'City, State or Zip',
    mapboxgl: mapboxgl, // Used to place marker after result
    types: 'postcode place region',
    flyTo: false,
    countries: 'us',
    limit: 3 // number of results from search
  });

  // After location selection from dropdown, validate and fly to
  geocoder.on('result', result => {
    const isValid = isValidLocation(result);
    if (isValid) {
      selectedLocation = result;
      document.getElementById("cta-container").className = "cta-container";
      document.getElementById("cta-title").innerHTML = result.result.text;
      document.getElementById("cta-desc").innerHTML = "Realm of the galaxies across the centuries the carbon in our apple pies vanquish the impossible.";
      document.getElementById("cta-button").innerHTML = "Start a Delivery";

      if (result.result.center) {
        map.flyTo({center: result.result.center, zoom: 9, essential: true});
      }
    } else {
      selectedLocation = null;
      document.getElementById("cta-container").className = "cta-container";
      document.getElementById("cta-title").innerHTML = "We don't server that area yet.";
      document.getElementById("cta-desc").innerHTML = "Realm of the galaxies across the centuries the carbon in our apple pies vanquish the impossible.";
      document.getElementById("cta-button").innerHTML = "Request My Area";
    }
  })

  // After location selection from dropdown, validate and fly to
  geocoder.on('clear', result => {
      document.getElementById("cta-container").className = "hidden";
      map.flyTo({center: mapOptions.center, zoom: mapOptions.zoom});
  })

  // Handle Submit buton click
  submit = function(event) {
    if (!selectedLocation) {
      return console.error("No Location Selected: ", selectedLocation)
    }
  }
  
  // Validate location against Dispatch locations
  isValidLocation = function(location) {
    var valid = dispatchCitiesFeatures.features.filter(feature => {
      // <= 50 KM
      return calcCrow(feature.geometry.coordinates[1], feature.geometry.coordinates[0], location.result.geometry.coordinates[1], location.result.geometry.coordinates[0]) <= 50;
      
      // if (feature.properties.place_name && feature.properties.place_name === location.result.place_name) {
      //   return feature;
      // }
    });

    if (valid.length === 1) return true;

    if (location.result.place_type[0] === 'region') {
      var stateMatch = dispatchCitiesFeatures.features.filter(feature => {
        if (feature.properties.place_name && feature.properties.place_name.includes(location.result.text)) {
          return feature;
        } 
      });

      if (stateMatch.length === 1) {
        return true;
      }
    }

    return false;
  }

  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  calcCrow = function(lat1, lon1, lat2, lon2) 
  {
    var R = 6371; // km - TODO: rewrite this to calc miles
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  toRad = function(Value) 
  {
      return Value * Math.PI / 180;
  }

  // Setup Map
  map.on('style.load', function() {
    document.getElementById('geocoder-container').appendChild(geocoder.onAdd(map));
  })
}
