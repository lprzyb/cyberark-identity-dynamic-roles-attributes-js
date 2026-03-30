/*
LIMIT ACCESS TO SPECIFIC ROLES (SQL-BASED)
Blocks external access for users who do not hold any role whose ID matches
the pattern "k_%" (i.e. starts with "k_"). Adjust the SQL query pattern to match
your role naming convention.

Demonstrates combining SqlQuery with user role checks.

Source: https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm
*/

if (!context.onPrem) {
    trace("not onprem");
    var umod = module('User');
    var user = umod.GetCurrentUser();
    trace(user.Username);
    trace(user.DisplayName);
    trace(user.Properties.Get('mail'));

    var sqlMod = module('SqlQuery');
    var roles = sqlMod.query('select * from role where ID like "k_%"');

    var inkrole = false;
    for (var i = 0; i < roles.length; i++) {
        var krole = roles[i].ID;
        if (user.InRole(krole)) {
            inkrole = true;
            break;
        }
    }

    if (!inkrole) {
        trace("block - user does not hold a required role");
        policy.Locked = true;
    }
}
