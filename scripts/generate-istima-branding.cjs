// @ai-generated
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const mark = fs.readFileSync(
  path.join(root, 'assets/branding/istima-mark.svg'),
);
const targets = [];
function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (
      /\.(png|webp)$/i.test(file) &&
      /(?:ic_launcher|splashscreen_logo|SplashScreenLogo|AppIcon\.appiconset|graphics\/icon)/.test(
        file,
      )
    )
      targets.push(file);
  }
}
walk(path.join(root, 'android/app/src/main/res'));
walk(path.join(root, 'android/app/src/main/play'));
walk(path.join(root, 'ios/Bayaan/Images.xcassets'));
for (const name of [
  'icon',
  'adaptive-icon',
  'ios-dark',
  'ios-light',
  'ios-tinted',
  'splash-icon',
  'splash-icon-dark',
  'android-splash-icon',
  'android-splash-icon-dark',
  'notification_icon',
]) {
  const file = path.join(root, 'assets/images', name + '.png');
  if (fs.existsSync(file)) targets.push(file);
}

(async () => {
  const publisher = await sharp(path.join(root, 'assets/branding/halalweb.png'))
    .resize({width: 400})
    .toBuffer();
  const wordmark = await sharp(mark)
    .composite([{input: publisher, left: 312, top: 665}])
    .png()
    .toBuffer();
  for (const file of targets) {
    const {width, height} = await sharp(file).metadata();
    const monochrome = /notification_icon|tinted/.test(file);
    const transparent =
      /foreground|splash|SplashScreen/i.test(file) || monochrome;
    let image = sharp(wordmark).resize(width, height, {
      fit: 'contain',
      background: '#00000000',
    });
    if (monochrome) {
      image = image.greyscale().linear(0, 255);
    }
    if (!transparent) image = image.flatten({background: '#0c302b'});
    const output = await image
      .toFormat(file.endsWith('.webp') ? 'webp' : 'png')
      .toBuffer();
    fs.writeFileSync(file, output);
  }
  console.log(`Generated ${targets.length} ISTIMA brand assets.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
