/**
 * All functions related to the calendar component.
 */

/**
 * Loads the calendar component to the DOM.
 */
function loadCalendar() {
  const BASE_API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
  const PARAMS = {
    key: API_KEYS.google,
    max_results: 15,
    timeMin: new Date().toISOString(),
  };
  const API_URL = makeRequestUrl(BASE_API_URL, PARAMS);

  const JSON_PROMISE = loadJSON(API_URL);
  const TEMPLATE_PROMISE = loadTemplate("/templates/calendar.html");

  loadComponentToDashboard(TEMPLATE_PROMISE, JSON_PROMISE, formatJson).then(
    (_) => makeThisMonthCalendar($("#month"))
  );
}

/**
 * Formats the API Response to work with the html template.
 * @param {JSON} apiJson The API response.
 * @returns The Formated JSON. It has the following structure:
 *        - {events: [{
 *                      day: dateString,
 *                      items: [newItem,]
 *                    },]
 *           }
 */
function formatJson(apiJson) {
  let eventsObj = [];
  for (let i = 0; i < apiJson.items.length; i++) {
    let item = apiJson.items[i];
    let newItem = createItem(item);
    let date = new Date(item.start.dateTime || item.start.date.split("-"));
    updateEventsObj(eventsObj, date, newItem);
  }
  return { events: obj2Array(eventsObj) };
}

/**
 * Adds the newItem to the eventsObject.
 * @param {Object} eventsObj The object containing all the event items.
 * @param {Date} date The date of the newItem.
 * @param {Object} newItem The newItem to add.
 */
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
/**
 * Uses an item from the API response to create a newItem.
 * @param {Object} item An item object from the API response.
 * @returns A newItem.
 */
function createItem(item) {
  return {
    summary: item.summary,
    location: item.location,
    startTime: getTimeString(item.start),
  };
}

/**
 * Converts the Object's values into an array, sorted by the Object's keys.
 * @param {Object} obj The original Object.
 * @returns The Array sorted by the Obkect's keys.
 */
function obj2Array(obj) {
  return Object.keys(obj)
    .sort()
    .map((i) => obj[i]);
}

/**
 * Calculates the days between two dates.
 * @param {Date} date1 The First Date.
 * @param {Date} date2 The Second Date.
 * @returns The number of days in between (Allways positive).
 */
function daysDiff(date1, date2) {
  let diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24));
}

/**
 * Gets a string representation for the date.
 * @param {Date} date The date.
 * @returns If date is equal to today's date, it returns 'Today'. If date is
 * equal to tomorrow's date, it returns 'Tomorrow'. Else it returns
 * date.toDateString().
 */
function getDateString(date) {
  let today = new Date();
  let dateString;
  if (areDatesEqual(date, today)) {
    dateString = "Today";
  } else if (areDatesEqual(date, addDays(today, 1))) {
    dateString = "Tomorrow";
  } else {
    dateString = date.toDateString();
  }
  return dateString;
}

/**
 * Gets the timeString given a startObject from the API.
 * @param {Object} startObject A startObject from an event in the API.
 * @returns If the event is all day, it returns 'All day'. Else, it
 * returns the starting time as HH:MM AM/PM.
 */
function getTimeString(startObject) {
  console.log(startObject);
  if (!startObject.dateTime) {
    return "All day";
  }
  return new Date(startObject.dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Adds the given number of days to the date.
 * @param {Date} date Original Date.
 * @param {int} days The number of days to add (Can be negative).
 * @returns A new Date that represents date + days.
 */
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * Checks if two dates are equal. Only checks for year, month and day.
 * @param {Date} date1 Date 1 to compare.
 * @param {Date} date2 Date 2 to compare.
 * @returns True if both dates have the same year, month and day.
 * False otherwise.
 */
function areDatesEqual(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Gets the start date for the calendar.
 * @param {int} year The calendar's year.
 * @param {int} month The calendar's month.
 * @param {int} firstDay The first day of the week in the calendar.
 * Default is 0 (Sunday).
 * @returns The start date for the calendar.
 */
function getStartDate(year, month, firstDay = 0) {
  let firstMonthDay = new Date(year, month);
  let daysOff = firstMonthDay.getDay() - firstDay;
  if (daysOff < 0) {
    daysOff += 7;
  }
  return addDays(firstMonthDay, -daysOff);
}

/**
 * Makes the Header for the calendar.
 * @param {DOMElement} parentElement The DOMElement where the header should be
 * inserted.
 * @param {int} month The month for the calendar
 * @param {int} year The year for the calendar.
 */
function makeHeader(parentElement, year, month) {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let context = { id: "header", text: `${months[month]} ${year}` };
  let headerElement = $("<div>", context);
  parentElement.append(headerElement);
}

/**
 * Makes the headers for each day on the calendar.
 * @param {DOMElement} parentElement The DOMElement where the header should be
 * inserted.
 * @param {Date} startDate The starting Date of the Calendar.
 */
function makeDayHeaders(parentElement, startDate) {
  let dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];
  let i = startDate.getDay();
  let count = 0;
  while (count < 7) {
    if (i >= 7) {
      i -= 7;
    }
    let context = { class: "dayHeader", text: dayHeaders[i] };
    let dayHeaderElement = $("<div>", context);
    parentElement.append(dayHeaderElement);
    i++;
    count++;
  }
}

/**
 * Makes the days for the calendar and adds them to the DOM.
 * @param {DOMElement} parentElement The DOMElement where the header should be
 * inserted.
 * @param {Date} startDate The starting Date for the calendar.
 * @param {int} month The month for the calendar.
 * @param {int} nDays The number of days in the calendar.
 */
function makeDays(parentElement, startDate, month, nDays = 6 * 7) {
  let d = startDate;
  let today = new Date();
  for (let i = 0; i < nDays; i++) {
    let context = { text: d.getDate() };
    if (d.getMonth() != month) {
      context.class = "other";
    } else if (areDatesEqual(d, today)) {
      context.id = "today";
    }
    let dayElement = $("<div>", context);
    parentElement.append(dayElement);
    d = addDays(d, 1);
  }
}

/**
 * Makes a calendar for the given month and year and adds it to the DOM.
 * @param {*} parentElement the DOMElement where the header should be
 * inserted.
 * @param {*} year The year for the calendar.
 * @param {*} month The month for the calendar.
 * @param {*} nDays The number of days in the calendar.
 */
function makeCalendar(parentElement, year, month, nDays = 6 * 7) {
  let startDate = getStartDate(year, month);
  makeHeader(parentElement, year, month);
  makeDayHeaders(parentElement, startDate);
  makeDays(parentElement, startDate, month, nDays);
}

/**
 * Makes the calendar for this month.
 * @param {DOMElement} parentElement The DOMElement where the header should be
 * inserted.
 */
function makeThisMonthCalendar(parentElement) {
  let today = new Date();
  makeCalendar(parentElement, today.getFullYear(), today.getMonth());
}
