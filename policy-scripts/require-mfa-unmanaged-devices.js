/*
REQUIRE MFA FOR UNMANAGED DEVICES
Requires the default authentication profile for any device not enrolled
in CyberArk Identity. Managed (enrolled) devices are allowed through with
their existing auth level.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

var dmod = module('Device');
var device = dmod.getDevice();
if (!device.isManaged) {
    policy.RequiredLevel = 2;  // requires default auth profile
}
