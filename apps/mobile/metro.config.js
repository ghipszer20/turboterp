// Expo SDK 52+ configures Metro for npm workspaces automatically (watchFolders = workspace root,
// node_modules lookup in the app and the root). Nothing to add; kept so the choice is explicit.
const { getDefaultConfig } = require("expo/metro-config");
module.exports = getDefaultConfig(__dirname);
