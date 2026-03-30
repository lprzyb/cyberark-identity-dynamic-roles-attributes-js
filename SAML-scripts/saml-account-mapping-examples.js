/*
SAML ACCOUNT MAPPING SCRIPTS — REAL-WORLD EXAMPLES
Configured in: Apps > [SAML App] > Account Mapping tab > "Use Account Mapping Script"

Purpose: Sets LoginUser.Username (and optionally LoginUser.Password) to control
the identity presented to the target application.

Additional properties available in this context (beyond saml-user-map-example.js):
  LoginUser.Shortname   — short username without domain
  LoginUser.Email       — user's email address
  LoginUser.FirstName   — first name
  LoginUser.LastName    — last name
  LoginUser.Password    — writable; can be set to pass a password to the SP

Additional functions available:
  createWebRequest(url) — creates an HTTP request object
  readContent(request)  — executes the request and returns the response body as a string

Source: https://community.cyberark.com/s/article/How-to-log-into-a-SAML-application-with-a-different-username-than-the-user-s-CyberArk-username
*/


// -----------------------------------------------------------------------------
// EXAMPLE 1: Append a different login domain to shortname
// Use when the user's AD domain and application email domain differ.
// -----------------------------------------------------------------------------
LoginUser.Username = LoginUser.Shortname + "@mydomain.com";


// -----------------------------------------------------------------------------
// EXAMPLE 2: Prepend domain name to username (DOMAIN\username format)
// Result example: "CYBR\john"
// Note: backslash must be doubled in JavaScript string literals.
// -----------------------------------------------------------------------------
LoginUser.Username = "CYBR\\" + LoginUser.Shortname;


// -----------------------------------------------------------------------------
// EXAMPLE 3: Use Shortname directly (most commonly used)
// Works for both AD and CyberArk Cloud Directory users.
// Equivalent to selecting "Directory Service Field: samaccountname" for AD only,
// but this script covers both user types.
// -----------------------------------------------------------------------------
LoginUser.Username = LoginUser.Shortname;


// -----------------------------------------------------------------------------
// EXAMPLE 4: Pull credentials from CyberArk CCP via API (Alex Flores script)
// Demonstrates making an API call from within an account mapping script.
// Replace the URL with your CCP endpoint, AppID, Safe, and Object values.
// Note: evaluate security implications before using in production.
// -----------------------------------------------------------------------------
var webRequest = createWebRequest("https://your-ccp.example.com/AIMWebService/api/Accounts?AppID=CCP1&Safe=dev&Object=ccp-john");
var contents = readContent(webRequest);
trace(contents);

var j = JSON.parse(contents);
LoginUser.Password = j.Content;
LoginUser.Username = "cyberjwu";


// -----------------------------------------------------------------------------
// EXAMPLE 5: Use the local part of the user's email address as the username
// Use when the UPN contains a personal ID but the app expects firstname.lastname
// or similar format derived from the email address.
// -----------------------------------------------------------------------------
var x = LoginUser.Email.split('@')[0];
LoginUser.Username = x;


// -----------------------------------------------------------------------------
// EXAMPLE 6: Construct username as first initial + last name
// Converts "john.smith@domain.com" → "jsmith"
// -----------------------------------------------------------------------------
var firstLetter = LoginUser.FirstName.charAt(0);
LoginUser.Username = firstLetter + LoginUser.LastName;
