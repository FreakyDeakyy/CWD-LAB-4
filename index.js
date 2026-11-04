const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const countryInput = document.getElementById("countryInput");
const getWeatherBtn = document.querySelector("#getWeatherBtn");
const errorMessage = document.getElementById("errorMessage");
const locationText = document.getElementById("location");
const currentTemperature = document.getElementById("currentTemperature");
const apparentTemperature = document.getElementById("apparentTemperature");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
getWeatherBtn.addEventListener("click", () => {
  if (
    !cityInput.value.trim() ||
    !stateInput.value.trim() ||
    !countryInput.value.trim()
  ) {
    errorMessage.textContent =
      "Please fill in all fields: city, state, and country.";
    errorMessage.style.visibility = "visible";
    return;
  }
  errorMessage.textContent = "";
  errorMessage.style.visibility = "hidden";
  const encodedCity = encodeURIComponent(cityInput.value);
  createSearchURL(encodedCity);
});

function createSearchURL(city) {
  let baseURL = "https://geocoding-api.open-meteo.com/v1/search?";
  let queryParams = `name=${city}`;
  let searchURL = baseURL + queryParams;
  getLocationData(searchURL);
}

async function getLocationData(searchURL) {
  try {
    const response = await fetch(searchURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    correctLocation(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    clearDataTable();
    errorMessage.textContent = `Error fetching weather data. Please try again. Details: ${error.message}`;
    errorMessage.style.visibility = "visible";
  }
}
function clearDataTable() {
  locationText.textContent = "";
  currentTemperature.textContent = "";
  apparentTemperature.textContent = "";
  windSpeed.textContent = "";
  humidity.textContent = "";
}
function correctLocation(data) {
  try {
    let found = false;
    if (!data.results || data.results.length === 0) {
      throw new Error("No results found for the specified city.");
    }
    for (let i = 0; i < data.results.length; i++) {
      if (
        data.results[i].country === countryInput.value &&
        data.results[i].admin1 === stateInput.value
      ) {
        fillDataTable(data.results[i]);
        found = true;
        break;
      }
    }
    if (found === false) {
      throw new Error(
        "No matching country and state found for the specified city.",
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
    clearDataTable();
    errorMessage.textContent = error.message;
    errorMessage.style.visibility = "visible";
    return;
  }
}

async function fillDataTable(locationData) {
  const lat = locationData.latitude;
  const lon = locationData.longitude;
  const baseURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`;

  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const weatherData = await response.json();
    locationText.textContent = `${locationData.name}, ${locationData.admin1}, ${locationData.country}`;
    currentTemperature.textContent = `${weatherData.current.temperature_2m}°C`;
    apparentTemperature.textContent = `${weatherData.current.apparent_temperature}°C`;
    windSpeed.textContent = `${weatherData.current.wind_speed_10m} km/h`;
    humidity.textContent = `${weatherData.current.relative_humidity_2m} %`;
  } catch (error) {
    clearDataTable();
    console.error("Error fetching weather forecast data:", error);
    errorMessage.textContent = `Error fetching weather forecast data. Please try again. Details: ${error.message}`;
    errorMessage.style.visibility = "visible";
  }
}
