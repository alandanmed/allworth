const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fixes Firebase Auth's getReactNativePersistence not resolving correctly —
// Metro's newer package-exports resolution breaks Firebase's .cjs conditional exports.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
