/*
STARTER SAMPLE
Foundation example demonstrating core policy script patterns:
- on-prem vs off-prem check
- role-based access: allow, require MFA profile, or block

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
        trace("Block non-System-Administrator");
        policy.Locked = true;
    }
}
