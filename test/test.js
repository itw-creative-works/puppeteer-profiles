// Libraries
const package = require('../package.json');
const assert = require('assert');
const PuppeteerProfiles = require('../dist/index.js'); // your PuppeteerProfiles class
const wait = require('node-powertools').wait;

const TEST_URL = 'https://output.jsbin.com/meqemequbo';

let browserManager;
let page;

before(async function () {
  this.timeout(60000); // Allow up to 60s for browser init

  browserManager = new PuppeteerProfiles();
  await browserManager.initialize({
    profile: 'Default',
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
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await wait(1000, 1500, { log: true});

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
          debug: true,
        });

        // Click node
        await page.tools.click(selector, {
          log: `Clicking node ${i}`,
          timeout: 10000,
          minDelay: 50,
          maxDelay: 140,
          debug: true,
        });
      }

      // Final check
      assert(true, 'Successfully moved and clicked all nodes');
    });
  });
});
