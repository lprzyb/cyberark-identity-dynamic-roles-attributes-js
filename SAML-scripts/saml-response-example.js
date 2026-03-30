/*
SAML RESPONSE SCRIPT - EXAMPLES
Configured in: Apps > [SAML App] > SAML Response tab > Custom Logic

Purpose: Builds the SAML assertion — defines subject, attributes, audience,
signing behaviour, and any custom claim attributes sent to the SP.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm
*/


// -----------------------------------------------------------------------------
// EXAMPLE 1: Minimal — set subject and a single email attribute
// -----------------------------------------------------------------------------
setSubjectName(LoginUser.Username);
setAttribute("Email", LoginUser.Get("mail"));


// -----------------------------------------------------------------------------
// EXAMPLE 2: Full attribute mapping
// Common pattern for SPs that require standard profile attributes.
// -----------------------------------------------------------------------------
setSubjectName(LoginUser.Username);
setAttribute("Email",     LoginUser.Get("mail"));
setAttribute("FirstName", LoginUser.FirstName);
setAttribute("LastName",  LoginUser.LastName);
setAttributeArray("Groups", LoginUser.RoleNames);


// -----------------------------------------------------------------------------
// EXAMPLE 3: Directory-conditional subject name
// Use when AD and LDAP users have different identifier attributes.
// -----------------------------------------------------------------------------
if (LoginUser.ServiceType == 'LDAPProxy') {
    setSubjectName(LoginUser.Get('uid'));
} else {
    setSubjectName(LoginUser.Username);
}
setAttribute("Email", LoginUser.Get("mail"));


// -----------------------------------------------------------------------------
// EXAMPLE 4: Multi-valued attribute — proxy addresses
// Use GetValues() for AD attributes that can have multiple values.
// -----------------------------------------------------------------------------
setSubjectName(LoginUser.Username);
setAttributeArray('proxies', LoginUser.GetValues('proxyAddresses'));
setAttributeArray('Groups',  LoginUser.GroupNames);


// -----------------------------------------------------------------------------
// EXAMPLE 5: SAML version, signing, and audience
// Use when the SP requires specific SAML 2.0 configuration.
// -----------------------------------------------------------------------------
setVersion('2');
setSignatureType('Assertion');           // sign the assertion, not the response
setDigestMethodAlgorithm('sha256');
setIssuer('https://cyberark.example.com/issuer');
setAudience('https://sp.example.com/saml/metadata');
setRecipient('https://sp.example.com/saml/acs');
setSubjectName(LoginUser.Username);
setAttribute("Email", LoginUser.Get("mail"));


// -----------------------------------------------------------------------------
// EXAMPLE 6: RelayState — redirect user to a specific page after SSO
// overwrite=true replaces any RelayState the SP may have sent.
// -----------------------------------------------------------------------------
setSubjectName(LoginUser.Username);
setRelayState("/dashboard", true);


// -----------------------------------------------------------------------------
// EXAMPLE 7: Custom user attribute from CyberArk cloud directory
// module('User') is available in SAML response scripts.
// Replace IsFull_TimeEmployee with your actual custom attribute name.
// -----------------------------------------------------------------------------
var um = module("User");
var u = um.GetUserData(null);
setSubjectName(LoginUser.Username);
setAttribute("FullTimeEmployee", u.IsFull_TimeEmployee);
setAttribute("Department",       LoginUser.Get("department"));


// -----------------------------------------------------------------------------
// EXAMPLE 8: Domain-prefixed attribute value (escape backslash)
// Backslash must be doubled in JavaScript string literals.
// -----------------------------------------------------------------------------
setSubjectName(LoginUser.Username);
setAttribute("WindowsAccount", "DOMAIN\\" + LoginUser.Username);
