// Libraries
const os = require('os');
const path = require('path');
const jetpack = require('fs-jetpack');
const powertools = require('node-powertools');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer-core');

// Helpers
const Helpers = require('./helpers.js');

// Library
function PuppeteerProfiles() {
  const self = this;

  // Set defaults
  self.config = {};
  self.options = {};

  // Set properties
  self.installations = [];
  self.initialized = false;
  self.browser = null;
  self.pages = [];

  // Return
  return self;
}

// Initialize
PuppeteerProfiles.prototype.initialize = function (config, options) {
  const self = this;

  return new Promise(async function(resolve, reject) {
    try {
      // Return if already initialized
      if (self.initialized) {
        return resolve(self.browser);
      }

      // config
      config = config || {};
      config.profile = config.profile || 'Default';
      config.width = config.width || 1280;
      config.height = config.height || 1280;
      self.config = config;

      // Get installations
      self.installations = await self.getInstallations();

      // Copy user profile
      const { userDataDir, profilePath } = copyUserProfile(config.profile);

      // Set defaults
      options = options || {};
      options.executablePath = options.executablePath || self.installations[0];
      // options.userDataDir = options.userDataDir || getUserDataDir();
      options.userDataDir = userDataDir;
      options.headless = typeof options.headless === 'undefined' ? false : options.headless;
      options.args = options.args || [];
      options.ignoreDefaultArgs = options.ignoreDefaultArgs || [];

      // Set args
      options.args.push(
        // '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        // '--disable-extensions',
        // '--disable-popup-blocking',
        // '--disable-default-apps',
        // '--disable-dev-shm-usage',
        // '--no-sandbox',
        // '--disable-gpu',
        '--remote-debugging-port=9222', // Optional for debugging
        // '--profile-directory=Default'
        // `--profile-directory=${config.profile}`,
        `--profile-directory=${profilePath}`,
        `--window-size=${config.width},${config.height}`,
      );

      // Set ignoreDefaultArgs
      options.ignoreDefaultArgs.push(
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
      console.log('Puppeteer.initialize()');

      // Kill existing Chrome instances
      // await self.killChrome()
      // .catch((e) => {
      //   console.warn('Error killing Chrome:', e);
      // });
      // clearChromeLock(config.profile)

      // Launch
      self.browser = await puppeteer.launch(options)
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

      // Set options
      self.options = options;

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
      await page.setViewport({
        width: self.config.width,
        height: self.config.height,
      })

      // Modify the navigator.webdriver to bypass detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
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

function copyUserProfile(profileName) {
  // Get username and platform-specific Chrome user data directory
  const username = os.userInfo().username
  const baseDir = {
    darwin: `/Users/${username}/Library/Application Support/Google/Chrome`,
    linux: `/home/${username}/.config/google-chrome`,
    win32: `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`
  }[process.platform]

  // Resolve paths
  const sourceProfilePath = path.join(baseDir, profileName)
  const tempBase = path.join(os.tmpdir(), 'Puppeteer')
  const destProfilePath = path.join(tempBase, profileName)

  // Log
  console.log('Copying Chrome profile from:', sourceProfilePath);

  // Ensure temp directory exists
  jetpack.dir(tempBase)

  // Delete destination profile if it exists
  jetpack.remove(destProfilePath)

  // Copy profile with filtering
  jetpack.copy(sourceProfilePath, destProfilePath, {
    overwrite: true,
    matching: [
      '**',
      '!SingletonLock',
      '!lockfile',
      '!**/Crashpad/**',
      '!**/BrowserMetrics/**',
      '!**/Cache/**',
      '!**/Code Cache/**',
      '!**/GPUCache/**',
      '!**/ShaderCache/**',
      '!**/Service Worker/CacheStorage/**'
    ]
  })

  // Log
  console.log('Copied Chrome profile to:', destProfilePath);

  // Return
  return { userDataDir: tempBase, profilePath: profileName }
}

// Export
module.exports = PuppeteerProfiles;
