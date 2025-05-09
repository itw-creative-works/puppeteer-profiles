<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/puppeteer-profiles.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/puppeteer-profiles.svg">
  <img src="https://img.shields.io/bundlephobia/min/puppeteer-profiles.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/puppeteer-profiles.svg">
  <img src="https://img.shields.io/npm/dm/puppeteer-profiles.svg">
  <img src="https://img.shields.io/node/v/puppeteer-profiles.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/itw-creative-works/puppeteer-profiles.svg">
  <img src="https://img.shields.io/github/contributors/itw-creative-works/puppeteer-profiles.svg">
  <img src="https://img.shields.io/github/last-commit/itw-creative-works/puppeteer-profiles.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/puppeteer-profiles">NPM Module</a> | <a href="https://github.com/itw-creative-works/puppeteer-profiles">GitHub Repo</a>
  <br>
  <br>
  <strong>puppeteer-profiles</strong> is the official npm module of <a href="https://itwcreativeworks.com">Puppeteer Profiles</a>, a free app for Use your cookies, logins, and more with Puppeteer.
</p>

## 🦄 Features
* Use your cookies, logins, and more with Puppeteer

## 📦 Install Puppeteer Profiles
### Install via npm
Install with npm if you plan to use `puppeteer-profiles` in a Node project or in the browser.
```shell
npm install puppeteer-profiles
```
If you plan to use `puppeteer-profiles` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const PuppeteerProfiles = require('puppeteer-profiles');
const puppeteerProfiles = new PuppeteerProfiles();

// Create a new browser manager
await browserManager.initialize({
  profile: 'Default',
  width: 1280,
  height: 800,
  puppeteerOptions: {
    headless: false,
  },
});

// Basic usage
const page = await browserManager.page();
await page.goto('https://example.com');
```

## ⚡️ Usage
### .initialize(config, options)
Initialize the browser with a copied Chrome user profile.
#### config (Custom Config)
- `profile` (string) - Name of Chrome profile to load (e.g., `"Default"`)
- `width`, `height` (number) - Window size (default: `1280x1280`)
- `puppeteerOptions` (object) - Puppeteer launch options
  - `executablePath` (string) - Custom Chrome path
  - `headless` (boolean) - Launch in headless mode (default: `false`)
  - `args` (array) - Additional Chromium launch args
```js
await browserManager.initialize({
  profile: 'Default',
  width: 1280,
  height: 800,
  puppeteerOptions: {
    headless: false,
  },
});
```

### .page()
Create a new page in the browser that is an instance of the Puppeteer page class.

This method attaches our special `tools` library to the page, which allows you to use the advanced features of **Puppeteer Profiles**.
```js
const page = await browserManager.page();
```

### .tools.move(selector, options)
Move the mouse to a specific element on the page. The mouse moves in a **human-like** way, with a random delay between each step. The mouse will end at a slightly offcenter position of the element calculated by **gaussian distribution**.

If you want to click something, just use `click`, which will automatically move the mouse to the element before clicking.
### options
- `minPredelay` (number) - Minimum delay before the move begins (default: `500`)
- `maxPredelay` (number) - Maximum delay before the move begins (default: `1000`)
```js
await page.goto('https://example.com');
await page.tools.move('button#submit');
```

### .tools.click(selector, options)
Click on a specific element on the page. The click is performed in a **human-like** way, with a random delay between each step. If you use `move` before `click`, the click will happen at the X and Y coordinates at the end of the `move`.

If move is not use, the click will happen at the current mouse position.
### options
- `minPredelay` (number) - Minimum delay before the click begins (default: `500`)
- `maxPredelay` (number) - Maximum delay before the click begins (default: `1000`)
- `minDelay` (number) - Minimum delay between clicks (default: `40`)
- `maxDelay` (number) - Maximum delay between clicks (default: `120`)
- `move` (boolean) - Whether to move the mouse to the element before clicking (default: `true`)
```js
await page.goto('https://example.com');
await page.tools.click('button#submit');
```

### .tools.type(text, options)
Type text into a specific element on the page. The typing is performed in a **human-like** way, with a random delay between each keystroke. The text is typed at the X and Y coordinates of the element calculated by **gaussian distribution**.
### options
- `minDelay` (number) - Minimum delay between keystrokes (default: `40`)
- `maxDelay` (number) - Maximum delay between keystrokes (default: `120`)
```js
await page.goto('https://example.com');
await page.tools.click('input#username');
await page.tools.type('myusername');
```

### .tools.press(button, options)
Press a key on the keyboard. You can supply a `quantity` to press the key multiple times.
### options
- `minDelay` (number) - Minimum delay between keystrokes (default: `40`)
- `maxDelay` (number) - Maximum delay between keystrokes (default: `120`)
- `quantity` (number) - Number of times to press the key (default: `1`)
```js
await page.goto('https://example.com');
await page.tools.click('input#username');
await page.tools.type('myusername');
await page.tools.press('Enter');
```

### .tools.setDebug(debug)
Set the debug mode for the tools library. This will show a visual representation of the mouse movements and clicks on the page. This is useful for debugging and testing the library.
### options
- `debug` (boolean) - Whether to show the debug mode (default: `false`)
```js
await page.goto('https://example.com');
await page.tools.setDebug(true);
await page.tools.click('input#username');
```

## 📘 Using Puppeteer Profiles
After you have followed the install step, you can start using `puppeteer-profiles` to enhance your project.

For a more in-depth documentation of this library and the Puppeteer Profiles service, please visit the official Puppeteer Profiles website.

## 📝 What Can Puppeteer Profiles do?
Puppeteer but with your actual chrome profile!

## 🗨️ Final Words
If you are still having difficulty, we would love for you to post
a question to [the Puppeteer Profiles issues page](https://github.com/itw-creative-works/puppeteer-profiles/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 📚 Projects Using this Library
* [ITW Creative Works](https://itwcreativeworks.com)
* [Somiibo](https://somiibo.com)
* [Slapform](https://slapform.com)
* [StudyMonkey](https://studymonkey.ai)
* [DashQR](https://dashqr.com)
* [Replyify](https://replyify.app)
* [SoundGrail](https://soundgrail.com)
* [Trusteroo](https://trusteroo.com)

Ask us to have your project listed! :)
