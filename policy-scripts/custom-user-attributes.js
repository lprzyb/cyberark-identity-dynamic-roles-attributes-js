/*
CUSTOM USER ATTRIBUTES
Controls app access based on a custom user attribute.
Replace IsFull_TimeEmployee with your actual custom attribute name.

Note: GetUserData(null) retrieves the current user's data including custom attributes.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

var um = module('User');
var u = um.GetUserData(null);
var IsFull_TimeEmployee = u.IsFull_TimeEmployee;

policy.Locked = true;  // default: deny
if (IsFull_TimeEmployee) {
    trace("user is full time - allowing access");
    policy.Locked = false;
}
