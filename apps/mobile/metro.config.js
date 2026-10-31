// Expo SDK 52+ configures Metro for npm workspaces automatically (watchFolders = workspace root,
// node_modules lookup in the app and the root). The engine page is a bundled .html asset.
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("html");
module.exports = config;
