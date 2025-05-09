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

## 🌐 Puppeteer Profiles Works in Node AND browser environments
Yes, this module works in both Node and browser environments, including compatibility with [Webpack](https://www.npmjs.com/package/webpack) and [Browserify](https://www.npmjs.com/package/browserify)!

## 🦄 Features
* Use your cookies, logins, and more with Puppeteer

## 🔑 Getting an API key
You can use so much of `puppeteer-profiles` for free, but if you want to do some advanced stuff, you'll need an API key. You can get one by [signing up for a Puppeteer Profiles account](https://itwcreativeworks.com/signup).

## 📦 Install Puppeteer Profiles
### Option 1: Install via npm
Install with npm if you plan to use `puppeteer-profiles` in a Node project or in the browser.
```shell
npm install puppeteer-profiles
```
If you plan to use `puppeteer-profiles` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const puppeteerProfiles = new (require('puppeteer-profiles'))({
  // Not required, but having one removes limits (get your key at https://itwcreativeworks.com).
  apiKey: 'api_test_key'
});
```

### Option 2: Install via CDN
Install with CDN if you plan to use Puppeteer Profiles only in a browser environment.
```html
<script src="https://cdn.jsdelivr.net/npm/puppeteer-profiles@latest/dist/index.min.js"></script>
<script type="text/javascript">
  var puppeteerProfiles = new Puppeteer({
    // Not required, but having one removes limits (get your key at https://itwcreativeworks.com).
    apiKey: 'api_test_Key'
  });
</script>
```

### Option 3: Use without installation
You can use `puppeteer-profiles` in a variety of ways that require no installation, such as `curl` in terminal/shell.

```shell
# Standard
curl -X POST https://api.itwcreativeworks.com
```

## ⚡️ Usage
### puppeteerProfiles.run(options)
```js
puppeteerProfiles.run(options);
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
