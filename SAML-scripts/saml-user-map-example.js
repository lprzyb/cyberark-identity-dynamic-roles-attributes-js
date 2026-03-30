/*
SAML USER MAP SCRIPT - EXAMPLES
Configured in: Apps > [SAML App] > Account Mapping tab > "Use Account Mapping Script"

Purpose: Sets LoginUser.Username — the identity presented to the target application.
This runs before the SAML response is built. The value you assign to LoginUser.Username
is what the SP receives as the subject.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlusermapscript.htm
*/


// -----------------------------------------------------------------------------
// EXAMPLE 1: Append application name to username
// Result: "barney.blanton#Busfare"
// Use when the SP requires a compound identifier.
// -----------------------------------------------------------------------------
LoginUser.Username = LoginUser.Username + "#" + Application.Get("Name");


// -----------------------------------------------------------------------------
// EXAMPLE 2: Map username differently per directory source
// Use when AD users and LDAP users have different identifier conventions.
// -----------------------------------------------------------------------------
if (LoginUser.ServiceType == 'LDAPProxy') {
    LoginUser.Username = LoginUser.Get('uid');
} else {
    // AD, CDS, FDS — use the standard username
    LoginUser.Username = LoginUser.Username;
}


// -----------------------------------------------------------------------------
// EXAMPLE 3: Use email address as the mapped username
// Common when the SP expects an email-format NameID.
// -----------------------------------------------------------------------------
LoginUser.Username = LoginUser.Get('mail');


// -----------------------------------------------------------------------------
// EXAMPLE 4: Restrict access to a specific group, map to email for members
// Groups outside the allowed list get the default username.
// -----------------------------------------------------------------------------
var allowedGroups = ['SP-Access-Group'];
var inAllowed = false;
for (var i = 0; i < LoginUser.GroupNames.length; i++) {
    if (LoginUser.GroupNames[i] == allowedGroups[0]) {
        inAllowed = true;
        break;
    }
}
if (inAllowed) {
    LoginUser.Username = LoginUser.Get('mail');
}
// if not in group, LoginUser.Username stays as-is (default mapping)
