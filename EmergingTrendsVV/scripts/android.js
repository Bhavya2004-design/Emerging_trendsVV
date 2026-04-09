const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const isWin = os.platform() === 'win32';
const gradle = isWin ? 'gradlew.bat' : './gradlew';
const projectRoot = path.join(__dirname, '..');
let buildRoot = projectRoot;

function runRobocopy(source, target, extraArgs = '') {
  execSync(
    `robocopy "${source}" "${target}" ${extraArgs} & if %ERRORLEVEL% LEQ 7 exit /B 0`,
    {
      stdio: 'inherit',
      shell: true,
    },
  );
}

if (isWin) {
  const shortRoot = 'C:\\rn\\EmergingTrendsVV';
  if (projectRoot.toLowerCase() !== shortRoot.toLowerCase()) {
    console.log(`Preparing short-path mirror at ${shortRoot}...`);
    fs.mkdirSync('C:\\rn', { recursive: true });
    runRobocopy(projectRoot, shortRoot, '/MIR /XD node_modules android\\build android\\.gradle ios\\build .git');

    const shortNodeModules = path.join(shortRoot, 'node_modules');
    console.log('Syncing node_modules to short-path mirror...');
    fs.mkdirSync(shortNodeModules, { recursive: true });
    runRobocopy(path.join(projectRoot, 'node_modules'), shortNodeModules, '/MIR /XD .cache');

    buildRoot = shortRoot;
  }
}

const androidDir = path.join(buildRoot, 'android');

console.log('Building and installing the app...');

// Use process.chdir so the path-with-spaces is handled at OS level,
// not through shell string interpolation (which breaks on Windows).
process.chdir(androidDir);

try {
  execSync(`${gradle} app:installDebug -PreactNativeDevServerPort=8081`, {
    stdio: 'inherit',
    shell: true,
  });
} catch (e) {
  process.exit(1);
}

console.log('Launching the app...');

try {
  const adbExe = isWin ? 'adb.exe' : 'adb';
  const adbPath = process.env.ANDROID_HOME
    ? path.join(process.env.ANDROID_HOME, 'platform-tools', adbExe)
    : 'adb';
  execSync(`"${adbPath}" shell am start -n com.emergingtrendsvv/.MainActivity`, {
    stdio: 'inherit',
  });
} catch (e) {
  console.log('App installed. Please launch it manually from the emulator.');
}
