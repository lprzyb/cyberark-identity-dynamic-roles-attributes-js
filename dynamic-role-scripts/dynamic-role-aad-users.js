/*
DYNAMIC ROLE: Identify Azure Active Directory (AAD) Users
Credit: John Qualres
Community article: https://cyberark-customers.force.com/s/article/CyberArk-Identity-Dynamic-Role-for-all-Azure-AD-users

Returns true for users whose UserType is 'AAD' (Azure Active Directory).
*/

trace(User.UserType);

if (User.UserType == 'AAD') {
    // User is an Azure Active Directory user
    return true;
}

return false;
