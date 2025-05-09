// Libraries
const package = require('../package.json');
const assert = require('assert');
const PuppeteerProfiles = require('../dist/index.js'); // your PuppeteerProfiles class
const wait = require('node-powertools').wait;

let browserManager;
let page;

before(async function () {
  this.timeout(60000); // Allow up to 60s for browser init

  browserManager = new PuppeteerProfiles();
  await browserManager.initialize({
    profile: 'Default',
    width: 1280,
    height: 720
  });

  page = await browserManager.page();
});

after(async () => {
  if (browserManager && browserManager.browser) {
    await browserManager.browser.close();
  }
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {
  describe('.interactionTest()', function () {
    this.timeout(60000); // Allow extra time for full interaction

    it('should navigate and click all nodes using tools.move', async () => {
      // Go to test page
      await page.goto('https://output.jsbin.com/cefalixiqe', { waitUntil: 'networkidle2' });
      await wait(1000, 1500);

      // Ensure nodes are present
      const nodeHandles = await page.$$('[data-node]');
      assert(nodeHandles.length === 10, 'Expected 10 nodes on the page');

      // Loop and interact
      for (let i = 1; i <= 10; i++) {
        const selector = `[data-node="${i}"]`;

        // Move to node
        await page.tools.move(selector, {
          log: `Moving to node ${i}`,
          timeout: 10000,
          minDelay: 300,
          maxDelay: 600
        });

        // Click node
        const el = await page.$(selector);
        assert(el, `Element not found for selector ${selector}`);
        await el.click();
      }

      // Final check
      assert(true, 'Successfully moved and clicked all nodes');
    });
  });
});
