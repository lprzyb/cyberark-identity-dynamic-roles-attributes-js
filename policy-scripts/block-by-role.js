/*
BLOCK BY ROLE
Blocks external access for users belonging to specified CyberArk Identity roles.
Replace <role_name_1>, <role_name_2> with actual role names.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("not onprem");
    var umod = module('User');
    var user = umod.GetCurrentUser();
    var blocked_roles = ["<role_name_1>", "<role_name_2>"];
    if (user.InRoleByNames(blocked_roles)) {
        trace("block specified role");
        policy.Locked = true;
    }
}
