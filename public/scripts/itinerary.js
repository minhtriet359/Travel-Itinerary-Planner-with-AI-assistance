import { renderHeader } from './shared/header.js';
import * as map from './modules/map.js';

console.log("Itinerary page loaded");

renderHeader();

map.initMap({ lat: 61.2181, lng: -149.9003 });
