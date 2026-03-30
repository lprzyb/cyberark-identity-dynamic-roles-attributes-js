# CyberArk Identity - Application Policy Script Examples

> **Disclaimer:** This documentation is community-compiled based on testing and research. If something does not work or you encounter uncertainty, always refer to the official CyberArk documentation: https://docs.cyberark.com/identity/latest/en/content/resources/_topnav/cc_home.htm

Ready-to-use policy scripts sourced from official CyberArk documentation. Paste any script into the Policy tab of an application and adjust the placeholder values for your environment.

## How to Use

1. **Open CyberArk Identity Admin Portal**
2. **Navigate to**: Apps & Widgets > [Application] > Policy tab
3. **Select**: "Use script to specify authentication rules"
4. **Paste** the script content and replace any `<placeholder>` values
5. **Test**: Click "Test" to run against your current login context — trace output appears in the Trace section
6. **Save**

> **Important:** When a policy script is active, all UI-configured authentication rules are ignored. The script is the sole authority.

## Script Index

| File | Description |
|------|-------------|
| [`starter-sample.js`](starter-sample.js) | Foundation example: on-prem check, role-based auth profile assignment |
| [`block-by-ad-groups.js`](block-by-ad-groups.js) | Block external access for users in specified AD groups |
| [`block-by-country.js`](block-by-country.js) | Block external access from outside a specified country |
| [`block-by-role.js`](block-by-role.js) | Block external access for users in specified roles |
| [`block-by-time.js`](block-by-time.js) | Block access outside configured business hours and time zone |
| [`o365-block-all-but-activesync.js`](o365-block-all-but-activesync.js) | Office 365: allow only Exchange ActiveSync externally |
| [`o365-block-all-but-web.js`](o365-block-all-but-web.js) | Office 365: allow only web browser access externally |
| [`o365-block-external-rich-clients.js`](o365-block-external-rich-clients.js) | Office 365: block Outlook, MAPI, ActiveSync, WebServices externally |
| [`require-mfa-unmanaged-devices.js`](require-mfa-unmanaged-devices.js) | Require default auth profile for devices not enrolled in CyberArk Identity |
| [`custom-user-attributes.js`](custom-user-attributes.js) | Control access based on a custom user attribute |
| [`limit-access-specific-roles.js`](limit-access-specific-roles.js) | Allow access only to users holding roles matching a DB query pattern |
| [`auth-profile-by-role.js`](auth-profile-by-role.js) | Apply different auth profiles per role; block everyone else |
| [`limit-by-risk-level.js`](limit-by-risk-level.js) | Block access if user risk level is not Normal |

## Key Concepts

- **`context.onPrem`** — `true` if the user is on the corporate intranet. Most scripts wrap logic in `if(!context.onPrem)` to apply stricter rules only externally.
- **`policy.Locked = true`** — blocks the app launch. Set `policy.Reason` for a custom message.
- **`policy.RequiredLevel = 2`** — requires the default authentication profile (does not bypass MFA).
- **`policy.AuthenticationProfile`** — applies a named auth profile; value must exactly match the profile name in the portal.
- **`trace()`** — logs a string visible in the Test > Trace panel. Non-string values need `.toString()`.

## References

- [Sample Policy Scripts — CyberArk Docs](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/usesamplepolscript.htm)
- [Policy Script Reference](https://docs.cyberark.com/identity/latest/en/content/applications/appsscriptref/jsdatapolicyscript.htm)
- [Scripting Contexts Comparison — SCRIPTING-CONTEXTS.md](../SCRIPTING-CONTEXTS.md)
