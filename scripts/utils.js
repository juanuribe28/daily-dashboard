function loadTemplate(url) {
  const templatePromise = fetch(url).then(promiseResponse => promiseResponse.text()).catch(error => console.log(error));
  return templatePromise;
}

function loadJSON(url) {
  const jsonPromise = fetch(url).then(promiseResponse => promiseResponse.json()).catch(error => console.log(error));
  return jsonPromise;
}

function makeRequestUrl(base_url, params) {
  const queryStr = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return `${base_url}?${queryStr}`;
}

async function loadComponentToDashboard(templatePromise, jsonPromise, jsonPreprocess = nothing) {
  const results = await Promise.all([templatePromise, jsonPromise]);
  let rendered = Mustache.render(results[0], jsonPreprocess(results[1]));
  $('#dashboard').append(rendered);
  return true;
}

function nothing(input) {
  return input;
}
