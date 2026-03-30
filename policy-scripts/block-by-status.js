/*
BLOCK BY USER STATUS
Queries the CyberArk Identity tenant database for the user's Status field
and blocks app access for any status other than "Active".

Blocked statuses include: Invited, Disabled, Locked, and any non-Active state.

Note: Status is stored in the database and is NOT accessible via Dynamic Role scripts.
      This script must be used as an Application Policy Script.

Modules required: module('User'), module('SqlQuery')

Source: internally generated script — test in a non-production environment before deploying.
*/

// Activate the User module and get the current user's login name
var umod = module('User');
var user = umod.GetCurrentUser();
var identity = user.Username;

trace("Current user: " + identity);

// Activate the SqlQuery module and query user Status from the tenant DB
var dbrequest = module('SqlQuery');
var userstatus = dbrequest.query(
    "SELECT User.Status FROM User WHERE User.LoginName = '" + identity + "'"
);

trace("Query result count: " + userstatus.length);

// Extract and trace the Status value
var statusvalue;
for (var i = 0; i < userstatus.length; i++) {
    statusvalue = userstatus[i].Status;
    trace("Status of current user: " + statusvalue);
}

// Block access for any status other than Active
if (statusvalue != "Active") {
    policy.Locked = true;
}
