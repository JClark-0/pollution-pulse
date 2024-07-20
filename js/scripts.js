

//Pollution Pulse uses AQI air quality data to give the AQI and pollutant concentrations of your current location and others you choose to search.
//Make sure location is allowed.

// ------- Create Database -------
let database = [];

// ------- Latitude & Longitude Current Location ------- 
document.addEventListener('DOMContentLoaded', () => {
  navigator.geolocation.getCurrentPosition((position) => {
    lat =(position.coords.latitude);
    lng = (position.coords.longitude);
    fetchData(lat, lng); 
  });
});

function fetchData(lat,lng) {
  let urlPollutant = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_carbon_monoxide,us_aqi_ozone,us_aqi_sulphur_dioxide&timezone=auto&past_hours=1&forecast_days=1&forecast_hours=1`;
  fetch(urlPollutant)
  .then((response) => response.json())
  .then((data) => {
    data.realLatitude = lat;
    data.realLongitude = lng;
    database.splice(0, 0, data);
    renderOnScreen(database[0]);
    // console.log("fetchdata database:", database);
  })
  .catch((error) => {
    console.error('Error', error);
  });
};

// ------- Get lat & lng based on searched location ------- 
const geocodingData = (searchVal) => {
  const geoCoding = `https://geocoding-api.open-meteo.com/v1/search?name=${searchVal}&count=1&language=en&format=json`;
  fetch(geoCoding)
  .then((response) => response.json())
  .then((data) => { 
    if (data.results) {
      const lat = data.results[0].latitude;
      const lng = data.results[0].longitude;
      searchLocation(lat, lng);
    } else {
      alert("City not found, try again.");
      console.log("City not found, try again.");
    }
  })
};



// --- Searched location ready to render ---
function searchLocation(lat,lng) {
  let urlPollutant = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_carbon_monoxide,us_aqi_ozone,us_aqi_sulphur_dioxide&timezone=auto&past_hours=1&forecast_days=1&forecast_hours=1`;
  fetch(urlPollutant)
  .then((response) => response.json())
  .then((data) => {
    data.realLatitude = lat;
    data.realLongitude = lng;
    database.push(data)
    renderOnScreen(database[database.length-1]);
    showLocation(lat,lng);
    // console.log("searched location database:", database);
  })
  .catch((error) => {
    console.error('Error', error);
  });
};


// ------- Show Location Name ------- 
const showLocation = (lat, lng) => {
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  fetch(`https://us1.locationiq.com/v1/reverse?lat=${lat}&lon=${lng}&format=json&key=pk.83485c19ebc3983a826192780bdd4e9c`, options)
    .then(response => response.json())
    .then(response => { 
      // console.log(response);
      let locationName = document.getElementById('locationId');
        if (response.address.country.includes('United States of America')) {
          locationName.innerHTML = response.address.city + ', ' + response.address.state;
          // +', ' + 'USA'
          } else  {
          locationName.innerHTML = response.address.city + ', ' + response.address.country;
        }
    })
    .catch(err => console.error(err));
};


// ======== RENDER ON PAGE =========
const renderOnScreen = (data) => {
  
  // ------- Changes value on variable (opacity + display) -------
  document.documentElement.style.setProperty('--on_load', 100);
  document.documentElement.style.setProperty('--on_load_flex', 'flex');
  document.documentElement.style.setProperty('--display', 'none');

    // ------- Show real Location -------
    showLocation (data.realLatitude, data.realLongitude);

  // ------- Clear Pollutant circles -------
  document.querySelectorAll('.pollutants').forEach(box => {
    box.innerHTML = ''; 
  });
  // ------- Calling Pollutant Functions ------- 
  pollutants.forEach(pollutant => {
    createPollutant( data, pollutant.name, pollutant.countId, pollutant.styleClass);
    showData(data, pollutant.name, pollutant.statId, pollutant.unitId);
    scrollPollutant(pollutant.countId, pollutant.infoBoxId); 
    expandPollutant(pollutant.infoBoxId, pollutant.expandedId);
  });



  // ------- LOCAL TIME ------- 
  const timezone = data.timezone;
  const currentTimeTimezone = new Date().toLocaleTimeString("en-US", { timeZone: timezone, hour12: false, hour: '2-digit', minute: '2-digit' });
  // ------- Show local time ------- 
  let localTime = document.getElementById('localTime');
  localTime.innerHTML = currentTimeTimezone;
  // ------- Extract hour from the formatted time -------
  const hour = parseInt(currentTimeTimezone.split(":")[0]);
  
  // ------- Show icon based on time ------- 
  let icon = document.getElementById('timeIcon');
  if (hour >= 6 && hour < 18) {
      icon.src = "assets/icons/sun.svg";
  } else {
      icon.src = "assets/icons/night.svg";
  }
  

  // ------- AQI ------- 
  let aqi = data.current.us_aqi;
  let aqi_num = document.getElementById('aqi');
  aqi_num.innerHTML = aqi +' AQI';
  aqiCondition(aqi);

};





// ======== POLLUTANT FUNCTIONS & OBJECTS =========
// ------- Pollutant Objects -------
const pollutants = [
  { name: 'pm2_5', countId: 'pm2_5_count', styleClass: 'pm2_5', statId:'pm2_5_data', unitId:'pm2_5UnitId', infoBoxId:'pm2_5box', expandedId:'pm2_5Expanded' },
  { name: 'pm10', countId: 'pm10_count', styleClass: 'pm10', statId:'pm10_data', unitId:'pm10UnitId', infoBoxId:'pm10box', expandedId:'pm10Expanded' },
  { name: 'ozone', countId: 'ozone_count', styleClass: 'ozone', statId:'ozone_data', unitId:'ozoneUnitId', infoBoxId:'ozonebox', expandedId:'ozoneExpanded' },
  { name: 'carbon_monoxide', countId: 'cm_count', styleClass: 'cm', statId:'cm_data', unitId:'cmUnitId', infoBoxId:'cmbox', expandedId:'cmExpanded' },
  { name: 'nitrogen_dioxide', countId: 'nd_count', styleClass: 'nd', statId:'nd_data', unitId:'ndUnitId', infoBoxId:'ndbox', expandedId:'ndExpanded' },
  { name: 'sulphur_dioxide', countId: 'sd_count', styleClass: 'sd', statId:'sd_data', unitId:'sdUnitId', infoBoxId:'sdbox', expandedId:'sdExpanded' }
]

// -------  Function: Circles from pollutant count ------- 
const createPollutant = (data, name, countId, styleClass) => {
  const pollutantCount = data.current[name];
  const pollutantCountElement = document.getElementById(countId);

  //Loop through the pollutant count 
  for (let i = 0; i < pollutantCount; i++) {
    let circle = document.createElement('div');
    circle.classList.add(styleClass, 'pollutant');
    
    //Animate circles
    circle.style.left = Math.random() * window.innerWidth + 'px';
    circle.style.top = Math.random() * window.innerHeight + 'px';
    let directionX = Math.random(); 
    let directionY = Math.random(); 
    circle.style.animation = `moveSpore ${Math.random() * 40 + 20}s linear infinite`;
    circle.style.animationDirection = directionX === 1 ? 'normal' : 'reverse';
    
    //Display
    pollutantCountElement.appendChild(circle);
  }
};

// ------- Function: Show pollutant data ------- 
const showData = (data, name, statId, unitId) => {
    
    let pollutantData = document.getElementById(statId);
    pollutantData.innerHTML = data.current[name];

    let pollutantUnit = document.getElementById(unitId);
    pollutantUnit.innerHTML = data.current_units[name];
};

// ------- Scroll to pollution info on click ------- 
const scrollPollutant = (countId, infoBoxId) => {
  var targetBox = document.getElementById(infoBoxId);
  var listItem = document.getElementById(countId);
  
  listItem.addEventListener('click', function(){
    targetBox.scrollIntoView({ behavior: 'smooth' });
    targetBox.classList.add('box_highlight');

    setTimeout(function() {
      targetBox.classList.remove('box_highlight');
    }, 1000);
  });
}


// ------- Expand to pollution info on click ------- 
const expandPollutant = (infoBoxId, expandedId) => {

  document.getElementById(infoBoxId).onclick = () => {

    const pollutantExpanded = document.getElementById(expandedId);
    const infoBox = document.getElementById(infoBoxId)
    const closePopup = document.querySelectorAll('.close_expanded_pol');

    infoBox.onclick = () => {
      if (pollutantExpanded.style.display === 'none' ) { 
        document.querySelectorAll('.pollutant_expanded').forEach(element => {
          element.style.display='none';
        });
        pollutantExpanded.style.display = 'block';
      } else {
        pollutantExpanded.style.display = 'none';
      }

      closePopup.forEach(icon => { 
        icon.onclick = () => {
          pollutantExpanded.style.display = 'none';
        }
      });
    };
  };
}


// ======== AQI FUNCTIONS =========
// ------- AQI Page Styling function ------- 
const aqiConditionStyles = (properties) => {
  Object.entries(properties).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property,value);
  });
}
// ------- AQI Condition Control ------- 
const aqiCondition = (aqi) => {
  let conditionText = '';
  let adviceText = '';
  let warningIcon = '';

  if (aqi <= 50){
    conditionText = 'Good';
    adviceText = 'It’s a great day to be active outside. Open your windows to bring clean, fresh air indoors.';
    warningIcon = 'none';
    aqiConditionStyles({
      '--pm2_5': '#B0F35C',
      '--pm10': '#1CB659',
      '--ozone': '#53D5C5',
      '--cm': '#63EC9A',
      '--sd': '#9DE6F6',
      '--nd': '#CAF98D',
      '--page-bg': '#F5F5F5',
      '--btn-color': '#CAF98D'
    });
  } else if ( aqi >= 51 && aqi <= 100) {
    conditionText = 'Moderate';
    adviceText = '<a id="sgId" class="sg">Sensitive groups</a> should reduce outdoor activity today.';
    aqiConditionStyles({
      '--pm2_5': '#FFD700',
      '--pm10': '#FFA500',
      '--ozone': '#FF8C00',
      '--cm': '#FF6347',
      '--sd': '#FFDAB9',
      '--nd': '#FFD700',
      '--page-bg': '#f7f3e8',
      '--btn-color': 'rgb(243, 196, 57)'
    });
  } else if (aqi >= 101 && aqi <= 150) {
    conditionText = 'Unhealthy (USG*)';
    aqiConditionStyles({
      '--pm2_5': '#FF6347',
      '--pm10': '#FFA500',
      '--ozone': '#FFD700',
      '--cm': '#FF4500',
      '--sd': '#8B0000',
      '--nd': '#bd3535',
      '--page-bg': '#FFF3E8',
      '--btn-color': '#f7816c'
    });
    adviceText = 'Everyone should limit outdoor activities today. <a id="sgId" class="sg">Sensitive groups</a> should wear a mask outdoors. ';
  } else if (aqi >= 151 && aqi <= 200) {
    conditionText = 'Unhealthy';
    adviceText = 'Everyone should avoid prolonged outdoor activities today. Close your windows and wear a mask outdoors.';
    aqiConditionStyles({
      '--pm2_5': '#FF6347',
      '--pm10': '#FFA500',
      '--ozone': '#FFD700',
      '--cm': '#FF4500',
      '--sd': '#8B0000',
      '--nd': '#bd3535',
      '--page-bg': '#FFF3E8',
      '--btn-color': '#f76c6c'
    });
  } else if (aqi >= 201 && aqi <= 300) {
    conditionText = 'Very Unhealthy';
    adviceText = 'Everyone should avoid outdoor activities today. Close your windows and wear a mask outdoors.';
    aqiConditionStyles({
      '--pm2_5': '#FF6347',
      '--pm10': '#FFA500',
      '--ozone': '#FFD700',
      '--cm': '#FF4500',
      '--sd': '#8B0000',
      '--nd': '#800000',
      '--page-bg': '#FFF3E8',
      '--btn-color': 'ff5050'
    });
  } else if (aqi >= 301 && aqi <= 500) {
    conditionText = 'Hazardous';
    adviceText = 'Warning: Everyone should avoid all activity outdoors today and keep windows closed.';
    aqiConditionStyles({
      '--pm2_5': '#FF6347',
      '--pm10': '#FFA500',
      '--ozone': '#FFD700',
      '--cm': '#FF4500',
      '--sd': '#8B0000',
      '--nd': '#800000',
      '--page-bg': '#FFF3E8',
      '--btn-color': 'ff5050'
    });
  }

  document.getElementById('condition').textContent = conditionText;
  document.getElementById('aqi_advice').innerHTML = adviceText;
  document.querySelector('.condition_icon').style.setProperty('display', warningIcon);

  
};

const sgIdCheck = document.getElementById('sgId');
  if (sgIdCheck) {

    sgIdCheck.onclick = () => {
      const expandedElement = document.getElementById('sgExpanded');
    
      if (expandedElement.style.display === 'none') { 
      document.querySelectorAll('.expanded_element').forEach(element => {
        element.style.display = 'none';
      });
      expandedElement.style.display = 'block';
      } else {
        expandedElement.style.display = 'none';
      }
      const closePopup = document.querySelectorAll('.close_expanded_pol');
      closePopup.forEach(icon => { 
        icon.onclick = () => {
          sgExpanded.style.display = 'none';
        };
      })
    };
  }

// ======== PAGE CONTROL =========
const currentLocation = document.getElementById('loc_btn');
let currentLocationIndex = 0;


// ------- Current Location  ------- 
currentLocation.onclick = () => {
  currentLocationIndex = 0
  renderOnScreen(database[currentLocationIndex]);
  currentLocation.classList.add("control_btn_active");
};

// ------- Search Control (Enter) ------- 
const input = document.getElementById("search");
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const searchVal = input.value;
    input.value = ""; 
    console.log(searchVal);
    geocodingData(searchVal);

    currentLocation.classList.remove("control_btn_active"); //remove active state of current location button
  }
});



// ------- Advice Control ------- 
const minimizeButton = document.getElementById('minimize_button');
const expandButton = document.getElementById('expand_button');
const aqiDetails = document.querySelector('.aqi_details');

minimizeButton.addEventListener('click', () => {
    aqiDetails.classList.add('minimized');
    aqiDetails.classList.remove('expanded');
  });

expandButton.addEventListener('click', () => {
  aqiDetails.classList.remove('minimized');
  aqiDetails.classList.add('expanded');
});

