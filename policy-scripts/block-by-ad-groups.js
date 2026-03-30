/*
BLOCK BY AD GROUPS
Blocks external access for users in specified Active Directory groups.
Replace <group_name_1>, <group_name_2> with actual AD group names.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("not onprem");
    var umod = module('User');
    var user = umod.GetCurrentUser();
    var blocked_groups = ["<group_name_1>", "<group_name_2>"];
    if (blocked_groups != null) {
        if (user.InEffectiveGroupByNames(blocked_groups)) {
            trace("block specified AD groups");
            policy.Locked = true;
        }
    }
}
