/**
 * Loads a text template from the url.
 * @param {String} url The URL of the template.
 * @returns The Promise of the Template.
 */
function loadTemplate(url) {
  const templatePromise = fetch(url)
    .then((promiseResponse) => promiseResponse.text())
    .catch((error) => console.log(error));
  return templatePromise;
}

/**
 * Loads JSON from the url.
 * @param {String} url The URL of the JSON.
 * @returns The Promise of the JSON.
 */
function loadJSON(url) {
  const jsonPromise = fetch(url)
    .then((promiseResponse) => promiseResponse.json())
    .catch((error) => console.log(error));
  return jsonPromise;
}

/**
 * Makes a request URL from the base and the params.
 * @param {String} baseUrl The url befor ethe query params.
 * @param {Object} params An object with the query params.
 * Doesn't support arrays or objects as values.
 * @returns The full request URL.
 */
function makeRequestUrl(baseUrl, params) {
  const queryStr = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
  return `${baseUrl}?${queryStr}`;
}

/**
 * Loads a component to the DOM of the Dashboard.
 * @param {Promise} templatePromise The promise of the html text template.
 * @param {Promise} jsonPromise The promise of the JSON that is going to be
 * rendered using Mustache.
 * @param {Function} jsonPreprocess A function to preprocess the JSON data.
 */
async function loadComponentToDashboard(
  templatePromise,
  jsonPromise,
  jsonPreprocess = nothing
) {
  const results = await Promise.all([templatePromise, jsonPromise]);
  let rendered = Mustache.render(results[0], jsonPreprocess(results[1]));
  $("#dashboard").append(rendered);
}

/**
 * Does nothing.
 * @param {*} input Anything
 * @returns Returns the input.
 */
function nothing(input) {
  return input;
}
