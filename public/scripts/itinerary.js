import { renderHeader } from "./shared/header.js";
import * as map from "./modules/map.js";

const PLACE_TYPES = {
  see: "tourist_attraction",
  dining: "restaurant",
  cafe: "cafe",
  bar: "bar",
  hotel: "lodging",
  mall: "shopping_mall",
};
const inputValues = ["destination", "startDate", "endDate", "guests"];

const types=Object.values(PLACE_TYPES);


renderHeader();
initializeMap();

const id = new URLSearchParams(window.location.search).get('id');
console.log('Clicked itinerary link with ID:', id);
await displayItineraryInfo(id);

async function displayItineraryInfo(id){
  let response = await fetch(`/api/itinerary/${id}`);
  let itinerary = await response.json();  
  console.log(itinerary);

  const itineraryHtml = `
          <h1>${itinerary.place}</h1>
          <img src="${itinerary.img}" alt="${itinerary.place}">
          <p>${itinerary.details}</p>
          <p><strong>Duration:</strong> ${itinerary.duration}</p>
          <h2>Cities:</h2>
          <p>${itinerary.city.join(', ')}</p>
  `;
  
  document.querySelector('.itinerary-details').innerHTML = itineraryHtml;
  }

async function initializeMap() {
  const destination = getInpFromUrl(inputValues[0]);

  if (destination) {
    try {
      const { lat, lng } = await getLatLngFromAddress(destination);
      await initAndSetupMap({ lat, lng });
    } catch (error) {
      console.log(error);
      //default location
      await initAndSetupMap({ lat: 61.2181, lng: -149.9003});
    }
  } else {
    await initAndSetupMap({ lat: 61.2181, lng: -149.9003});
  }

async function initAndSetupMap(center){
  const gmap= await map.initMap(center);
  for (let type of types){
    map.nearbySearch(gmap.center, 6000, type);
  }
  // Attach dragend event listener
  map.attachDragendListener(gmap, getTypes);
}

// Function to get query parameter values by name
function getInpFromUrl(name) {
  return decodeURIComponent(
    new URLSearchParams(window.location.search).get(name),
  );
}

//Function to get lat and lng from address
async function getLatLngFromAddress(address) {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        resolve({ lat: lat(), lng: lng() });
      } else {
        reject(
          "Geocode was not successful for the following reason: " + status,
        );
      }
    });
  });
}
}

//Function to get current types
function getTypes(){
  return types;
}
