const OPENCAGE_KEY = "1a288ca10dbf46eeb83fdac811333c11";
const OPENCAGE_ENDPOINT = "https://api.opencagedata.com/geocode/v1/json?";

const OPENWEATHER_KEY = "7f54ef25d012df1afab8bcc773e77d4e";
const OPENWEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/onecall?";

const SUNRISE_ENDPOINT = "https://api.sunrise-sunset.org/json?";

const forecastSection = document.querySelector(".forecasts");
const searchCity = document.querySelector("#citySearch");
const daysSelect = document.querySelector("select.days");
const cityLabel = document.querySelector(".cityLabel");

let searchTimeout;

function getPosition(city) {
    let request = OPENCAGE_ENDPOINT 
                + "key="
                + OPENCAGE_KEY
                + "&q=" 
                + city
                + "&limit=1";

    return fetch(request)
            .then(data => {
                return data.json();
            })
            .then(jsonData => {
                cityLabel.textContent = jsonData.results[0].formatted;
                return jsonData;
            })
            .then(jsonData => jsonData.results[0].geometry)
            .catch((err) => console.log("Problem when looking for searched city position", err));
}

function getWeather(lat, long) {
    let request = OPENWEATHER_ENDPOINT
                + "lat="
                + lat
                + "&lon="
                + long
                + "&appid="
                + OPENWEATHER_KEY;

    return fetch(request)
            .then(res => res.json());
}

function showDay(forecast) {    
    const dayContainer = document.createElement("div");
    dayContainer.setAttribute("class", "forecasts-day");
    
    const dayLabel = document.createElement("p");
    const forecastDay = new Date(forecast.dt * 1000);
    const weekday = forecastDay.toLocaleString("en-US", {weekday: "long"});
    dayLabel.textContent = weekday;
    dayContainer.append(dayLabel);
    
    const dayIcon = document.createElement("img");
    const forecastId = forecast.weather[0].id;
    const message = `is the weather forecast for ${weekday}`;
    setIcon : { 
        if (forecastId == 800) {
            setImage(dayIcon, "sun", "Clear sky " + message);
            break setIcon;
        }
        if (forecastId >= 600 && forecastId < 700) {
            setImage(dayIcon, "snow", "Snow " + message);
            break setIcon;
        }
        if (forecastId == 801 || forecastId == 802) {
            setImage(dayIcon, "cloudy", "Lightly cloudy " + message);
            break setIcon;
        }
        if (forecastId == 803 || forecastId == 804) {
            setImage(dayIcon, "clouds", "Heavy clouds " + message);
            break setIcon;
        }
        
        // Default case
        setImage(dayIcon, "rain", "Rain " + message);      
    }  
    dayContainer.append(dayIcon);
    
    forecastSection.append(dayContainer);
}

function setImage(imageElement, file, alternate) {
    imageElement.setAttribute("src", `./icons/${file}.svg`);
    imageElement.setAttribute("alt", alternate);
    imageElement.setAttribute("class", "forecasts-icon");
}

function removeForecasts() {
    if (forecastSection.hasChildNodes) {
        while (forecastSection.firstChild) {
            forecastSection.removeChild(forecastSection.firstChild);
        }
    }
}

function nightBackground(weather) {
    const body = document.querySelector("body");
    const dayLabels = document.querySelectorAll(".forecasts-day p");
    const dayIcons = document.querySelectorAll(".forecasts-icon")

    if (weather.current.dt < weather.current.sunrise || 
        weather.current.dt > weather.current.sunset) {  
        if (!body.classList.contains("nuit")) {
            body.classList.add("nuit");
        } 
        dayLabels.forEach(day => day.classList.add("lightText"));
        dayIcons.forEach(icon => icon.classList.add("lightIcon"));
    } else {
        if (body.classList.contains("nuit")) {
            body.classList.remove("nuit");    
        }
        dayLabels.forEach(day => day.classList.remove("lightText"));
        dayIcons.forEach(icon => icon.classList.remove("lightIcon"));
    }
}

function showWeather(city) {
    getPosition(city)
        .then(coords => {
            return coords;
        })
        .then(coords => {
            return getWeather(coords.lat, coords.lng);
        })
        .then(weather => {
            console.log(`Weather in ${city} : `, weather);
            
            removeForecasts();
            
            const weatherFiltered = weather.daily.slice(0, daysSelect.value);
            weatherFiltered.forEach(day => showDay(day));
            
            nightBackground(weather);
        })
}

document.querySelector("#weatherSearch").addEventListener("submit", function(event) {
    event.preventDefault();
    const receivedCity = event.path[0][0].value;

    // if the search field has received a value, do the API requests
    if (receivedCity) {
        const city = receivedCity.trim();
        showWeather(city);
    } 

    // If the search field is emptied, remove the previous forecast results
    removeForecasts()
});

citySearch.addEventListener("keyup", (event) => {
    if (!event.target.value || event.target.value.length == 1) {
        removeForecasts();
        return;
    }

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        showWeather(event.target.value.trim());
    }, 1000)
});

daysSelect.addEventListener("change", function() {
    console.log("Searching weather for city : ", searchCity.value)
    showWeather(searchCity.value);
})
