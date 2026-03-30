/*
CYBERARK IDENTITY - USER OBJECT COMPLETE REFERENCE
Documentation Script for Dynamic Roles
Outputs ALL available attributes, properties, and methods
*/

trace("================================================================================");
trace("CYBERARK IDENTITY - DYNAMIC ROLE USER OBJECT REFERENCE");
trace("Generated: " + new Date());
trace("Test User: " + User.Username + " (UserType: " + User.UserType + ")");
trace("================================================================================");

// ========================================
// SECTION 1: TOP-LEVEL USER PROPERTIES
// ========================================
trace("");
trace("=== SECTION 1: TOP-LEVEL USER PROPERTIES (Direct Access) ===");
trace("Access Pattern: User.PropertyName");
trace("");

var topLevelProps = [
    "Uuid",
    "Username", 
    "DisplayName",
    "Mail",
    "UserType",
    "DirectoryServiceUuid",
    "RiskLevel",
    "IsIdentityCookiePresent",
    "IsYubikeyOtpConfigured",
    "OrgId",
    "Properties"
];

for (var i = 0; i < topLevelProps.length; i++) {
    var propName = topLevelProps[i];
    try {
        var propValue = User[propName];
        if (propValue === null) {
            trace(propName + ": null");
        } else if (typeof propValue === "object") {
            trace(propName + ": [object]");
        } else {
            trace(propName + ": " + propValue);
        }
    } catch(e) {
        trace(propName + ": [ERROR]");
    }
}

// ========================================
// SECTION 2: AVAILABLE PROPERTIES
// ========================================
trace("");
trace("=== SECTION 2: AVAILABLE PROPERTIES (PropertyNames Collection) ===");
trace("Access: User.Properties.Get('PropertyName') OR User.Get('PropertyName')");
trace("");

try {
    var propNames = User.Properties.PropertyNames;
    trace("Total Properties: " + propNames.Count);
    trace("");
    
    var propNamesArray = [];
    for (var pn in propNames) {
        propNamesArray.push(pn);
    }
    propNamesArray.sort();
    
    for (var j = 0; j < propNamesArray.length; j++) {
        var attrName = propNamesArray[j];
        try {
            var attrValue = User.Properties.Get(attrName);
            if (attrValue === null || attrValue === undefined) {
                trace(attrName + ": null");
            } else if (attrValue === "") {
                trace(attrName + ": [empty]");
            } else {
                trace(attrName + ": " + attrValue);
            }
        } catch(e) {
            trace(attrName + ": [ERROR]");
        }
    }
} catch(e) {
    trace("ERROR: " + e);
}

// ========================================
// SECTION 3: ADVANCED PROPERTIES (Raw Directory Attributes)
// ========================================
trace("");
trace("=== SECTION 3: ADVANCED PROPERTIES (User.Properties.Properties) ===");
trace("Access Pattern: User.Properties.Properties['attributeName']");
trace("Note: These are raw directory attributes NOT listed in PropertyNames.");
trace("      Includes AD attributes like distinguishedName, sAMAccountName, mobile.");
trace("");
trace("Available advanced property names (see dynamic-role-dump-attributes.js to enumerate values).");
trace("Example access:");
trace("  var dn = User.Properties.Properties['distinguishedName'];");
trace("  var mobile = User.Properties.Properties['mobile'];  // AD users");

// ========================================
// SECTION 4: HELPER METHODS
// ========================================
trace("");
trace("=== SECTION 4: HELPER METHODS ===");
trace("");

// Test Has()
trace("Testing User.Properties.Has() with 'Mail':");
try {
    var hasMail = User.Properties.Has('Mail');
    trace("  Has('Mail'): " + hasMail);
} catch(e) {
    trace("  Has('Mail'): ERROR");
}

// Test HasNonNullOrWhitespaceValue()
trace("Testing User.Properties.HasNonNullOrWhitespaceValue() with 'Mail':");
try {
    var hasValue = User.Properties.HasNonNullOrWhitespaceValue('Mail');
    trace("  HasNonNullOrWhitespaceValue('Mail'): " + hasValue);
} catch(e) {
    trace("  HasNonNullOrWhitespaceValue('Mail'): ERROR");
}

// Test TryGet()
trace("Testing User.Properties.TryGet() with 'Mail':");
try {
    var tryGetResult = User.Properties.TryGet('Mail');
    trace("  TryGet('Mail'): " + tryGetResult);
} catch(e) {
    trace("  TryGet('Mail'): ERROR");
}

// ========================================
// SECTION 5: ROLE/GROUP METHODS
// ========================================
trace("");
trace("=== SECTION 5: ROLE/GROUP METHODS ===");
trace("");
trace("Available methods:");
trace("  User.InRole(roleId)");
trace("  User.InRoleByNames(roleNames[])");
trace("  User.InEffectiveGroupByNames(groupNames[])");
trace("  User.InEffectiveGroupByDNs(DNs[])");
trace("  User.InDirectGroupByNames(groupNames[])");
trace("  User.InDirectGroupByDNs(DNs[])");

trace("");
trace("================================================================================");
trace("COMPLETE - See README.md for usage examples and limitations");
trace("================================================================================");

return true;
