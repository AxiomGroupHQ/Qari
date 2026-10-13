const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

// @ai-start
// SQLite's browser worker imports WASM; native databases remain bundled assets.
config.resolver.assetExts = [
  ...new Set([...(config.resolver.assetExts ?? []), 'db', 'wasm']),
];
// @ai-end

// @ai-start
// Preserve UTF-8 Quran text rather than expanding each character to an escape.
// This keeps browser chunks within the static asset upload size limit.
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  output: {...config.transformer.minifierConfig?.output, ascii_only: false},
};
// @ai-end

module.exports = config;
