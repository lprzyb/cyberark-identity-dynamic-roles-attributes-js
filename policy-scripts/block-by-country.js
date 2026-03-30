/*
BLOCK BY COUNTRY
Blocks external access from IP addresses outside a specified country.
Replace "US" with the desired ISO 3166-1 alpha-2 country code (e.g. "PL", "DE", "GB").

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    var util = module('Utils');
    var country = util.getIpCountryCode(context.ipAddress);
    if (country != "US") {
        policy.Locked = true;
    }
}
