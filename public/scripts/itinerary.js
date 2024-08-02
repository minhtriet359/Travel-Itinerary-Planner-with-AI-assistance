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

const destination = new URLSearchParams(window.location.search).get('destination');

const place = destination.split(',')[1];
const city = destination.split(',')[0];
console.log('Clicked itinerary link with destination:', destination, city, place);
await displayItineraryInfo(city, place);

async function displayItineraryInfo(city, place){
  let response = await fetch(`/api/locations`);
  let itinerary = await response.json();  
  console.log(itinerary);

  // let location = itinerary[place];
  // console.log(location);
  let locationsArray = flattenLocations(itinerary);
  let placeData = findByPlaceCity(locationsArray, place, city);
  console.log(placeData);

  const itineraryHtml = `
          <h1>${placeData.place}</h1>
          <img src="${placeData.img}" alt="${placeData.place}">
          <p>${placeData.details}</p>
          <p><strong>Duration:</strong> ${placeData.duration}</p>
          <h2>Cities:</h2>
          <p>${placeData.city.join(', ')}</p>
  `;

  document.querySelector('.itinerary-details').innerHTML = itineraryHtml;
  }

function flattenLocations(locations){
    let results = [];
    for (let key in locations){
        let location = locations[key];
        for (let place of location){
            results.push(place);
        }
    }
    console.log(results);
    return results;
}

function findByPlaceCity(array, place, city){
    console.log(array, place, city);
    let result = null;
    for (let item of array){
        console.log(item);
        if (item.place === place && item.city.includes(city)) {
            result = item;
            break;
        }
    }
    return result;
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
