/*
OFFICE 365 - BLOCK EXTERNAL RICH CLIENTS
Blocks external access from Outlook, MAPI, Exchange Web Services, and Autodiscover.
Web browser and ActiveSync are still permitted externally.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

var clientList = [
    "OUTLOOK",
    "Microsoft.Exchange.Autodiscover",
    "Microsoft.Exchange.WebServices",
    "Microsoft.Exchange.MAPI"
];

trace("client IP: " + context.ipAddress);
trace("client application: " + client.application);

if (!context.onPrem) {
    trace("not onprem");
    var appString = String(client.application).toLowerCase();
    for (var i = 0; i < clientList.length; i++) {
        var clientName = String(clientList[i]).toLowerCase();
        if (appString.indexOf(clientName) == 0) {
            trace("matched blocking client name: " + clientName);
            trace("block access - rich client not allowed off-prem");
            policy.Locked = true;
        }
    }
} else {
    trace("onprem");
}
