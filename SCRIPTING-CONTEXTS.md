# CyberArk Identity - Scripting Contexts: Definitions & Differences

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

**What it is:** JavaScript that runs when a user authenticates to a specific application. Used to control which authentication profile (MFA level, methods) is applied.

**When it runs:** At application access time, after the user is identified but before authentication is fully resolved.

**Why it is more powerful:** This context supports `module()` imports, which unlocks database access and a richer user model. It is not on the critical login path in the same tight way, so heavier operations are acceptable.

**What you can do (beyond Dynamic Roles):**
- Import modules: `module('User')`, `module('SqlQuery')`
- Query the database directly with SQL
- Read `Status` / `StatusEnum` from the database
- Apply or change authentication profiles at runtime
- Access a broader set of user attributes

**Example — check user status via SQL:**
```javascript
var sqlMod = module('SqlQuery');
var result = sqlMod.query(
    "SELECT StatusEnum FROM User WHERE Username = '" + User.Username + "'"
);
var userStatus = result[0].StatusEnum;

if (userStatus === 'Invited') {
    policy.AuthenticationProfile = 'Email MFA Required';
}
```

**Docs:** https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm#SqlQuerymodule

---

### 3. SAML Scripts

**What it is:** JavaScript that runs when CyberArk Identity issues a SAML assertion to a service provider. Used to customize the claims/attributes sent in the SAML token.

**When it runs:** At SAML SSO time, when a user accesses an app configured with SAML.

**Capabilities:** Similar to Application Policy Scripts — supports `module()` imports and database queries. Designed specifically for claim mapping and token enrichment.

**What you can do:**
- Add, modify, or remove SAML attributes/claims
- Pull data from the database to enrich the assertion
- Map CyberArk attributes to SP-expected attribute names
- Conditionally include attributes based on user type or group

---

## Key Differences at a Glance

| Capability | Dynamic Role | App Policy Script | SAML Script |
|---|---|---|---|
| Runs during | Login | App access | SAML SSO |
| `module()` support | No | Yes | Yes |
| SQL / DB queries | No | Yes | Yes |
| User `Status` field | No (DB only) | Yes | Yes |
| `User.Get()` attributes | Limited set | Extended set | Extended set |
| `User.Properties.Properties` (raw dir attrs) | Yes | Yes | Yes |
| Role/group membership checks | Yes | Yes | Yes |
| Modify auth profile | No | Yes | No |
| Customize SAML claims | No | No | Yes |
| Performance constraint | High (login path) | Moderate | Moderate |

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
- [User Data Dictionary](https://docs.cyberark.com/identity/latest/en/content/developer/data-dictionary/user.htm)
- [Dynamic Role attribute reference — README.md](README.md)
