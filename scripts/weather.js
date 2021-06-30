/**
 * All functions related to the weather component.
 */

/**
 * Loads the weather component to the DOM.
 */
function loadWeather() {
  const LAT = 33.97001973022271;
  const LON = -118.41454892413182;
  // For docs on the API response check https://openweathermap.org/api/one-call-api#how
  const BASE_API_URL = "https://api.openweathermap.org/data/2.5/onecall";
  const PARAMS = {
    lat: LAT,
    lon: LON,
    appid: API_KEYS.weather,
    units: "imperial",
  };
  const API_URL = makeRequestUrl(BASE_API_URL, PARAMS);
  const TEST_URL = "/test_data/weather.json";

  const JSON_PROMISE = loadJSON(TEST_URL);
  const TEMPLATE_PROMISE = loadTemplate("/templates/weather.html");

  loadComponentToDashboard(TEMPLATE_PROMISE, JSON_PROMISE);
}
