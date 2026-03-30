/*
LIMIT ACCESS BY RISK LEVEL
Blocks app access if the user's risk level is anything other than "Normal".
Risk levels: "Normal", "Low", "Med", "High", "Unknown" (insufficient data), "SystemUnavailable"

Consider handling "Unknown" and "SystemUnavailable" explicitly depending on
whether you want to fail open or fail closed when risk data is unavailable.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

var umod = module('User');
var risk_level = umod.GetRiskLevel(application);

if (risk_level != "Normal") {
    policy.Locked = true;
}
