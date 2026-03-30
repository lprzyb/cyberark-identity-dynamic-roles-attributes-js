/*
DYNAMIC ROLE: Identify Users Missing a Specific Additional Attribute
Community article: https://cyberark-customers.force.com/s/article/CyberArk-Identity-Dynamic-Role-blank-Additional-Attribute

Returns true for users that do NOT have the specified attribute configured.

Use case: Automatically assign a policy to users that have not set an attribute
value (e.g., mobile number for SMS MFA), so they won't be prompted for MFA they
can't complete. Useful when the "Allow users without a valid authentication
factor to log in" setting is not an option.

Replace "Personal_mobile" below with your desired attribute name.
*/

trace('Looking for property: Personal_mobile');

if (User.Properties.Has('Personal_mobile')) {
    return false;
}

return true;
