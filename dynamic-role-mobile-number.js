/*
DYNAMIC ROLE: Identify Users with a Mobile Number Populated

Returns true for users that have a mobile number set.
Handles both Active Directory (AD) users and Cloud Directory (CUS) users.

AD users: checks the 'mobile' attribute via User.Properties.Properties
CUS users: checks the 'MobileNumber' attribute via User.Properties.Properties
*/

trace(User.UserType);

if (User.UserType == 'AD') {
    // User is an Active Directory user
    try {
        trace('AD user with mobile number');
        if (User.Properties.Properties.mobile == "") {
            return false;
        }
    } catch (error) {
        trace('AD missing mobile number');
    }
} else if (User.UserType == 'CUS') {
    // User is a Cloud Directory user
    try {
        trace('CUS with mobile number');
        if (User.Properties.Properties['MobileNumber'] == "") {
            return false;
        }
    } catch (error) {
        trace('CUS missing mobile number');
    }
}

return true;
