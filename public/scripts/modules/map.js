let map;
const places={};
const markers={};

//Map initialization
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

//Search for nearby locations on the map based on type
export async function nearbySearch(center,radius,type) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
    "places",
  );
  const request = {
    // required parameters
    fields: ["displayName", "location", "businessStatus", "photos", "rating",	"svgIconMaskURI", "iconBackgroundColor", "userRatingCount", "addressComponents"],
    locationRestriction: {
      center: center,
      radius: radius,
    },
    // optional parameters
    includedPrimaryTypes: [type],
    maxResultCount: 10,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
  };
  let results = await Place.searchNearby(request);
  results= results.places;
  console.log(results[0]);
  if (results.length) {
    // Loop through and get all the results.
    results.forEach((result) => {
      savePlace(result, 'dining');
    });
    addMarker('dining');
  } else {
    console.log("No results");
  }
  updatePlaceNumber(['dining']);
  createPlaceCard('dining');
}

//Add markers for all location with matching type to the map
export async function addMarker(type){
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  places[type].forEach((place)=>{
    const pinElement = new PinElement({
      background: place.iconBackgroundColor,
      glyph: new URL(String(place.svgIconMaskURI)),
    });
    const markerView = new AdvancedMarkerElement({
      map,
      position: place.location,
      title: place.displayName,
      content: pinElement.element,
    });
    markers[type]?markers[type].push(markerView):markers[type]=[markerView];
  });
}


//Store places in object
export function savePlace(place, type){
  const placesArr=Object.values(places).flat();
  if (placesArr.find((record)=>record.id===place.id)) return;
  places[type]?places[type].push(place):places[type]=[place];
}

//Update the total number of places displayed
export function updatePlaceNumber(types){
  let numArr=[];
  let numPlaces=0;
  types.forEach((type)=>{
    numArr.push(places[type].length);
  });
  numArr.forEach((num)=>{
    numPlaces+=num;
  });
  if (numPlaces===1)
    document.getElementById('place-num').innerText=`${numPlaces} Place`;
  else
    document.getElementById('place-num').innerText=`${numPlaces} Places`;
}

//create and display the place card
export function createPlaceCard(type){
  places[type].forEach((place)=>{
    const starPercentRounded=ratingCalc(place.rating);
    const numRatings=place.userRatingCount.toLocaleString();
    let placeList=document.querySelector('.place-list');
    let placeCardHTML=
      `
      <div class="place-card" id="${place.id}">
        <div class="place-content">
          <div class="icon icon-${type}">
            <i class="material-icons">local_${type}</i>
          </div>
          <p class="place-name">${place.displayName}</p>
          <p class="place-address">${getPlaceAddress(place)}</p>
          <div class="place-rating">
            <div class="stars-outer">
              <div class="stars-inner" style="width:${starPercentRounded}"></div>
            </div>
            (${numRatings})
          </div>
        </div>
        <img class="place-img" src="${place.photos[0].getURI()}" alt="${place.displayName} photo">
      </div>
      `;
    placeList.innerHTML+=placeCardHTML;
  });
}

function ratingCalc(rating) {
  const starPercentage = (rating / 5) * 100;
  return `${Math.round(starPercentage / 10) * 10}%`;
}

function getPlaceAddress(place) {
  let streetNumber = "";
  let streetName = "";
  let city = "";
  place.addressComponents.forEach(component => {
    // Check for street number
    if (component.types.includes("street_number")) {
      streetNumber = component.longText;
    }
    // Check for street name
    if (component.types.includes("route")) {
      streetName = component.longText;
    }
    // Check for city
    if (component.types.includes("locality")) {
      city = component.longText;
    }
  });
  // Construct the full address
  console.log(streetNumber, streetName)
  const address = `${streetNumber} ${streetName}, ${city}`;
  return address.trim();
}

