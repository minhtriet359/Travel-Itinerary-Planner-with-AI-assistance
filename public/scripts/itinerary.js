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
const inpVals = ["destination", "startDate", "endDate", "duration", "guests"];
let types = Object.keys(PLACE_TYPES);
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const destination = getInpFromUrl(inpVals[0]);
const startDate = getInpFromUrl(inpVals[1]);
const endDate = getInpFromUrl(inpVals[2]);
const duration = getInpFromUrl(inpVals[3]);
const currentUrl = window.location.href;

renderHeader();
initializeMap();

/* ******** ITINERARY DETAIL SECTION ******** */

function calculateTripDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start date
}

const itineraryDetailGrid = document.querySelector(".itinerary-details");

//Generate itineray dates based on start/end dates
if (currentUrl.includes("startDate") && currentUrl.includes("endDate")) {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const duration = calculateTripDuration(startDateObj, endDateObj);
  const days = parseInt(duration, 10);
  for (let i = 0; i < days; i++) {
    itineraryDetailGrid.innerHTML += `
    <div class="accordion daily-schedule">
    <h3><div class="arrow right"></div> Day ${i + 1} </h3>
    <p></p>
    </div>
    `;
  }
  let accordions = document.querySelectorAll(".accordion");
  for (let accordion of accordions) {
    accordion.addEventListener("click", (event) => {
      if (accordion.classList.contains("show")) {
        accordion.classList.remove("show");
      } else {
        for (let accordion2 of accordions) {
          accordion2.classList.remove("show");
        }
        accordion.classList.add("show");
      }
    });
  }
}

//Generate itineray dates based on duration for home page itineraries
if (currentUrl.includes("duration")) {
  const place = destination.split(",")[1];
  const city = destination.split(",")[0];
  await displayItineraryInfo(city, place);
  const days = parseInt(duration, 10);
  for (let i = 0; i < days; i++) {
    itineraryDetailGrid.innerHTML += `
    <div class="accordion daily-schedule">
    <h3><div class="arrow right"></div> Day ${i + 1} </h3>
    <p></p>
    </div>
    `;
  }
  let accordions = document.querySelectorAll(".accordion");
  for (let accordion of accordions) {
    accordion.addEventListener("click", (event) => {
      if (accordion.classList.contains("show")) {
        accordion.classList.remove("show");
      } else {
        for (let accordion2 of accordions) {
          accordion2.classList.remove("show");
        }
        accordion.classList.add("show");
      }
    });
  }
}

// Get the days of the week
function getDaysOfWeek(startDateObj, endDateObj) {
  const days = [];
  let currentDate = new Date(startDateObj);
  while (currentDate <= endDateObj) {
    // Get the day of the week for the current date
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    // Add the day to the array
    days.push(dayOfWeek);
    // Increment the date by one day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
}

/* ******** POPULAR ITINERARIES OVERVIEW FUNCTIONS ******** */
async function displayItineraryInfo(city, place) {
  let response = await fetch(`/api/locations`);
  let itinerary = await response.json();
  let locationsArray = flattenLocations(itinerary);
  let placeData = findByPlaceCity(locationsArray, place, city);

  const itineraryHtml = `
          <h1>${placeData.place}</h1>
          <img src="${placeData.img}" alt="${placeData.place}" >
          <p>${placeData.details}</p>
  `;

  document.querySelector(".itinerary-overview").innerHTML += itineraryHtml;
}

function flattenLocations(locations) {
  let results = [];
  for (let key in locations) {
    let location = locations[key];
    for (let place of location) {
      results.push(place);
    }
  }
  return results;
}

function findByPlaceCity(array, place, city) {
  let result = null;
  for (let item of array) {
    if (item.place === place && item.city.includes(city)) {
      result = item;
      break;
    }
  }
  return result;
}

/* ******** MAP CONTROLLER ******** */
async function initializeMap() {
  const destination = getInpFromUrl(inpVals[0]);
  if (destination) {
    try {
      const { lat, lng } = await map.getLatLngFromAddress(destination);
      const googleMap = await initAndSetupMap({ lat, lng });
      console.log(googleMap.center);
    } catch (error) {
      console.log(error);
      //default location
      const googleMap = await initAndSetupMap({ lat: 61.2181, lng: -149.9003 });
      console.log(googleMap.center);
    }
  } else {
    const googleMap = await initAndSetupMap({ lat: 61.2181, lng: -149.9003 });
    console.log(googleMap.center);
  }
}

async function initAndSetupMap(center) {
  const gmap = await map.initMap(center);
  for (let type of types) {
    const results = await map.nearbySearch(
      gmap.center,
      6000,
      PLACE_TYPES[type],
    );
    if (results) {
      results.forEach((result) => map.savePlace(result, type));
    }
    map.addMarker(type);
    map.createPlaceCard(type);
  }
  map.updatePlaceNumber(types);
  // Attach dragend event listener
  map.attachDragendListener(gmap, getTypes);
  return gmap;
}

//Function to get current types
function getTypes() {
  return types;
}

// Function to get query parameter values by name
function getInpFromUrl(name) {
  return decodeURIComponent(
    new URLSearchParams(window.location.search).get(name),
  );
}

/* ******** FILTER BUTTONS CONTROLLER ******** */
document
  .querySelector(".place-detail-grid")
  .addEventListener("click", (element) => {
    if (element.target.closest(".filter-buttons")) {
      selectPlaceFilters(element);
    }
    if (element.target.closest("#filter-actions")) {
      applyFilterAction(element);
    }
  });

function selectPlaceFilters(element) {
  const filterLi = element.target.closest(".filter-li");
  if (filterLi) {
    const linkElement = filterLi.querySelector("a");
    if (linkElement) {
      linkElement.classList.toggle("selected");
    }
    console.log(linkElement);
  }
}

function applyFilterAction(element) {
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

function clearFilter() {
  console.log;
  document.querySelectorAll(".selected").forEach((action) => {
    action.classList.remove("selected");
  });
}

function updateType() {
  const selectedElems = Array.from(document.querySelectorAll(".selected"));
  if (selectedElems.length === 0) {
    types = Object.keys(PLACE_TYPES);
  } else {
    types = selectedElems.map((element) => element.parentNode.id);
  }
}

/* ******** CHATBOT REDIRECT ******** */
document.getElementById("assitant-button").addEventListener("click", () => {
  const destination = getInpFromUrl(inpVals[0]);
  window.location.href = `/chatbot?destination=${encodeURIComponent(destination)}`;
});
