/*
DYNAMIC ROLE: Dynamic Role by Organizational Unit (OU)
Credit: Kevin Creason
Community article: https://cyberark-customers.force.com/s/article/CyberArk-Identity-Dynamic-Roles-by-OU

Returns true for Active Directory users whose distinguishedName contains
the specified OU. Uses a case-insensitive regex search.

Update the OU name in the regex (e.g., /OU=EARTH/i) to match your target OU.
*/

var DN = User.Properties.Properties['distinguishedName'];
trace('User: ' + DN);

var result = DN.search(/OU=EARTH/i);
trace('Results are in: ' + result);

if (result > 0) {
    return true;
} else {
    return false;
}
