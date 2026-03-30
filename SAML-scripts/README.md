# CyberArk Identity - SAML Script Examples

There are two distinct SAML scripting contexts in CyberArk Identity. They serve different purposes and are configured in different places.

---

## Script Types

### 1. SAML User Map Script
**Purpose:** Determines the username presented to the web application when standard mapping options are insufficient.

**Entry point:**
> Apps > [SAML App] > Account Mapping tab > "Use Account Mapping Script"

**Available objects:**
- `LoginUser.Username` — read/write; set this to define the mapped username
- `LoginUser.GroupNames` — array of group memberships
- `LoginUser.ServiceName` — directory source name
- `LoginUser.ServiceType` — directory source type: `"ADProxy"`, `"LDAPProxy"`, `"CDS"`, `"FDS"`
- `LoginUser.Get('attribute')` — retrieve a directory attribute (e.g. `'mail'`, `'uid'`)
- `Application.Get('Name')` — application name and other app properties

**File:** [`saml-user-map-example.js`](saml-user-map-example.js)

---

### 2. SAML Response Script
**Purpose:** Customizes the SAML assertion — controls the subject, attributes, signing, audience, and recipient.

**Entry point:**
> Apps > [SAML App] > SAML Response tab > Custom Logic

**Available objects:**
- `LoginUser` — authenticated user (read/write); same properties as User Map Script plus `FirstName`, `LastName`, `RoleNames`, `GroupDNs`, `GetValues()`, `GetGroupAttributeValues()`
- `Application` — target app (read-only)

**Global variables:**
- `ApplicationUrl` / `ServiceUrl` — Assertion Consumer Service URL
- `Issuer` — Entity ID
- `AssertionConsumerServiceURL` / `AssertionConsumerServiceIndex`

**Assertion-set methods:**

| Method | Purpose |
|--------|---------|
| `setSubjectName(username)` | Subject NameID |
| `setAttribute(name, value)` | Single-value assertion attribute |
| `setAttributeArray(name, array)` | Multi-value assertion attribute |
| `setIssuer(issuer)` | Issuer entity ID |
| `setAudience(audience)` | Audience restriction URL |
| `setRecipient(recipient)` | ACS URL in SubjectConfirmationData |
| `setServiceUrl(targetUrl)` | TARGET form element value |
| `setHttpDestination(url)` | HTTP POST binding destination |
| `setRelayState(state, overwrite)` | RelayState value; overwrite=true replaces SP-provided state |
| `setVersion('2')` | SAML version: `"1"` (1.1) or `"2"` (2.0, default) |
| `setSignatureType('Response')` | `"Response"` or `"Assertion"` (default: Response) |
| `setDigestMethodAlgorithm('sha256')` | sha1, sha256, sha384, sha512 |
| `setNameFormat(format)` | NameID Format value (SAML 2.0 only) |
| `setAuthenticationMethod(uri)` | Authentication type per SAML 2.0 spec §7.1 |
| `setSubjectConfirmationMethod(uri)` | SAML confirmation method URI |

**File:** [`saml-response-example.js`](saml-response-example.js)

---

## Gotchas

- Backslash characters in attribute values must be doubled: `"DOMAIN\\\\user"`
- `LoginUser.FirstName` / `LastName` are parsed from `DisplayName` for some directory services — if `DisplayName` is null the script will fail; handle null cases explicitly
- `LoginUser.Get()` queries the directory connector on each call (except `Username`, which is cached) — minimize calls
- The default template in the editor is not a working script; it must be modified before saving
- Use the **Preview SAML Response** feature to test against a specific user before deploying

## References

- [SAML User Map Script — CyberArk Docs](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlusermapscript.htm)
- [SAML Response Script — CyberArk Docs](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/samlcustscript.htm)
- [Scripting Contexts Comparison — SCRIPTING-CONTEXTS.md](../SCRIPTING-CONTEXTS.md)
