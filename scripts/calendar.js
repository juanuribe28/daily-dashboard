function loadCalendar() {
  const BASE_API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
  const PARAMS = {
    key: API_KEYS.google,
    max_results: 15,
    timeMin: (new Date).toISOString(),
  };
  const API_URL = makeRequestUrl(BASE_API_URL, PARAMS);

  const JSON_PROMISE = loadJSON(API_URL);
  const TEMPLATE_PROMISE = loadTemplate('/templates/calendar.html');

  loadComponentToDashboard(TEMPLATE_PROMISE, JSON_PROMISE, formatJson)
    .then(_ => makeThisMonthCalendar($('#month')));
}

function formatJson(apiJson) {
  let eventsObj = [];
  for (let i = 0; i < apiJson.items.length; i++) {
    let item = apiJson.items[i];
    let newItem = createItem(item);
    let date = new Date(item.start.dateTime || item.start.date);
    updateEventsObj(eventsObj, date, newItem);
  }
  return { events: obj2Array(eventsObj) };
}

function updateEventsObj(eventsObj, date, newItem) {
  let dateString = getDateString(date);
  let today = new Date();
  let dateIndex = daysDiff(today, date);
  if (eventsObj[dateIndex]) {
    eventsObj[dateIndex].items.push(newItem);
  } else {
    eventsObj[dateIndex] = new Object();
    eventsObj[dateIndex].day = dateString;
    eventsObj[dateIndex].items = [newItem];
  }
}

function createItem(item) {
  let newItem = new Object();
  newItem.summary = item.summary;
  newItem.location = item.location;
  newItem.startTime = getTimeString(item.start);
  return newItem;
}

function obj2Array(obj) {
  return Object.keys(obj).sort().map(i => obj[i]);
}

function daysDiff(date1, date2) {
  let diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24));
}

function getDateString(date) {
  let today = new Date();
  let dateString;
  if (cmpDates(date, today)) {
    dateString = 'Today';
  } else if (cmpDates(date, addDays(today, 1))) {
    dateString = 'Tomorrow';
  } else {
    dateString = date.toDateString();
  }
  return dateString;
}

function getTimeString(startObject) {
  console.log(startObject)
  if (!startObject.dateTime) {
    return 'All day';
  }
  return (new Date(startObject.dateTime)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function cmpDates(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function getStartDate(year, month, firstDay = 0) {
  let firstMonthDay = new Date(year, month);
  let daysOff = firstMonthDay.getDay() - firstDay;
  if (daysOff < 0) {
    daysOff += 7;
  }
  return addDays(firstMonthDay, -daysOff);
}

function makeHeader(parentElement, month, year) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let context = { id: 'header', text: `${months[month]} ${year}` }
  let headerElement = $('<div>', context);
  parentElement.append(headerElement);
}

function makeDayHeaders(parentElement, startDate) {
  let dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  let i = startDate.getDay();
  let count = 0;
  while (count < 7) {
    if (i >= 7) {
      i -= 7;
    }
    let context = { class: 'dayHeader', text: dayHeaders[i] };
    let dayHeaderElement = $('<div>', context);
    parentElement.append(dayHeaderElement);
    i++;
    count++;
  }
}

function makeDays(parentElement, startDate, month, nDays = 6 * 7) {
  let d = startDate;
  let today = new Date();
  for (let i = 0; i < nDays; i++) {
    let context = { text: d.getDate() }
    if (d.getMonth() != month) {
      context.class = 'other';
    } else if (cmpDates(d, today)) {
      context.id = 'today';
    }
    let dayElement = $('<div>', context);
    parentElement.append(dayElement);
    d = addDays(d, 1);
  }
}

function makeCalendar(parentElement, year, month, nDays = 6 * 7) {
  let startDate = getStartDate(year, month)
  makeHeader(parentElement, month, year);
  makeDayHeaders(parentElement, startDate);
  makeDays(parentElement, startDate, month, nDays);
}

function makeThisMonthCalendar(parentElement) {
  let today = new Date();
  makeCalendar(parentElement, today.getFullYear(), today.getMonth());
}
