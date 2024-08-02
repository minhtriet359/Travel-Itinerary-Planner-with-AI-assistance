let map;
let places={};
let markers={};
export let types=[];
const PLACE_TYPES = {
  see: "tourist_attraction",
  dining: "restaurant",
  cafe: "cafe",
  bar: "bar",
  hotel: "lodging",
  mall: "shopping_mall",
};

const defaultTypes=Object.keys(PLACE_TYPES);

//Map initialization
export async function initMap(center) {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 12,
    gestureHandling: 'greedy',
    mapId: '6a6872677ff3e032'
  });
  return map;
}

// Attach dragend event listener
export function attachDragendListener(map, getTypes) {
  map.addListener("dragend", async ()=>{
    const newCenter=map.getCenter().toJSON();
    clearMarkers();
    clearAllPlaceCards();
    clearPlaces();
    const types=getTypes();
    for (let type of defaultTypes){
      const results=await nearbySearch(newCenter, 6000, PLACE_TYPES[type]);
      if (results){
        results.forEach((result)=>savePlace(result, type));
      }
    }
    for (let type of types){
      addMarker(type);
      createPlaceCard(type);
    }
    updatePlaceNumber(types);
  });
}

//Search for nearby locations on the map based on type
export async function nearbySearch(center,radius,type) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const request = {
    // required parameters
    fields: ["displayName", "location", "businessStatus", "photos", "rating",	"svgIconMaskURI", "iconBackgroundColor", "userRatingCount", "addressComponents"],
    locationRestriction: {
      center: center,
      radius: radius,
    },
    // optional parameters
    includedPrimaryTypes: [type],
    maxResultCount: 15,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
  };
  let results = await Place.searchNearby(request);
  results= results.places;
  if(results.length){
    return results;
  }
}

//Add markers for all location with matching type to the map
export async function addMarker(type){
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  if(places[type]){
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
}

//Clear all markers from the map
export function clearMarkers(){
  for (const type in markers){
    markers[type].forEach((marker)=>{
      if (marker.map) marker.setMap(null);
    });
    markers[type]=[];
  };
}

//Store places in object
export function savePlace(place, type){
  const placesArr=Object.values(places).flat();
  if (placesArr.find((record)=>record.id===place.id)) return;
  places[type]?places[type].push(place):places[type]=[place];
}

//Clear places in object
export function clearPlaces(){
  places={};
}

//Update the total number of places displayed
export function updatePlaceNumber(types){
  document.getElementById('place-num').innerText='';
  let numPlaces=0;
  types.forEach((type)=>{
    if(places[type]){
      numPlaces+=places[type].length;
    }
  });
  if (numPlaces===1)
    document.getElementById('place-num').innerText=`${numPlaces} Place`;
  else
    document.getElementById('place-num').innerText=`${numPlaces} Places`;
}


// Event listeners
function addCardEventListeners() {
  // array with all place cards
  let allPlaces = document.querySelectorAll(".place-card"); 
  
  // add event listener for each place card
  for(let i = 0; i < allPlaces.length; i++) {
    allPlaces[i].addEventListener("click", addToItinerary);
  }

  // create an array with all of the add buttons
  // let allAddButtons = document.querySelectorAll(".addToItinerary");

  // // add on event listener for each button
  // for(let i = 0; i < allAddButtons.length; i++) {
  //   allAddButtons[i].addEventListener("click", displayLocation);
  // }
}

// add clicked place to Itinerary
function addToItinerary() {
  var service = new google.maps.places.PlacesService(map);
  // Define the place ID
  var placeId = this.id;
  //console.log(this.id);

  service.getDetails({ placeId: placeId }, function (place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Successfully fetched place details
      console.log('Place details:', place);
      let savedPlaceList=document.querySelector('.saved-place-list');
      let savedPlaceCardHTML=
        `
        <div class="saved-place-card" id="${place.id}">
          <div class="saved-place-content">
            <p class="place-name">${place.name}</p>
            <p class="place-address">${place.formatted_address}</p>
          </div>
        </div>
        `;
      savedPlaceList.innerHTML+=savedPlaceCardHTML;
    } else {
      // Handle errors
      console.error('Error getting place details');
    }
  })
}

//create and display the place card for type 
export function createPlaceCard(type){
  if(places[type]){
    places[type].forEach((place)=>{
      // console.log(place.id);
      const starPercentRounded=ratingCalc(place.rating);
      const numRatings=place.userRatingCount?place.userRatingCount.toLocaleString():'';
      let placeList=document.querySelector('.place-list');
      let placeCardHTML=
        `
        <div class="place-card" id="${place.id}">
          <button class="addToItinerary"> &#43 </button>
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
          <img class="place-img" src="${place.photos && place.photos[0] ? place.photos[0].getURI() : "https://via.placeholder.com/150"}" alt="${place.displayName} photo">
        </div>
        `;
      placeList.innerHTML+=placeCardHTML;
    });
  }
  addCardEventListeners();
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
  const address = `${streetNumber} ${streetName}, ${city}`;
  return address.trim();
}

//clear all place cards
export function clearAllPlaceCards(){
  document.querySelector('.place-list').innerHTML='';
}