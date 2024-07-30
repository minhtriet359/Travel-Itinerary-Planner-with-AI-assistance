import { renderHeader } from "./shared/header.js";

const locations = {
  "North America":
  [
    {
      id: 1, 
      place: "Alaska", 
      duration: "10 Days", 
      img: "/img/location-photos/Alaska.jpg", 
      city:["Anchorage", "Kenai Fjords", "Denali"]
    },
    {
      id: 2, 
      place: "California", 
      duration: "7-10 Days", 
      img: "/img/location-photos/California.jpg", 
      city:["SF", "Monterey", "LA", "San Diego"]
    }
  ],
  Europe:
    [
      {
        id: 1, 
        place: "Italy", 
        duration: "14 Days", 
        img: "/img/location-photos/Italy.jfif", 
        city:["Rome", "Sorrento", "Tuscany", "Cinque Terre", "Venice"]
      },
      {
        id: 2, 
        place: "Portugal", 
        duration: "14 Days", 
        img: "/img/location-photos/Portugal.jpg", 
        city: ["Lisbon", "Porto", "Algarve"]
      }
    ],
  Asia:
    [
      {
        id: 1, 
        place: "Korea", 
        duration: "10 Days", 
        img: "/img/location-photos/seoul.jpg", 
        city:["Seoul", "Busan", "Jeju", "Incheon"]
      },
      {
        id: 2, 
        place: "China", 
        duration: "10-12 Days", 
        img: "/img/location-photos/china.png", 
        city: ["Beijing", "Shanghai", "Northern China"]
      }  
    ],
  Oceania: 
    [
      {
        id: 1, 
        place: "Australia", 
        duration: "10-14 Days", 
        img: "/img/location-photos/australia.png", 
        city:["Sydney", "Melbourne", "Kakadu", "Queensland"]
      },
      {
        id: 2, 
        place: "New Zealand", 
        duration: "8 Days", 
        img: "/img/location-photos/new_zealand.png", 
        city: ["Auckland", "Queenstown", "Wellington"]
      }
    ]
};

let itineraryHtml = "";

for (let continent in locations) {
  itineraryHtml += `<h1>${continent}</h1>`;
  itineraryHtml += `<div class="itinerary-grid">`;
  for (let location of locations[continent]){
    itineraryHtml += 
      `<a class="itinerary-detail-link" href='/itinerary-detail'>
        <div class="itinerary-preview">
          <div class="thumbnail-row">
            <img class="thumbnail-photo" src=${location.img}>
            <p class="thumbnail-intro">${location.place}</p>
            <div class="trip-duration">${location.duration}</div>
          </div>
          <div class="trip-info">
            <p>${location.city.join(' | ')}</p>
          </div>
        </div>
      </a>`;
  };
  
  itineraryHtml += `</div>`;
  
}

document.querySelector('.main-home').innerHTML=itineraryHtml;

renderHeader();

console.log("Home page loaded");