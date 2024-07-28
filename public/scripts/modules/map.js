let map;

export async function initMap(center) {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 12,
    gestureHandling: 'greedy',
    mapId: '6a6872677ff3e032'
  });
  nearbySearch(center, 50000, 'restaurant');
}

export async function nearbySearch(center,radius,type) {
  //@ts-ignore
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
    "places",
  );
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const request = {
    // required parameters
    fields: ["displayName", "location", "businessStatus"],
    locationRestriction: {
      center: center,
      radius: radius,
    },
    // optional parameters
    includedPrimaryTypes: [type],
    maxResultCount: 10,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
  };
  //@ts-ignore
  const { places } = await Place.searchNearby(request);
  if (places.length) {
    console.log(places);
    
    // const { LatLngBounds } = await google.maps.importLibrary("core");
    // const bounds = new LatLngBounds();

    // Loop through and get all the results.
    places.forEach((place) => {
      const markerView = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      // bounds.extend(place.location);
      console.log(place);
    });
    // map.fitBounds(bounds);
  } else {
    console.log("No results");
  }
}

