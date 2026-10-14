// @ai-generated
import '@expo/metro-runtime';
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';
import {openDatabaseAsync} from 'expo-sqlite';

async function start() {
  await LoadSkiaWeb({
    locateFile: () => require('canvaskit-wasm/bin/full/canvaskit.wasm'),
  });
  // SDK 55 races OPFS creation when services first open databases in parallel.
  const database = await openDatabaseAsync(':memory:');
  await database.closeAsync();
  require('expo-router/entry');
}

start().catch(error => {
  console.error('Unable to start ISTIMA:', error);
  const root = document.getElementById('root');
  if (root) {
    root.textContent =
      'ISTIMA could not start. Close other ISTIMA tabs and reload this page.';
  }
});
