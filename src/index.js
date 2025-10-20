// Libraries
const os = require('os');
const path = require('path');
const jetpack = require('fs-jetpack');
const powertools = require('node-powertools');
const chromeLauncher = require('chrome-launcher');
// const puppeteer = require('puppeteer-core');
let puppeteer;

// Helpers
const Helpers = require('./helpers.js');

// Library
function PuppeteerProfiles() {
  const self = this;

  // Set defaults
  self.config = {};

  // Set properties
  self.installations = [];
  self.initialized = false;
  self.browser = null;
  self.pages = [];

  // Return
  return self;
}

/*
  * BOT DETECTION WEBSITES
  * https://www.browserscan.net/bot-detection
  * https://bot-detector.rebrowser.net/
  * https://bot.sannysoft.com/
  *
  * ENDED UP SWITCHING TO REBROWSER
  * https://github.com/rebrowser/rebrowser-patches
  * https://rebrowser.net/blog/how-to-fix-runtime-enable-cdp-detection-of-puppeteer-playwright-and-other-automation-libraries
  * https://deviceandbrowserinfo.com/learning_zone/articles/detecting-headless-chrome-puppeteer-2024
  * https://github.com/ultrafunkamsterdam/nodrivernpu
*/

// Initialize
PuppeteerProfiles.prototype.initialize = function (config) {
  const self = this;

  return new Promise(async function(resolve, reject) {
    try {
      // Return if already initialized
      if (self.initialized) {
        return resolve(self.browser);
      }

      // Set defaults
      config = config || {};

      // Require puppeteer
      puppeteer = config.puppeteer || require('rebrowser-puppeteer-core');

      // Set profile options
      config.profile = typeof config.profile === 'undefined'
        ? 'Default'
        : config.profile;
      config.useSourcePath = typeof config.useSourcePath === 'undefined'
        ? false
        : config.useSourcePath;
      config.copyUserDataDir = typeof config.copyUserDataDir === 'undefined'
        ? true
        : config.copyUserDataDir;
      config._userProfileFiles = config._userProfileFiles;
      config._remoteDebuggingPort = typeof config._remoteDebuggingPort === 'undefined'
        ? 9222
        : config._remoteDebuggingPort;
      config.width = config.width || 1280;
      config.height = config.height || 1280;

      // Set flags
      config.flags = config.flags || {};
      config.flags.disableEncryption = typeof config.flags.disableEncryption === 'undefined'
        ? false
        : config.flags.disableEncryption;

      // Set puppeteer options
      config.puppeteerOptions = config.puppeteerOptions || {};

      // Get installations
      self.installations = await self.getInstallations();

      // Copy user profile (only if profile is not explicitly false)
      let userDataDir = null;
      let profilePath = null;

      if (config.profile !== false) {
        const profileData = copyUserData(config);
        userDataDir = profileData.userDataDir;
        profilePath = profileData.profilePath;
      }

      // Set puppeteer options
      const puppeteerOptions = config.puppeteerOptions;
      puppeteerOptions.executablePath = puppeteerOptions.executablePath || self.installations[0];

      // Only set userDataDir if profile is being used
      if (userDataDir) {
        puppeteerOptions.userDataDir = userDataDir;
      }

      puppeteerOptions.headless = typeof puppeteerOptions.headless === 'undefined' ? true : puppeteerOptions.headless;
      puppeteerOptions.args = puppeteerOptions.args || [];
      puppeteerOptions.ignoreDefaultArgs = puppeteerOptions.ignoreDefaultArgs || [];
      puppeteerOptions.defaultViewport = null;
      puppeteerOptions.protocolTimeout = puppeteerOptions.protocolTimeout || 60000;

      // Set args
      puppeteerOptions.args.push(
        // '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        // '--disable-extensions',
        // '--disable-popup-blocking',
        // '--disable-default-apps',
        // '--disable-dev-shm-usage',
        // '--no-sandbox',
        // '--disable-setuid-sandbox',
        // '--disable-gpu',
        `--remote-debugging-port=${config._remoteDebuggingPort}`, // Optional for debugging
        // '--profile-directory=Default'
        // `--profile-directory=${config.profile}`,
        `--window-size=${config.width},${config.height}`,
        '--start-maximized',
        '--disable-breakpad', // Disable crash reporting
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-restore-session-state',
        // '--auto-open-devtools-for-tabs',
      );

      // Only add profile-directory arg if profile is being used
      if (profilePath) {
        puppeteerOptions.args.push(`--profile-directory=${profilePath}`);
      }

      // If config.flags.disableEncryption is set, add the flag
      if (config.flags.disableEncryption) {
        puppeteerOptions.args.push('--disable-encryption');
      }

      // Set ignoreDefaultArgs
      puppeteerOptions.ignoreDefaultArgs.push(
        '--enable-automation',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
        '--allow-pre-commit-input',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-dev-shm-usage',
        '--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--enable-blink-features=IdleDetection',
        '--enable-features=NetworkServiceInProcess2',
        '--export-tagged-pdf',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--password-store=basic',
        '--use-mock-keychain',
      );

      // Log options
      console.log(`Puppeteer.initialize() userDataDir=${puppeteerOptions.userDataDir}, profilePath=${profilePath}`);

      // Kill existing Chrome instances
      // await self.killChrome()
      // .catch((e) => {
      //   console.warn('Error killing Chrome:', e);
      // });
      // clearChromeLock(config.profile)

      // Launch
      self.browser = await puppeteer.launch(puppeteerOptions)
      .catch((e) => {
        // Log error
        console.error('⚠️⚠️⚠️ Is there an existing Chrome instance running?');

        // Log error
        console.error('Error launching Puppeteer:', e);

        // Throw error
        throw e;
      });

      // Set initialized
      self.initialized = true;
      self.config = config;

      // Return
      return resolve(self.browser);
    } catch (e) {
      return reject(e);
    }
  });
}

// Page
PuppeteerProfiles.prototype.page = function (options) {
  const self = this;

  return new Promise(async function(resolve, reject) {
    try {
      // Check if initialized
      if (!self.initialized) {
        throw new Error('Puppeteer is not initialized');
      }

      // Start page
      const page = await self.browser.newPage();

      // Set full viewport size
      // await page.setViewport({
      //   width: self.config.width,
      //   height: self.config.height,
      // })

      // Modify the navigator.webdriver to bypass detection
      await page.evaluateOnNewDocument(() => {
        // Fake navigator.webdriver
        // Disabled because it seems to trigger detection when enabled
        // Object.defineProperty(navigator, 'webdriver', {
        //   get: () => false,
        // });

        // Remove debug trace identifiers
        // const originalCall = console.debug;
        // console.debug = function () {
        //   if (arguments[0] && arguments[0].toString().includes('__puppeteer_evaluation_script__')) return
        //   return originalCall.apply(this, arguments)
        // }

        // Patch Error.stack getter detection
        // https://deviceandbrowserinfo.com/learning_zone/articles/detecting-headless-chrome-puppeteer-2024
        // const originalDebug = console.debug;
        // console.debug = function() {
        //   // Avoid triggering the CDP test stack getter
        //   for (let i = 0; i < arguments.length; i++) {
        //     if (arguments[i] instanceof Error) {
        //       continue;
        //     }
        //   }
        //   return originalDebug.apply(this, arguments);
        // };

        // const originalDebug = console.debug
        // console.debug = function () {
        //   try {
        //     const arg = arguments[0]
        //     if (
        //       arg instanceof Error &&
        //       Object.prototype.hasOwnProperty.call(arg, 'stack')
        //     ) {
        //       const desc = Object.getOwnPropertyDescriptor(arg, 'stack')

        //       // If it has a custom getter, override it before logging
        //       if (desc && typeof desc.get === 'function') {
        //         delete arg.stack
        //         arg.stack = Error().stack
        //       }
        //     }
        //   } catch (e) {
        //     // fail silently
        //   }

        //   return originalDebug.apply(this, arguments)
        // }

        // const originalError = Error;
        // function FakeError(...args) {
        //   const err = new originalError(...args)
        //   Object.defineProperty(err, 'stack', {
        //     get: function () {
        //       return originalError().stack
        //     }
        //   })
        //   return err;
        // }
        // FakeError.prototype = originalError.prototype;
        // window.Error = FakeError;
      });


      // Inject helpers
      page.tools = new Helpers(self, page);

      // Set properties
      self.pages.push(page);

      // Return
      return resolve(page);
    } catch (e) {
      return reject(e);
    }
  });
}

// Kill Chrome
PuppeteerProfiles.prototype.killChrome = function () {
  const self = this;

  return new Promise(async function(resolve, reject) {
    // Command to kill Chrome (works for Mac/Linux/Windows)
    const killChromeCmd = process.platform === 'win32'
      ? 'taskkill /IM chrome.exe /F'
      : 'killall \'Google Chrome\'';
      // : 'pkill chrome';

    // Kill Chrome
    try {
      await powertools.execute(killChromeCmd)

      // Return
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

// Kill Chrome
PuppeteerProfiles.prototype.getInstallations = function () {
  const self = this;

  return new Promise(async function(resolve, reject) {
    try {
      // Set properties
      try {
        // Get all Chrome/Chromium installations
        self.installations = chromeLauncher.Launcher.getInstallations();
      } catch (e) {
        self.installations = [];
        console.error('Error getting Chrome installations:', e);
      }

      // Return
      return resolve(self.installations);
    } catch (e) {
      return reject(e);
    }
  });
}

// Fix: Copy entire Chrome "User Data" dir
function copyUserData(config) {
  // Get username and platform-specific Chrome user data directory
  const username = os.userInfo().username
  const sourceDir = {
    darwin: `/Users/${username}/Library/Application Support/Google/Chrome`,
    linux: `/home/${username}/.config/google-chrome`,
    win32: `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`
  }[process.platform]

  // If config.useSourcePath is set, use it
  if (config.useSourcePath) {
    return { userDataDir: sourceDir, profilePath: config.profile }
  }

  // Resolve paths
  const sourceProfilePath = path.join(sourceDir, config.profile)
  const tempBase = path.join(os.tmpdir(), 'Puppeteer')
  const destProfilePath = path.join(tempBase, config.profile)

  // Log
  console.log('Copying Chrome profile from:', sourceProfilePath);

  // Ensure temp directory exists
  jetpack.dir(tempBase)

  // Delete destination profile if it exists
  jetpack.remove(destProfilePath)

  // Copy profile with filtering
  jetpack.copy(sourceProfilePath, destProfilePath, {
    overwrite: true,
    matching: config._userProfileFiles || [
      '**',
      '!SingletonLock',
      '!lockfile',
      '!**/Crashpad/**',
      '!**/Crash Reports/**', // Exclude crash reports
      '!**/BrowserMetrics/**',
      '!**/Cache/**',
      '!**/Code Cache/**',
      '!**/GPUCache/**',
      '!**/ShaderCache/**',
      '!**/Service Worker/CacheStorage/**',
      '!**/Sessions/**',
    ]
  })

  // Log
  console.log('Copied Chrome profile to:', destProfilePath);

  // Return
  return { userDataDir: tempBase, profilePath: config.profile }
}

// NOTE
// WE WROTE THIS TO TRY TO FIX WINDOWS, BUT IT DIDN'T WORK
// IT DID BREAK THE MAC VERSION
// SO WE WENT BACK TO THE ORIGINAL ABOVE
// function copyUserData(config) {
//   const username = os.userInfo().username;
//   const sourceDir = {
//     darwin: `/Users/${username}/Library/Application Support/Google/Chrome`,
//     linux: `/home/${username}/.config/google-chrome`,
//     win32: `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`
//   }[process.platform];

//   // If using original source
//   if (config.useSourcePath) {
//     return { userDataDir: sourceDir, profilePath: config.profile };
//   }

//   // Log
//   console.log('Starting copy from', sourceDir);

//   // Clone whole user data dir
//   const destinationDir = path.join(os.tmpdir(), 'Puppeteer', 'User Data');

//   // Perform copy
//   if (config.copyUserDataDir) {
//     // Remove Existing destinationDir
//     jetpack.remove(destinationDir);

//     //  Copy user data
//     jetpack.copy(sourceDir, destinationDir, {
//       overwrite: true,
//       // matching: config._userProfileFiles || ['**', '!SingletonLock']
//       matching: [
//         '**',

//         '!**/Default/**',
//         '!**/Profile */**',

//         '!SingletonLock',
//         '!lockfile',
//         '!**/Crashpad/**',
//         '!**/Crash Reports/**', // Exclude crash reports
//         '!**/BrowserMetrics/**',
//         '!**/Cache/**',
//         '!**/Code Cache/**',
//         '!**/GPUCache/**',
//         '!**/ShaderCache/**',
//         '!**/Service Worker/CacheStorage/**',
//         '!**/Sessions/**',
//         // '!Default',
//         // '!Profile *', // Exclude any
//       ]
//     });

//     // Copy profile
//     const sourceProfilePath = path.join(sourceDir, config.profile);
//     const destProfilePath = path.join(destinationDir, config.profile);
//     jetpack.copy(sourceProfilePath, destProfilePath, {
//       overwrite: true,
//       matching: [
//         '**',

//         '!SingletonLock',
//         '!lockfile',
//         '!**/Crashpad/**',
//         '!**/Crash Reports/**', // Exclude crash reports
//         '!**/BrowserMetrics/**',
//         '!**/Cache/**',
//         '!**/Code Cache/**',
//         '!**/GPUCache/**',
//         '!**/ShaderCache/**',
//         '!**/Service Worker/CacheStorage/**',
//         '!**/Sessions/**',
//       ]
//     });

//     // Log
//     console.log('Finished copy to', destinationDir);
//   } else {
//     // console.log('Finished copy to', destinationDir);
//   }

//   return { userDataDir: destinationDir, profilePath: config.profile };
// }

// Export
module.exports = PuppeteerProfiles;
