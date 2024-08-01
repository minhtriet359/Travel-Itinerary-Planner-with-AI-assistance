import { renderHeader } from './shared/header.js';
import * as map from './modules/map.js';

renderHeader();

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

console.log("Itinerary page loaded");




map.initMap({ lat: 61.2181, lng: -149.9003 });
