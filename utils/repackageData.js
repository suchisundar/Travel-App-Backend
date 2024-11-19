"use strict";

/** Helper to repackage data from external API */
function repackageData(data) {
  const daysData = data.days.map((day) => ({
    datetime: day.datetime,
    tempmin: day.tempmin,
    tempmax: day.tempmax,
    precipprob: day.precipprob,
    conditions: day.conditions,
    description: day.description,
    icon: day.icon,
  }));

  const resolvedAddress = data.resolvedAddress || "Unknown location";
  const description = data.description || "No description available";

  const alerts = data.alerts || [];
  let alert;

  if (Array.isArray(alerts) && alerts.length > 0) {
    alert = { event: alerts[0].event, link: alerts[0].link };
  } else {
    alert = { event: "No current alerts" };
  }

  return {
    resolvedAddress,
    description,
    alert,
    days: daysData,
  };
}


module.exports = repackageData;
