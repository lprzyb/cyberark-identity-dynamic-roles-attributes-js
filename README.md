# CyberArk Identity - User Object Reference for Dynamic Roles

Complete reference for the `User` object available in CyberArk Identity Dynamic Role scripts.

> **Choosing the right scripting context?** See [SCRIPTING-CONTEXTS.md](SCRIPTING-CONTEXTS.md) for a comparison of Dynamic Roles, Application Policy Scripts, and SAML Scripts — including when to use each and why some attributes are unavailable here.

## Example Scripts

Ready-to-use Dynamic Role scripts. Paste any of these into the Dynamic Role script editor and adjust the highlighted values for your environment.

| File | Description | Credit |
|------|-------------|--------|
| [`dynamic-role-aad-users.js`](dynamic-role-aad-users.js) | Match Azure Active Directory (AAD) users | John Qualres |
| [`dynamic-role-domain-suffix.js`](dynamic-role-domain-suffix.js) | Match users by UPN domain suffix | Chad Miller |
| [`dynamic-role-missing-attribute.js`](dynamic-role-missing-attribute.js) | Match users missing a specific attribute | — |
| [`dynamic-role-mobile-number.js`](dynamic-role-mobile-number.js) | Match users that have a mobile number set (AD + CUS) | — |
| [`dynamic-role-blank-property.js`](dynamic-role-blank-property.js) | Match users where a property is absent/null/blank | — |
| [`dynamic-role-dump-attributes.js`](dynamic-role-dump-attributes.js) | Dump all attribute names visible to Dynamic Roles | — |
| [`dynamic-role-by-ou.js`](dynamic-role-by-ou.js) | Match AD users by Organizational Unit (OU) | Kevin Creason |

## How to Use This Script

1. **Open CyberArk Identity Admin Portal**
2. **Navigate to**: Access > Roles
3. **Create New Role**: Click "Add Role" or edit existing role
4. **Enable Dynamic Role**: Check "This is a dynamic role based on a script"
5. **Paste Script**: Copy contents of `user-object-reference.js` into the script editor
6. **Test Script**:
   - Click "Test User" button
   - Select a test user from the list
   - Click "Test"
7. **Review Trace Output**: Check the trace output to see all available User properties and their values

**Note**: The script will show different properties depending on the user type (Cloud Directory vs Active Directory).

## Quick Reference

### Top-Level Properties (Direct Access)

```javascript
User.Uuid                      // User's UUID
User.Username                  // Username
User.DisplayName               // Display name
User.Mail                      // Email address
User.UserType                  // "CUS" (Cloud), "AD", "FDS", "LDAP"
User.DirectoryServiceUuid      // Directory service UUID
User.RiskLevel                 // "No Risk", "Low", "Medium", "High", "Unknown"
User.IsIdentityCookiePresent   // Boolean
User.IsYubikeyOtpConfigured    // Boolean
User.OrgId                     // Organization ID (usually null)
User.Properties                // DataEntity object
```

### Available Properties (via PropertyNames)

These are the **ONLY** properties available in Dynamic Role scripts:

```javascript
User.Get('Alias')                    // User alias
User.Get('CreateDate')               // Account creation date
User.Get('DisplayName')              // Display name
User.Get('InEverybodyRole')          // Boolean (True/False)
User.Get('LastModifiedDate')         // Last modification date
User.Get('LastPasswordChangeDate')   // Password change date
User.Get('Mail')                     // Email address
User.Get('MobileNumber')             // Mobile phone
User.Get('Name')                     // Username
User.Get('OauthClient')              // Boolean (False for regular users)
User.Get('ReportsTo')                // Manager/supervisor
User.Get('role_membership')          // Role names
User.Get('State')                    // Value: "None" (not useful)
User.Get('Version')                  // Version number
```

**Note:** Custom attributes for Cloud Directory users use underscore suffix (e.g., `country_`, `department_`).

## Access Methods

### Option 1: User.Get()
```javascript
var email = User.Get('Mail');
var dept = User.Get('department_');  // Custom attribute
```

### Option 2: User.Properties.Get()
```javascript
var email = User.Properties.Get('Mail');
var dept = User.Properties.Get('department_');
```

Both methods are equivalent.

### Option 3: User.Properties.Properties (Advanced / Raw Directory Attributes)
```javascript
var dn     = User.Properties.Properties['distinguishedName'];  // AD
var mobile = User.Properties.Properties['mobile'];             // AD
```

These raw directory attributes are **not** listed in `PropertyNames` and are not accessible via `User.Get()`. Use `dynamic-role-dump-attributes.js` to enumerate what's available for a given user.

## Helper Methods

```javascript
// Check if property exists (even if null/empty)
if (User.Properties.Has('MobileNumber')) { ... }

// Check if property has actual value
if (User.Properties.HasNonNullOrWhitespaceValue('Department')) { ... }

// Safe get (returns null if not found)
var country = User.Properties.TryGet('country_');
```

## Role/Group Functions

```javascript
User.InRole(roleId)                         // Check role by ID
User.InRoleByNames(roleNames[])             // Check multiple roles by name
User.InEffectiveGroupByNames(groupNames[])  // Check effective groups
User.InEffectiveGroupByDNs(DNs[])           // Check groups by DN
User.InDirectGroupByNames(groupNames[])     // Check direct groups
User.InDirectGroupByDNs(DNs[])              // Check direct groups by DN
```

## Practical Examples

### Check role membership
```javascript
if (User.InRole('abc12345-uuid-here')) {
    return true;
}
```

### Check custom attribute (Cloud Directory)
```javascript
if (User.UserType == 'CUS') {
    var country = User.Get('country_');
    if (country === 'Poland') {
        return true;
    }
}
```

### Check Active Directory OU
```javascript
if (User.UserType == 'AD') {
    var dn = User.Get('distinguishedname');
    if (dn && dn.indexOf('OU=Sales') > -1) {
        return true;
    }
}
```

### Check multiple conditions
```javascript
var dept = User.Get('department_');
var hasPhone = User.Properties.HasNonNullOrWhitespaceValue('MobileNumber');

if (dept === 'Engineering' && hasPhone) {
    return true;
}
```

## Important Limitations

### ❌ NOT Available in Dynamic Roles

The following attributes **always return null** in Dynamic Role scripts:

- `Status`, `StatusEnum` - User status (Active/Invited/Suspended)
- `Enabled`, `Locked` - Account state flags
- `Password`, `PasswordHash`, `PasswordIsSet` - Security sensitive
- `FirstName`, `LastName` - Name components
- `Photo`, `PictureUrl` - Profile images
- `EffectiveGroupObjects`, `RoleObjects` - Complex objects
- Most group/role attributes (use methods instead)

### ❌ NOT Available - Advanced Features

- `module()` function - Cannot use `module('User')`, `module('SqlQuery')`
- SQL database queries
- User status checking from database

### ✅ Solution for Status Checking

Use **Authentication Policies** with SQL queries instead:

```javascript
// Application Policy Script (NOT Dynamic Role)
var sqlMod = module('SqlQuery');
var result = sqlMod.query("SELECT StatusEnum FROM User WHERE Username = '" + User.Username + "'");
var userStatus = result[0].StatusEnum;

if (userStatus === "Invited") {
    policy.AuthenticationProfile = "Email MFA Required";
}
```

## User Type Differences

### Cloud Directory (`UserType: 'CUS'`)
- Custom attributes with underscore: `country_`, `department_`, `employee_id_`
- Access via: `User.Get('country_')`

### Active Directory (`UserType: 'AD'`)
- Standard AD attributes: `distinguishedname`, `samaccountname`
- Access via: `User.Get('distinguishedname')`
- Use DN for OU membership checks

---

## APPENDIX: Additional Attributes (Other Script Types)

The following attributes are **NOT available in Dynamic Role scripts** but may be available in **Application Policy Scripts**, **SAML Scripts**, or other CyberArk Identity scripting contexts:

### User Identity
- `Base64EncodedGuid`, `CanonicalName`, `CanonicalizeName`
- `Email`, `ExternalUuid`
- `FirstName`, `LastName`, `Shortname`, `Title`
- `HomeNumber`, `OfficeNumber`

### Security & Authentication
- `Password`, `PasswordHash`, `PasswordIsSet`, `PasswordSource`
- `EncryptedData`, `UseLoginPw`

### Groups & Roles
- `EffectiveGroupDNs`, `EffectiveGroupGuids`, `EffectiveGroupNames`, `EffectiveGroupObjects`
- `GroupCanonicalNames`, `GroupDNs`, `GroupGuids`, `GroupNames`, `GroupNames2`
- `RoleNames`, `RoleObjects`

### Directory & Service
- `Domain`, `Path`, `OuGuids`
- `ServiceLocalizedInstanceName`, `ServiceName`, `ServiceType`

### Profile & Media
- `Photo`, `PictureUrl`

### Organization
- `Description`, `Department`, `Company`, `Manager`, `Office`, `Location`

**Note:** This appendix is for reference only. These attributes return `null` when accessed in Dynamic Role scripts.

---

## Documentation References

- [User Data Dictionary](https://docs.cyberark.com/identity/latest/en/content/developer/data-dictionary/user.htm)
- [Dynamic Roles](https://docs.cyberark.com/identity/latest/en/content/coreservices/getstarted/create-roles.htm)
- [Policy Scripts](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm)
- [SQL Queries](https://docs.cyberark.com/identity/latest/en/content/developer/use-queries.htm)
- [Scripting Contexts Comparison — SCRIPTING-CONTEXTS.md](SCRIPTING-CONTEXTS.md)
