/*
DYNAMIC ROLE: Output All Attribute Names and Values Detected by Dynamic Roles

Dumps both basic (User.Properties) and advanced (User.Properties.Properties)
attribute names to the trace output. Useful for discovering which attributes
are available for a given user.

Run this via the "Test User" button in the Dynamic Role editor and inspect
the trace output to see what properties are populated for the test user.
*/

var userPropertiesBasic = User.Properties;
var userPropertiesAdvanced = User.Properties.Properties;
var basicArray = [];
var advancedArray = [];

// Basic Props
for (var p in userPropertiesBasic) {
    basicArray.push(p);
}
trace('basicArray.length = ' + basicArray.length);
for (var i = 0; i < basicArray.length; i++) {
    trace("BasicUserProp = " + basicArray[i]);
}

// Advanced Props
for (var p in userPropertiesAdvanced) {
    advancedArray.push(p);
}
trace('advancedArray.length = ' + advancedArray.length);
for (var i = 0; i < advancedArray.length; i++) {
    trace("AdvancedUserProp = " + advancedArray[i]);
}

return true;
