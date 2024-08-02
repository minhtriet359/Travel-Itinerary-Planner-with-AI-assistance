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

let types=Object.keys(PLACE_TYPES);


renderHeader();
initializeMap();

/* ******** MAP CONTROLLER ******** */
async function initializeMap() {
  const destination = getInpFromUrl(inputValues[0]);
  if (destination) {
    try {
      const { lat, lng } = await getLatLngFromAddress(destination);
      console.log('here1');
      await initAndSetupMap({ lat, lng });
    } catch (error) {
      console.log(error);
      //default location
      await initAndSetupMap({ lat: 61.2181, lng: -149.9003});
    }
  } else {
    console.log('here2');
    await initAndSetupMap({ lat: 61.2181, lng: -149.9003});
  }

async function initAndSetupMap(center){
  const gmap= await map.initMap(center);
  for (let type of types){
    const results=await map.nearbySearch(gmap.center, 6000, PLACE_TYPES[type]);
    if(results){results.forEach((result)=>map.savePlace(result,type));}; 
    map.addMarker(type);
    map.createPlaceCard(type);
  }
  map.updatePlaceNumber(types);
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

/* ******** FILTER BUTTONS CONTROLLER ******** */
document.querySelector(".place-detail-grid").addEventListener('click', (element)=>{
  if(element.target.closest('.filter-buttons')){
    selectPlaceFilters(element);
  }
  if(element.target.closest('#filter-actions')){
    applyFilterAction(element);
  }
});


function selectPlaceFilters(element){
  const filterLi = element.target.closest(".filter-li");
  if (filterLi) {
    const linkElement = filterLi.querySelector('a');
    if (linkElement) {
      linkElement.classList.toggle("selected");
    }
  }
};

function applyFilterAction(element){
  const applyAction = element.target.closest("#apply-filter");
  const clearAction = element.target.closest("#clear-filter");
  if (!applyAction && !clearAction) return;
  if (clearAction) {
    clearFilter();
  }
  updateType();
  map.clearMarkers();
  types.forEach((type) => map.addMarker(type));
  map.clearAllPlaceCards();
  types.forEach((type) => map.createPlaceCard(type));
  map.updatePlaceNumber(types);
}

function clearFilter(){
  console.log
  document.querySelectorAll(".selected").forEach((action)=>{
    action.classList.remove("selected");
  });
};

function updateType(){
  const selectedElems=Array.from(document.querySelectorAll(".selected"));
  if(selectedElems.length===0){
    types=Object.keys(PLACE_TYPES);
  }else{
    types=selectedElems.map((element)=>element.parentNode.id);
  }
}