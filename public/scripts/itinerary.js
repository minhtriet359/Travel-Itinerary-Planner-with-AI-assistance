import { renderHeader } from './shared/header.js';
import * as map from './modules/map.js';

console.log("Itinerary page loaded");

map.initMap({ lat: -34.397, lng: 150.644 });

renderHeader();
