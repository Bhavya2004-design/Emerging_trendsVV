const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const isWin = os.platform() === 'win32';
const projectRoot = path.join(__dirname, '..');
let runRoot = projectRoot;

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
    console.log(`Preparing short-path mirror at ${shortRoot} for Metro...`);
    fs.mkdirSync('C:\\rn', { recursive: true });
    runRobocopy(projectRoot, shortRoot, '/MIR /XD node_modules android\\build android\\.gradle ios\\build .git');

    const shortNodeModules = path.join(shortRoot, 'node_modules');
    console.log('Syncing node_modules to short-path mirror...');
    fs.mkdirSync(shortNodeModules, { recursive: true });
    runRobocopy(path.join(projectRoot, 'node_modules'), shortNodeModules, '/MIR /XD .cache');

    runRoot = shortRoot;
  }
}

process.chdir(runRoot);

const npxBin = isWin ? 'npx.cmd' : 'npx';
const extraArgs = process.argv.slice(2).join(' ');
const cmd = `${npxBin} react-native start ${extraArgs}`.trim();

execSync(cmd, { stdio: 'inherit', shell: true });
