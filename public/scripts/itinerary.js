import { renderHeader } from './shared/header.js';
import * as map from './modules/map.js';

renderHeader();
renderItinerayDetailPage();

const PLACE_TYPES = {
  see: "tourist_attraction",
  dining: "restaurant",
  cafe: "cafe",
  bar: "bar",
  hotel: "lodging",
  mall: "shopping_mall",
};
const inputValues = ['destination', 'startDate', 'endDate', 'guests'];

async function renderItinerayDetailPage(){
  const destination=getInpFromUrl('destination');
  
  if(destination){
    try{
      const {lat,lng} = await getLatLngFromAddress(destination);
      map.initMap({lat,lng})
    }catch(error){
      map.initMap({ lat: 61.2181, lng: -149.9003 }); //default location
    }
  }else{
     map.initMap({ lat: 61.2181, lng: -149.9003 }); //default location
  }

  
  // Function to get query parameter values by name
  function getInpFromUrl(name) {
      return decodeURIComponent(new URLSearchParams(window.location.search).get(name));
  }

  async function getLatLngFromAddress(address) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          resolve({ lat: lat(), lng: lng() });
        } else {
          reject('Geocode was not successful for the following reason: ' + status);
        }
      });
    });
  }
}

