/*
OFFICE 365 - BLOCK ALL BUT WEB
Blocks all external Office 365 access except the web browser.
client.application is populated for thick clients; if it's set, it's not a browser.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("not onprem");
    if (client.application) {
        policy.Locked = true;
    }
}
