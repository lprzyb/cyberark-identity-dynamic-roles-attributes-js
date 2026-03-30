/*
APPLY AUTH PROFILE BASED ON ROLE
Applies different authentication profiles per role when accessing externally.
System Administrators get the default profile; a named role gets a specific MFA profile;
all others are blocked.

Adjust role names and auth profile name to match your environment.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("Not onprem");
    var umod = module('User');
    var user = umod.GetCurrentUser();

    if (user.InRole("System Administrator")) {
        trace("Allow System Administrator");
        policy.RequiredLevel = 2;  // requires default auth profile
    } else if (user.InRole("Example Role")) {
        trace("Challenge with '2nd Challenge MFA Example' Profile");
        policy.AuthenticationProfile = "2nd Challenge MFA Example";
    } else {
        trace("Block - user does not match any permitted role");
        policy.Locked = true;
    }
}
