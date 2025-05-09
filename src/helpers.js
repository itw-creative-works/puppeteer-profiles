// Libraries
const { wait } = require('node-powertools');

// Module
function PuppeteerHelpers(self, page) {
  // Set page
  this.page = page;

  // Get dimensions from config if available
  const width = (self && self.config && self.config.width) || 300;
  const height = (self && self.config && self.config.height) || 300;

  // Track last mouse position (initialized to random within config bounds)
  this.mousePosition = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
  };
}

// Bezier helper
PuppeteerHelpers.prototype._bezier = function (p0, p1, p2, p3, t) {
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;

  const cY = 3 * (p1.y - p0.y);
  const bY = 3 * (p2.y - p1.y) - cY;
  const aY = p3.y - p0.y - cY - bY;

  const x = aX * t * t * t + bX * t * t + cX * t + p0.x;
  const y = aY * t * t * t + bY * t * t + cY * t + p0.y;

  return { x, y };
};

// Smooth human-like mouse movement
PuppeteerHelpers.prototype._humanMouseMove = async function (from, to) {
  const steps = 30 + Math.floor(Math.random() * 20);

  const cp1 = {
    x: from.x + (to.x - from.x) * 0.3 + Math.random() * 60 - 30,
    y: from.y + (to.y - from.y) * 0.3 + Math.random() * 60 - 30,
  };
  const cp2 = {
    x: from.x + (to.x - from.x) * 0.7 + Math.random() * 60 - 30,
    y: from.y + (to.y - from.y) * 0.7 + Math.random() * 60 - 30,
  };

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pos = this._bezier(from, cp1, cp2, to, t);
    await this.page.mouse.move(pos.x, pos.y);
    await wait(2, 8); // Simulate hand jitter
  }

  // Update last mouse position
  this.mousePosition = { x: to.x, y: to.y };
};

// Move mouse to element
PuppeteerHelpers.prototype.move = async function (selector, options) {
  // Fix options
  options = options || {};
  options.timeout = typeof options.timeout === 'undefined' ? 10000 : options.timeout;
  options.minDelay = typeof options.minDelay === 'undefined' ? 500 : options.minDelay;
  options.maxDelay = typeof options.maxDelay === 'undefined' ? 1000 : options.maxDelay;

  // Log
  if (options.log) {
    console.log(options.log);
  }

  // Wait for the selector to be visible
  await this.page.waitForSelector(selector, { visible: true, timeout: options.timeout });

  // Wait a random delay before moving the mouse
  await wait(options.minDelay, options.maxDelay);

  // Move the mouse to the element
  const element = await this.page.$(selector);
  if (element) {
    const box = await element.boundingBox();
    if (!box) throw new Error(`Cannot find bounding box for: ${selector}`);

    const target = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };

    // HERE ME MUST HUMANLY MOVE THE MOUSE
    await this._humanMouseMove(this.mousePosition, target);
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
};

// Click fn
PuppeteerHelpers.prototype.click = async function (selector, options) {
  // Fix options
  options = options || {};
  options.timeout = typeof options.timeout === 'undefined' ? 10000 : options.timeout;
  options.minDelay = typeof options.minDelay === 'undefined' ? 500 : options.minDelay;
  options.maxDelay = typeof options.maxDelay === 'undefined' ? 1000 : options.maxDelay;

  // Log
  if (options.log) {
    console.log(options.log);
  }

  // Wait for the selector to be visible
  await this.page.waitForSelector(selector, { visible: true, timeout: options.timeout });

  // Wait a random delay before clicking
  await wait(options.minDelay, options.maxDelay);

  // Click the element
  const element = await this.page.$(selector);
  if (element) {
    await element.click();
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
};

// Type fn
PuppeteerHelpers.prototype.type = async function (text, options) {
  // Fix options
  options = options || {};
  options.minDelay = options.minDelay || 40;
  options.maxDelay = options.maxDelay || 120;
  options.mode = typeof options.mode === 'undefined' ? 'type' : options.mode;
  options.quantity = typeof options.quantity === 'undefined' ? 1 : options.quantity;

  // Log
  if (options.log) {
    console.log(options.log);
  }

  if (options.mode === 'type') {
    // Type character by character with random delay
    for (let char of text) {
      await this.page.keyboard.type(char);
      await wait(options.minDelay, options.maxDelay);
    }
  } else {
    // Press key multiple times with delay
    for (let i = 0; i < options.quantity; i++) {
      await this.page.keyboard.press(text);
      await wait(options.minDelay, options.maxDelay);
    }
  }
};

// Wait fn
PuppeteerHelpers.prototype.wait = wait;

// Export
module.exports = PuppeteerHelpers;
