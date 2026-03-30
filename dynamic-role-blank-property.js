/*
DYNAMIC ROLE: Check if a Property Doesn't Exist or Has No Value

Returns true for users where the specified property is absent, null, or whitespace.

Uses HasNonNullOrWhitespaceValue() which returns false when:
  - The property does not exist
  - The property value is null
  - The property value is an empty string or only whitespace

Replace "property name" below with the attribute you want to check.
*/

trace('Looking for blank property name.');

if (!User.Properties.HasNonNullOrWhitespaceValue('property name')) {
    return true;
}

return false;
