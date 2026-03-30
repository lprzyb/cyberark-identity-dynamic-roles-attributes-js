/*
BLOCK BY TIME
Allows access only during configured business hours on configured work days.
Off-premises users are always blocked. On-premises users are blocked outside office hours.

Configure the four variables below before use:
  workDays[0]     - start day (0=Sunday, 1=Monday, ..., 6=Saturday)
  workDays[1]     - end day
  officeHours[0]  - start time in 24h format HH:MM:SS (e.g. "08:00:00")
  officeHours[1]  - end time in 24h format HH:MM:SS (e.g. "18:00:00")
  officeTimeZone  - UTC offset format (e.g. "UTC+01:00", "UTC-05:00")

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

function toString(n) { return (n < 10 ? '0' : '') + n; }
function tzOffset(s) {
    var i = s.indexOf(":");
    return parseInt(s.substring(3, i)) * 60 + parseInt(s.substring(i + 1));
}

var workDays = ["<start_day>", "<end_day>"];
var officeHours = ["<start_time>", "<end_time>"];
var officeTimeZone = "<time_zone>";

if (workDays[0] == "<start_day>" || workDays[1] == "<end_day>") {
    throw "<start_day> or <end_day> is not set. Please replace with the start and end day of the working week.";
}
var dayPatt = /^[0-6]$/i;
if (!workDays[0].match(dayPatt) || !workDays[1].match(dayPatt)) {
    throw "<start_day> or <end_day> is not properly set. Use a number between 0 and 6. 0=Sunday, 6=Saturday.";
}
if (parseInt(workDays[0]) > parseInt(workDays[1])) {
    throw "<start_day> must be no later than <end_day>.";
}
if (officeHours[0] == "<start_time>" || officeHours[1] == "<end_time>") {
    throw "<start_time> or <end_time> is not set. Please replace with start and end time of office hours.";
}
var timePatt = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/i;
if (!officeHours[0].match(timePatt) || !officeHours[1].match(timePatt)) {
    throw "<start_time> or <end_time> is not properly set. Use 24h notation: 00:00:00 to 23:59:59.";
}
if (Date.parse("1970-01-01T" + officeHours[0]) > Date.parse("1970-01-01T" + officeHours[1])) {
    throw "<start_time> must be no later than <end_time>.";
}
if (officeTimeZone == "<time_zone>") {
    throw "<time_zone> is not set. Please replace with office time zone (e.g. UTC+01:00).";
}
var tzPatt = /^UTC(\+|\-)([01]?[0-9]|2[0-3]):[0-5][0-9]$/i;
if (!officeTimeZone.match(tzPatt)) {
    throw "<time_zone> is not properly set. Use format UTC-nn:nn or UTC+nn:nn.";
}

trace("ipaddress: " + context.ipAddress);
if (context.onPrem) {
    trace("onprem");
    var d = new Date();
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + tzOffset(officeTimeZone));
    var curDay = d.getDay();
    trace("current time: " + d.toLocaleString());
    trace("curDay: " + curDay);
    if (curDay < parseInt(workDays[0]) || curDay > parseInt(workDays[1])) {
        trace("block access - current day is not a working day.");
        policy.Locked = true;
        return;
    }
    var dateString = d.getFullYear() + '-' + toString(d.getMonth() + 1) + '-' + toString(d.getDate());
    var startTime = Date.parse(dateString + 'T' + officeHours[0]);
    var endTime = Date.parse(dateString + 'T' + officeHours[1]);
    var curTime = d.getTime();
    trace("startTime: " + startTime + " endTime: " + endTime + " curTime: " + curTime);
    if (curTime < startTime || curTime > endTime) {
        trace("block access - current time is not within office hours.");
        policy.Locked = true;
    }
} else {
    trace("off premises - block access.");
    policy.Locked = true;
}
