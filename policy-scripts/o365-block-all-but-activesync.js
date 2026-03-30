/*
OFFICE 365 - BLOCK ALL BUT ACTIVESYNC
Blocks all external Office 365 access except Exchange ActiveSync (mobile devices).
Use this when you want to permit only mobile email sync from outside the network.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("not onprem");
    trace(client.application);
    if (client.application != "Microsoft.Exchange.ActiveSync") {
        policy.Locked = true;
    }
}
