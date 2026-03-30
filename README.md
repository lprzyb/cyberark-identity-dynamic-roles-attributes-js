# CyberArk Identity — Scripting Contexts

> **Disclaimer:** This documentation is community-compiled based on testing and research.
> If something does not work or you encounter uncertainty, always refer to the official CyberArk documentation:
> https://docs.cyberark.com/identity/latest/en/content/resources/_topnav/cc_home.htm

A reference for engineers deciding which scripting context to use and why.

---

## Quick Reference

| Need | Context | Examples |
|------|---------|---------|
| Assign users to a role based on attributes | **Dynamic Role script** | [dynamic-role-scripts/](dynamic-role-scripts/README.md) |
| Control app access, apply MFA, run SQL | **Application Policy script** | [policy-scripts/](policy-scripts/README.md) |
| Customize SAML token claims | **SAML script** | [SAML-scripts/](SAML-scripts/README.md) |

---

## Scripting Contexts

### 1. Dynamic Role Scripts

**What it is:** A JavaScript predicate evaluated per-user to determine role membership.
Return `true` to include the user, `false` to exclude.

**When it runs:** Synchronously at login, before the session is established.

> **Why it is limited:** Every login triggers evaluation of all dynamic roles the user could belong to — potentially dozens — before login can complete. `module()` imports unlock operations with unpredictable latency: `SqlQuery` requires a database round-trip, `User` may require additional directory lookups, `Utils` makes external API calls. Any of these could directly delay every login.
>
> CyberArk restricts Dynamic Roles to **in-memory data only** as a deliberate performance and reliability guardrail — not a technical impossibility. This is also why `Status`, `FirstName`, and `LastName` return `null`: they require a DB lookup that is intentionally never made here.
>
> Application Policy and SAML scripts run *after* authentication, scoped to a single app access. That latency tradeoff is acceptable.

**What you can do:**
- Access user attributes via the `User` object (username, email, user type, custom attributes)
- Access raw directory attributes via `User.Properties.Properties['attributeName']`
- Check role/group membership via `User.InRole()`, `User.InRoleByNames()`, etc.

**What you cannot do:**
- Call `module()` — `module('User')`, `module('SqlQuery')` are not supported
- Query the CyberArk database
- Read `Status` / `StatusEnum` (stored in DB, not the session object)
- Access `Enabled`, `Locked`, `FirstName`, `LastName` (always `null`)

**Entry point:**
> Access > Roles > [Role] > "This is a dynamic role based on a script"

**Examples:** [dynamic-role-scripts/](dynamic-role-scripts/README.md)
**Official docs:** https://docs.cyberark.com/identity/latest/en/content/coreservices/getstarted/create-roles.htm#tabset-1-tab-2

---

### 2. Application Policy Scripts

**What it is:** JavaScript that runs when a user launches an application or the User Portal refreshes.
Controls whether the app is accessible and which authentication profile applies.

**When it runs:** At app access time and on User Portal refresh, after the user is identified.

> **Important:** When a policy script is present, all UI-configured authentication rules are ignored. The script is the sole authority.

**Why it is more powerful:** Supports `module()` imports, unlocking database access and a richer user model. Not on the tight login path — though CyberArk advises keeping scripts lean since they run frequently.

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

var loc     = utils.getIPLocation(context.ipAddress);   // full object: city, countryCode, countryName, lat, lon
var country = utils.getIpCountryCode(context.ipAddress); // shorthand: "US", "PL", etc.
var km      = utils.getGeoDistance(lat1, lat2, lon1, lon2);
```

**`module('Device')`** — device enrollment status:
```javascript
var dmod = module('Device');
var device = dmod.getDevice();
device.isManaged  // boolean: true if enrolled in CyberArk Identity
```

#### Examples

**Block off-premises access by role:**
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

**Require stronger MFA for invited accounts:**
```javascript
var umod = module('User');
var sqlMod = module('SqlQuery');
var user = umod.GetCurrentUser();
var result = sqlMod.query('SELECT StatusEnum FROM User WHERE Username = \'' + user.Username + '\'');

if (result[0].StatusEnum === 'Invited') {
    policy.AuthenticationProfile = 'Email MFA Required';
}
```

**Block from high-risk geolocations:**
```javascript
var utils = module('Utils');
var loc = utils.getIPLocation(context.ipAddress);
if (loc.countryCode !== 'US' && loc.countryCode !== 'PL') {
    policy.Locked = true;
    policy.Reason = 'Access from this region is not permitted';
}
```

**Debugging:**
```javascript
trace('User status: ' + result[0].StatusEnum);  // visible in Test > Trace section
// Note: non-string values require .toString()
```

**Entry point:**
> Apps > [App] > Policy tab > "Use script to specify authentication rules"

**Examples:** [policy-scripts/](policy-scripts/README.md)
**Official docs:** https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm

---

### 3. SAML Scripts

**What it is:** JavaScript that customizes the SAML assertion issued to a service provider.
There are two distinct script types — user map and response — configured in different places.

**When it runs:** At SAML SSO time, when a user accesses a SAML-configured application.

#### SAML User Map Script

Sets `LoginUser.Username` — the identity presented to the SP when standard mapping options are insufficient.

**Entry point:**
> Apps > [SAML App] > Account Mapping tab > "Use Account Mapping Script"

#### SAML Response Script

Builds the full assertion: subject, attributes, audience, signing, and claims.

**Entry point:**
> Apps > [SAML App] > SAML Response tab > Custom Logic

#### LoginUser Properties & Methods

```javascript
LoginUser.Username              // read/write: identity for the assertion
LoginUser.FirstName             // parsed from DisplayName if not set directly
LoginUser.LastName
LoginUser.ServiceType           // "ADProxy", "LDAPProxy", "CDS", or "FDS"
LoginUser.ServiceName           // named directory service identifier
LoginUser.GroupNames            // direct group memberships (array)
LoginUser.RoleNames             // CyberArk Identity role memberships (array)
LoginUser.EffectiveGroupNames   // effective (nested) group memberships
LoginUser.GroupDNs / LoginUser.EffectiveGroupDNs

LoginUser.Get('adAttribute')                     // single AD attribute value
LoginUser.GetValues('adAttribute')               // multi-valued AD attribute (array)
LoginUser.GetGroupAttributeValues('adAttribute') // group-specific AD values
```

#### Assertion-Set Methods

```javascript
setSubjectName(username)           // Subject NameID
setAttribute(name, value)          // single-value assertion attribute
setAttributeArray(name, array)     // multi-value assertion attribute
setIssuer(issuer)                  // issuer entity ID
setAudience(audience)              // audience restriction URL
setRecipient(recipient)            // ACS URL in SubjectConfirmationData
setServiceUrl(targetUrl)           // TARGET form element value
setHttpDestination(url)            // HTTP POST binding destination
setRelayState(state, overwrite)    // RelayState; overwrite=true replaces SP-provided value
setVersion('2')                    // "1" (SAML 1.1) or "2" (2.0, default)
setSignatureType('Response')       // "Response" or "Assertion" (default: Response)
setDigestMethodAlgorithm('sha256') // sha1, sha256, sha384, sha512
setNameFormat(format)              // NameID Format (SAML 2.0 only)
```

#### Gotchas

- `LoginUser.Get()` queries the directory connector on every call — `Username` is cached, other attributes are not. Minimize calls.
- If `DisplayName` is null and `FirstName`/`LastName` are not explicitly set, the script will fail.
- The default template in the editor is not a working script — it must be modified before saving.
- Backslash characters in values must be doubled: `"DOMAIN\\" + LoginUser.Username`

**Examples:** [SAML-scripts/](SAML-scripts/README.md)
**Official docs:** https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm

---

## Comparison Table

| Capability | Dynamic Role | App Policy Script | SAML Script |
|---|---|---|---|
| Runs during | Login | App access / portal refresh | SAML SSO |
| `module()` support | No | Yes | Yes (`module('User')` confirmed) |
| SQL / DB queries | No | Yes | Possible via `module('User')` |
| User `Status` / `StatusEnum` | No (DB only) | Yes | Not confirmed |
| `User.Get()` / `LoginUser.Get()` attributes | Limited set | Extended set | Extended set |
| `User.Properties.Properties` (raw dir attrs) | Yes | No | No |
| Role/group membership checks | Yes | Yes | Yes |
| User risk level | No | Yes (`GetRiskLevel()`) | No |
| IP address / geolocation | No | Yes (`context`, `Utils`) | No |
| OS / browser detection | No | Yes (`client`) | No |
| Device enrollment check | No | Yes (`module('Device')`) | No |
| Block app access | No | Yes (`policy.Locked`) | No |
| Modify auth profile | No | Yes (`policy.AuthenticationProfile`) | No |
| Customize SAML claims | No | No | Yes |
| UI auth rules still apply | — | No (script overrides all) | — |
| Performance constraint | High (login path) | Moderate (runs frequently) | Moderate |

---

## Decision Guide

**I need to assign users to a role based on their department or OU.**
→ Dynamic Role. Use `User.Get('department_')` or `User.Properties.Properties['distinguishedName']`.

**I need to assign users to a role only if their account is Active.**
→ Not possible with Dynamic Roles — `Status` is in the database. Use an Application Policy Script to enforce access at app launch instead, or maintain a static role via a scheduled process.

**I need stronger MFA for users with a specific status or risk level.**
→ Application Policy Script. Use `module('SqlQuery')` to check status or `user.GetRiskLevel()`, then set `policy.AuthenticationProfile`.

**I need to pass a custom attribute to a third-party app via SAML.**
→ SAML Response Script. Map the attribute into the assertion with `setAttribute()`.

**I want to filter by an AD attribute not visible in `PropertyNames`.**
→ Dynamic Role using `User.Properties.Properties['adAttributeName']`. Use `dynamic-role-dump-attributes.js` to enumerate available raw attributes for a given user.

---

## Why Some Attributes Are Null in Dynamic Roles

Attributes like `Status`, `Enabled`, `Locked`, `FirstName`, and `LastName` are either:

1. **Stored in the database** — not in the in-memory session object. Dynamic Roles never query the DB.
2. **Intentionally excluded** — security-sensitive fields (`Password`, `PasswordHash`) or fields requiring expensive lookups are not exposed here.

For the full list, see the Appendix in [dynamic-role-scripts/README.md](dynamic-role-scripts/README.md).

---

## References

### This Repository
- [Dynamic Role Scripts — dynamic-role-scripts/](dynamic-role-scripts/README.md)
- [Application Policy Scripts — policy-scripts/](policy-scripts/README.md)
- [SAML Scripts — SAML-scripts/](SAML-scripts/README.md)

### Official CyberArk Docs
- [Dynamic Roles](https://docs.cyberark.com/identity/latest/en/content/coreservices/getstarted/create-roles.htm#tabset-1-tab-2)
- [Application Policy Scripts / SqlQuery module](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm#SqlQuerymodule)
- [SAML Custom Scripts](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm)
- [SAML User Map Scripts](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlusermapscript.htm)
- [User Data Dictionary](https://docs.cyberark.com/identity/latest/en/content/developer/data-dictionary/user.htm)
