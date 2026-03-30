# CyberArk Identity - Scripting Contexts: Definitions & Differences

> **Disclaimer:** This documentation is community-compiled based on testing and research. If something does not work or you encounter uncertainty, always refer to the official CyberArk documentation: https://docs.cyberark.com/identity/latest/en/content/resources/_topnav/cc_home.htm

A reference for engineers deciding which scripting context to use and why.

---

## TL;DR

| Need | Use |
|------|-----|
| Assign users to a role based on attributes | **Dynamic Role script** |
| Check user status, run SQL, apply auth policy | **Application/Policy script** |
| Customize SAML token claims | **SAML script** |

---

## Scripting Contexts Overview

### 1. Dynamic Role Scripts

**What it is:** A JavaScript predicate that runs per-user to determine role membership. Return `true` to include the user in the role, `false` to exclude.

**When it runs:** At login time, for every user evaluation. This is a performance-critical path.

**Why it is limited:** Because this script runs synchronously during the login process, CyberArk restricts it to in-memory user object attributes only. No I/O, no database queries, no module imports are allowed. The constraint exists to prevent login slowdowns.

**What you can do:**
- Access user attributes from `User` object (username, email, user type, custom attributes)
- Check AD/LDAP properties via `User.Properties.Properties['attributeName']`
- Check role/group membership via `User.InRole()`, `User.InRoleByNames()`, etc.
- Write conditional logic based on any combination of the above

**What you cannot do:**
- Call `module()` — `module('User')`, `module('SqlQuery')` are not supported
- Query the CyberArk database (no SQL)
- Check user `Status` / `StatusEnum` (stored in DB, not in the user object)
- Access `Enabled`, `Locked`, `FirstName`, `LastName`, and other attributes (these return `null`)

**Entry point:**
> Access > Roles > [Role] > Check "This is a dynamic role based on a script"

**Docs:** https://docs.cyberark.com/identity/latest/en/content/coreservices/getstarted/create-roles.htm#tabset-1-tab-2

---

### 2. Application Policy Scripts (Authentication Policy Scripts)

**What it is:** JavaScript that runs when a user launches an application or the User Portal refreshes. Used to control whether the app is accessible and which authentication profile (MFA level) applies.

**When it runs:** At application access time and on User Portal refresh, after the user is identified.

**Important:** When a policy script is present, **any authentication rules configured in the UI are ignored**. The script is the sole authority.

**Entry point:**
> Apps > [App] > Policy tab > "Use script to specify authentication rules"

**Why it is more powerful:** This context supports `module()` imports, which unlocks database access and a richer user model. It is not on the tight login path that Dynamic Roles are, so heavier operations are acceptable — though CyberArk advises avoiding lengthy/complex calculations since scripts run frequently.

#### Available Objects

**`context`** — environmental data:
```javascript
context.lastAuthenticated  // datetime of last password/IWA login; use .ToString()
context.authLevel          // integer: 1 = always allowed, 2 = default profile
context.onPrem             // boolean: true if on corporate intranet
context.ipAddress          // string: user's internet-visible IP (may be NAT/proxy)
```

**`client`** — browser/OS data:
```javascript
client.oS           // operating system
client.application  // thick client app (e.g. Outlook, Lync)
client.userAgent    // browser identity string
```

**`application`** — app attributes:
```javascript
application.Get('WebAppType')  // matches columns in the Application table (Data Dictionary)
```

**`policy`** — the result you set:
```javascript
policy.Locked = true                          // block app launch
policy.Reason = 'Access outside office hours' // custom denial message
policy.RequiredLevel = 1                      // 1 = always allowed, 2 = default profile
policy.AuthenticationProfile = 'MFA Required' // must exactly match profile name
```

#### Modules

**`module('User')`** — richer user object than Dynamic Roles:
```javascript
var umod = module('User');
var user = umod.GetCurrentUser();

user.DisplayName
user.Username
user.Mail
user.Uuid
user.UserType
user.DirectoryServiceUuid
user.IsIdentityCookiePresent

user.InRole('role name')                  // boolean role membership check
user.Properties.Get('userPrincipalName')  // retrieve directory property
user.GetRiskLevel(application)            // "Normal", "Low", "Med", "High", "Unknown", "SystemUnavailable"
```

**`module('SqlQuery')`** — query CyberArk database tables (same tables visible in Reports):
```javascript
var sqlMod = module('SqlQuery');
var result = sqlMod.query('SELECT StatusEnum FROM User WHERE Username = \'' + user.Username + '\'');
var status = result[0].StatusEnum;  // "Active", "Invited", "Suspended"
```

**`module('Utils')`** — geolocation helpers:
```javascript
var utils = module('Utils');

// Full location object
var loc = utils.getIPLocation(context.ipAddress);
// loc.city, loc.countryCode, loc.countryName, loc.latitude, loc.longitude

// Shorthand — country code only
var country = utils.getIpCountryCode(context.ipAddress);  // e.g. "US", "PL"

var km = utils.getGeoDistance(lat1, lat2, lon1, lon2);  // distance in kilometers
```

**`module('Device')`** — device enrollment status:
```javascript
var dmod = module('Device');
var device = dmod.getDevice();
device.isManaged  // boolean: true if enrolled in CyberArk Identity
```

#### Examples

**Block app if off-premises and not a sysadmin:**
```javascript
if (!context.onPrem) {
    var umod = module('User');
    var user = umod.GetCurrentUser();
    if (user.InRole('sysadmin')) {
        policy.RequiredLevel = 2;  // requires default auth profile — user still must authenticate
    } else {
        policy.Locked = true;
        policy.Reason = 'Remote access requires sysadmin role';
    }
}
```

**Require stronger MFA for invited/unactivated accounts:**
```javascript
var sqlMod = module('SqlQuery');
var umod = module('User');
var user = umod.GetCurrentUser();
var result = sqlMod.query('SELECT StatusEnum FROM User WHERE Username = \'' + user.Username + '\'');

if (result[0].StatusEnum === 'Invited') {
    policy.AuthenticationProfile = 'Email MFA Required';
}
```

**Block access from high-risk geolocations:**
```javascript
var utils = module('Utils');
var loc = utils.getIPLocation(context.ipAddress);
if (loc.countryCode !== 'US' && loc.countryCode !== 'PL') {
    policy.Locked = true;
    policy.Reason = 'Access from this region is not permitted';
}
```

**Debugging — use `trace()`:**
```javascript
trace('User status: ' + result[0].StatusEnum);  // visible in Test > Trace section
// Note: non-string values require .toString()
```

**Docs:** https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm

---

### 3. SAML Scripts

**What it is:** JavaScript that runs when CyberArk Identity issues a SAML assertion to a service provider. Configured in the **SAML Response** tab of a SAML application. Used to control what is asserted — who the subject is, what attributes are sent, and how the assertion is signed.

**When it runs:** At SAML SSO time, when a user accesses an app configured with SAML.

**Entry point:**
> Apps > [SAML App] > SAML Response > Custom Logic

**Core objects available:**

- **`LoginUser`** — the authenticated user (read/write)
- **`Application`** — the target app (read-only)

#### LoginUser Properties & Methods

```javascript
LoginUser.Username              // User identity for the SAML assertion
LoginUser.FirstName             // Parsed from DisplayName if not set directly
LoginUser.LastName
LoginUser.ServiceType           // "ADProxy", "LDAPProxy", "CDS", or "FDS"
LoginUser.ServiceName           // Named directory service identifier
LoginUser.GroupNames            // Direct group memberships (array)
LoginUser.GroupNames2           // Group name attributes only
LoginUser.RoleNames             // CyberArk Identity role memberships (array)
LoginUser.EffectiveGroupNames   // Effective (nested) group memberships
LoginUser.GroupDNs              // Group distinguished names
LoginUser.EffectiveGroupDNs

LoginUser.Get('adAttribute')          // Single AD attribute value
LoginUser.GetValues('adAttribute')    // Multi-valued AD attribute (returns array)
LoginUser.GetGroupAttributeValues('adAttribute')  // Group-specific AD values
```

#### Assertion-Set Methods

These are the functions that actually build the SAML response:

```javascript
setSubjectName(username)         // Subject NameID — who is logging in
setIssuer(issuer)                // Issuer entity ID
setAudience(audience)            // Audience restriction URL
setRecipient(recipient)          // ACS URL in SubjectConfirmationData
setServiceUrl(targetUrl)         // TARGET form element value
setHttpDestination(responseUrl)  // HTTP POST binding destination
setAttribute(name, value)        // Single-value SAML attribute
setAttributeArray(name, array)   // Multi-value SAML attribute
setVersion('2')                  // SAML version: "1" (1.1) or "2" (2.0, default)
setSignatureType('Response')     // "Response" or "Assertion" (default: Response)
setDigestMethodAlgorithm('sha256') // sha1, sha256, sha384, sha512
```

#### Examples

**Set subject based on directory type:**
```javascript
if (LoginUser.ServiceType == 'LDAPProxy') {
    setSubjectName(LoginUser.Get('uid'));
} else {
    setSubjectName(LoginUser.Username);
}
```

**Map attributes to SP-expected names:**
```javascript
setAttribute('Email', LoginUser.Get('mail'));
setAttribute('FirstName', LoginUser.FirstName);
setAttribute('LastName', LoginUser.LastName);
setAttributeArray('Groups', LoginUser.RoleNames);
```

**Conditionally add attributes:**
```javascript
if (LoginUser.ServiceType == 'ADProxy') {
    setAttribute('Department', LoginUser.Get('department'));
    setAttribute('EmployeeID', LoginUser.Get('employeeID'));
}
```

**Escape backslashes in attribute values:**
```javascript
// Backslash must be doubled in JS strings
setAttribute('Domain', 'CORP\\' + LoginUser.Username);
```

#### Gotchas

- `LoginUser.Get()` queries the directory connector on each call — `Username` is cached but other attributes are not. Minimize calls in performance-sensitive scripts.
- If `DisplayName` is null and `FirstName`/`LastName` are not set explicitly, the script will fail. Always handle null cases.
- The default template script shown in the editor is not a working custom script — it must be modified before saving.

**Docs:** https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm

---

## Key Differences at a Glance

| Capability | Dynamic Role | App Policy Script | SAML Script |
|---|---|---|---|
| Runs during | Login | App access / portal refresh | SAML SSO |
| `module()` support | No | Yes | Yes (`module('User')` confirmed) |
| SQL / DB queries | No | Yes | Possible via `module('User')` |
| User `Status` / `StatusEnum` | No (DB only) | Yes | Not confirmed |
| `User.Get()` / `LoginUser.Get()` attributes | Limited set | Extended set | Extended set |
| `User.Properties.Properties` (raw dir attrs) | Yes | No | No |
| Role/group membership checks | Yes | Yes (`user.InRole()`) | Yes (`LoginUser.RoleNames`) |
| User risk level | No | Yes (`user.GetRiskLevel()`) | No |
| IP address / geolocation | No | Yes (`context`, `module('Utils')`) | No |
| OS / browser detection | No | Yes (`client` object) | No |
| Device enrollment check | No | Yes (`module('Device')`) | No |
| Block app access | No | Yes (`policy.Locked`) | No |
| Modify auth profile | No | Yes (`policy.AuthenticationProfile`) | No |
| Customize SAML claims | No | No | Yes |
| UI auth rules still apply | — | No (script overrides all) | — |
| Performance constraint | High (login path) | Moderate (runs frequently) | Moderate |

---

## Practical Decision Guide

**Q: I need to assign users to a role based on their department or OU.**
→ Dynamic Role script. Use `User.Get('department_')` or `User.Properties.Properties['distinguishedName']`.

**Q: I need to assign users to a role only if their account is Active (not Invited/Suspended).**
→ You cannot do this with a Dynamic Role alone. Status is stored in the database. Options:
  - Use an Application Policy Script to enforce behavior at access time.
  - Use a manual or scheduled process to maintain a static role based on status.

**Q: I need stronger MFA for users in a high-risk group or with a specific status.**
→ Application Policy Script. Use `module('SqlQuery')` to check status, then set `policy.AuthenticationProfile`.

**Q: I need to pass a custom attribute (e.g., employee ID, cost center) to a third-party app via SAML.**
→ SAML Script. Map the attribute from the user object or database into the SAML assertion.

**Q: I want to filter by an AD attribute not visible in `PropertyNames`.**
→ Dynamic Role script using `User.Properties.Properties['adAttributeName']`. Use `dynamic-role-dump-attributes.js` to enumerate what raw attributes are available for a given user.

---

## Why Some Attributes Are Null in Dynamic Roles

Attributes like `Status`, `Enabled`, `Locked`, `FirstName`, and `LastName` are either:

1. **Stored in the database** — not in the in-memory user session object. Dynamic Roles cannot query the DB, so these are always `null`.
2. **Intentionally excluded** — security-sensitive fields (e.g., `Password`, `PasswordHash`) or fields that require expensive lookups are not exposed in this context.

If an attribute returns `null` and you expected a value, check the Appendix in `README.md` — it lists known attributes that are unavailable in Dynamic Roles but accessible in other scripting contexts.

---

## References

- [Dynamic Roles — CyberArk Docs](https://docs.cyberark.com/identity/latest/en/content/coreservices/getstarted/create-roles.htm#tabset-1-tab-2)
- [Application Policy Scripts / SqlQuery module](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm#SqlQuerymodule)
- [SAML Custom Scripts](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm)
- [User Data Dictionary](https://docs.cyberark.com/identity/latest/en/content/developer/data-dictionary/user.htm)
- [Dynamic Role attribute reference — README.md](README.md)
