/*
DYNAMIC ROLE: Identify Users with a Specific Domain Suffix
Credit: Chad Miller

Returns true for users whose username has the specified domain suffix.
Update the domain string below to match your target tenant/domain.
*/

trace(User.Username);

var un = User.Username.toString();
un = un.split('@');
trace(un[1]);

if (un[1] == "idaptivedemo002.onmicrosoft.com") {
    return true;
} else {
    return false;
}
