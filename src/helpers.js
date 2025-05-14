// Libraries
const { wait, random } = require('node-powertools');

// Module
function PuppeteerHelpers(parent, page) {
  const self = this;

  // Set page
  self.page = page;

  // Track last mouse position (initialized to random within config bounds)
  self.mousePosition = {
    x: Math.floor(Math.random() * parent?.config?.width),
    y: Math.floor(Math.random() * parent?.config?.height),
  };

  // Set debug mode
  self.debug = false;

  // Bind methods to this instance
  for (let key of Object.getOwnPropertyNames(PuppeteerHelpers.prototype)) {
    if (typeof this[key] === 'function' && key !== 'constructor') {
      this[key] = this[key].bind(this);
    }
  }

  // Return
  return self;
}

// Set debug mode
PuppeteerHelpers.prototype.setDebug = function (debug) {
  const self = this;

  // Set debug mode
  self.debug = debug;

  // Log
  if (debug) {
    console.log('Debug mode enabled');
  } else {
    console.log('Debug mode disabled');
  }
};

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

// Smooth human-like mouse movement with overshoot, easing, debug cursor, and segmented hops
PuppeteerHelpers.prototype._humanMouseMove = async function (from, to, debug) {
  const self = this;

  // === Config ===
  const OVERSHOOT_MIN = 20;
  const OVERSHOOT_MAX = 120;
  const STEP_MIN_DELAY = 1;    // minimum ms delay between small movements
  const STEP_MAX_DELAY = 15;   // max ms delay at slowest easing points
  const CORRECTION_DELAY_MIN = 4;
  const CORRECTION_DELAY_MAX = 10;
  const HOP_PAUSE_MIN = 150;
  const HOP_PAUSE_MAX = 400;

  // === Randomly segment the path ===
  const shouldSegment = Math.random() < 0.35;
  const segments = shouldSegment ? 1 + Math.floor(Math.random() * 2) : 1;

  const hops = [from];
  if (segments > 1) {
    for (let i = 0; i < segments - 1; i++) {
      const t = 0.3 + Math.random() * 0.4;
      const mid = {
        x: from.x + (to.x - from.x) * t + Math.random() * 30 - 15,
        y: from.y + (to.y - from.y) * t + Math.random() * 30 - 15,
      };
      hops.push(mid);
    }
  }
  hops.push(to);

  // === Perform movement for each hop ===
  for (let h = 0; h < hops.length - 1; h++) {
    const pointA = hops[h];
    const pointB = hops[h + 1];

    // Optional overshoot
    const shouldOvershoot = Math.random() < 0.5;
    const finalTarget = { x: pointB.x, y: pointB.y };

    if (shouldOvershoot) {
      const overshootMagnitude = OVERSHOOT_MIN + Math.random() * (OVERSHOOT_MAX - OVERSHOOT_MIN);
      const overshootAngle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
      finalTarget.x += Math.cos(overshootAngle) * overshootMagnitude;
      finalTarget.y += Math.sin(overshootAngle) * overshootMagnitude;
    }

    // Bezier control points
    const cp1 = {
      x: pointA.x + (finalTarget.x - pointA.x) * 0.3 + Math.random() * 60 - 30,
      y: pointA.y + (finalTarget.y - pointA.y) * 0.3 + Math.random() * 60 - 30,
    };
    const cp2 = {
      x: pointA.x + (finalTarget.x - pointA.x) * 0.7 + Math.random() * 60 - 30,
      y: pointA.y + (finalTarget.y - pointA.y) * 0.7 + Math.random() * 60 - 30,
    };

    const steps = 40 + Math.floor(Math.random() * 30);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const easing = 0.5 - 0.5 * Math.cos(Math.PI * t);
      const delay = STEP_MIN_DELAY + (STEP_MAX_DELAY - STEP_MIN_DELAY) * (1 - Math.cos(Math.PI * t));

      const pos = self._bezier(pointA, cp1, cp2, finalTarget, easing);

      await self.page.mouse.move(pos.x, pos.y);

      // if (debug) {
      //   await self.page.evaluate(({ x, y }) => {
      //     const cursor = document.querySelector('#debug-cursor');
      //     if (cursor) {
      //       cursor.style.left = `${x - 10}px`;
      //       cursor.style.top = `${y - 10}px`;
      //     }
      //   }, pos);
      // }

      await wait(delay);
    }

    // Correction movement
    if (shouldOvershoot) {
      const correctionSteps = 15 + Math.floor(Math.random() * 10);
      for (let i = 0; i <= correctionSteps; i++) {
        const t = i / correctionSteps;
        const ease = t * t * (3 - 2 * t);
        const x = finalTarget.x + (pointB.x - finalTarget.x) * ease;
        const y = finalTarget.y + (pointB.y - finalTarget.y) * ease;

        await self.page.mouse.move(x, y);

        // if (debug) {
        //   await self.page.evaluate(({ x, y }) => {
        //     const cursor = document.querySelector('#debug-cursor');
        //     if (cursor) {
        //       cursor.style.left = `${x - 10}px`;
        //       cursor.style.top = `${y - 10}px`;
        //     }
        //   }, { x, y });
        // }

        await wait(CORRECTION_DELAY_MIN + Math.random() * (CORRECTION_DELAY_MAX - CORRECTION_DELAY_MIN));
      }
    }

    // Update last position
    self.mousePosition = { x: pointB.x, y: pointB.y };

    // Wait between hops
    if (h < hops.length - 2) {
      await wait(HOP_PAUSE_MIN + Math.random() * (HOP_PAUSE_MAX - HOP_PAUSE_MIN));
    }
  }
};

// Inject debug cursor overlay if not already present
PuppeteerHelpers.prototype._injectDebugCursor = async function () {
  const self = this;

  const TRAIL_FADE_DURATION = 2000; // milliseconds
  const TRAIL_DOT_FREQUENCY = 10;   // minimum ms between dots

  await self.page.evaluate((TRAIL_FADE_DURATION, TRAIL_DOT_FREQUENCY) => {
    if (document.getElementById('debug-cursor')) return;

    const cursor = document.createElement('div');
    cursor.id = 'debug-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.zIndex = '999999';
    cursor.style.pointerEvents = 'none';
    cursor.style.left = '0px';
    cursor.style.top = '0px';

    const hBar = document.createElement('div');
    hBar.style.position = 'absolute';
    hBar.style.top = '50%';
    hBar.style.left = '0';
    hBar.style.width = '100%';
    hBar.style.height = '2px';
    hBar.style.background = 'red';
    hBar.style.transform = 'translateY(-50%)';

    const vBar = document.createElement('div');
    vBar.style.position = 'absolute';
    vBar.style.left = '50%';
    vBar.style.top = '0';
    vBar.style.width = '2px';
    vBar.style.height = '100%';
    vBar.style.background = 'red';
    vBar.style.transform = 'translateX(-50%)';

    cursor.appendChild(hBar);
    cursor.appendChild(vBar);
    document.body.appendChild(cursor);

    const trailContainer = document.createElement('div');
    trailContainer.id = 'debug-cursor-trail';
    trailContainer.style.position = 'fixed';
    trailContainer.style.top = '0';
    trailContainer.style.left = '0';
    trailContainer.style.width = '100vw';
    trailContainer.style.height = '100vh';
    trailContainer.style.pointerEvents = 'none';
    trailContainer.style.zIndex = '999998';
    document.body.appendChild(trailContainer);

    let lastTime = 0;

    document.addEventListener('mousemove', function(e) {
      const now = Date.now();
      if (now - lastTime < TRAIL_DOT_FREQUENCY) return;
      lastTime = now;

      const cursor = document.getElementById('debug-cursor');
      const trail = document.getElementById('debug-cursor-trail');

      if (cursor) {
        cursor.style.left = `${e.clientX - 10}px`;
        cursor.style.top = `${e.clientY - 10}px`;
      }

      if (trail) {
        const dot = document.createElement('div');
        dot.style.position = 'fixed';
        dot.style.left = `${e.clientX - 2}px`;
        dot.style.top = `${e.clientY - 2}px`;
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.borderRadius = '50%';
        dot.style.background = 'rgba(255, 0, 0, 0.8)';
        dot.style.pointerEvents = 'none';
        dot.style.zIndex = '999998';
        dot.style.transition = `opacity ${TRAIL_FADE_DURATION}ms ease-out`;
        trail.appendChild(dot);

        setTimeout(function() {
          dot.style.opacity = '0';
          setTimeout(function() {
            if (dot.parentElement === trail) {
              trail.removeChild(dot);
            }
          }, TRAIL_FADE_DURATION);
        }, 0);
      }
    });
  }, TRAIL_FADE_DURATION, TRAIL_DOT_FREQUENCY);
};

// Move mouse to element
PuppeteerHelpers.prototype.move = async function (selector, options) {
  const self = this;

  // Fix options
  options = options || {};
  options.timeout = typeof options.timeout === 'undefined' ? 10000 : options.timeout;
  options.minPredelay = typeof options.minPredelay === 'undefined' ? 80 : options.minPredelay;
  options.maxPredelay = typeof options.maxPredelay === 'undefined' ? 350 : options.maxPredelay;

  // const RANDOM_MIN = 0.3;
  // const RANDOM_MAX = 0.7;
  const RANDOM_MIN = 0.1;
  const RANDOM_MAX = 0.9;

  // Log
  if (options.log) {
    console.log(options.log);
  }

  // Wait for the selector to be visible
  await self.page.waitForSelector(selector, { visible: true, timeout: options.timeout });

  // Wait a random delay before moving the mouse
  await wait(options.minPredelay, options.maxPredelay, { mode: 'gaussian' });

  // Move the mouse to the element
  const element = await self.page.$(selector);
  if (element) {
    const box = await element.boundingBox();
    if (!box) throw new Error(`Cannot find bounding box for: ${selector}`);

    const target = {
      x: random(box.x + RANDOM_MIN * box.width, box.x + RANDOM_MAX * box.width, { mode: 'gaussian' }),
      y: random(box.y + RANDOM_MIN * box.height, box.y + RANDOM_MAX * box.height, { mode: 'gaussian' })
    };

    // Inject a visible cursor if debug is enabled
    if (self.debug) {
      await self._injectDebugCursor();
    }

    // HERE ME MUST HUMANLY MOVE THE MOUSE
    await self._humanMouseMove(self.mousePosition, target, self.debug);
  } else {
    throw new Error(`Element not found: ${selector}`);
  }
};

// Click fn
// PuppeteerHelpers.prototype.click = async function (selector, options) {
//   const self = this;

//   // Fix options
//   options = options || {};
//   options.timeout = typeof options.timeout === 'undefined' ? 10000 : options.timeout;
//   options.minPredelay = typeof options.minPredelay === 'undefined' ? 80 : options.minPredelay;
//   options.maxPredelay = typeof options.maxPredelay === 'undefined' ? 350 : options.maxPredelay;
//   options.minDelay = typeof options.minDelay === 'undefined' ? 40 : options.minDelay;
//   options.maxDelay = typeof options.maxDelay === 'undefined' ? 120 : options.maxDelay;

//   // Log
//   if (options.log) {
//     console.log(options.log);
//   }

//   // Wait for the selector to be visible
//   await self.page.waitForSelector(selector, { visible: true, timeout: options.timeout });

//   // Calculate predelay
//   const predelay = random(options.minPredelay, options.maxPredelay, { mode: 'gaussian' });
//   const delay = random(options.minDelay, options.maxDelay, { mode: 'gaussian' });

//   // Wait before clicking
//   await wait(predelay);

//   // Determine if cursor is currently over the correct element
//   const isOverTarget = await self.page.evaluate(({ x, y, selector }) => {
//     const elAtPoint = document.elementFromPoint(x, y);
//     const expectedEl = document.querySelector(selector);
//     return elAtPoint === expectedEl || expectedEl?.contains(elAtPoint);
//   }, {
//     x: self.mousePosition.x,
//     y: self.mousePosition.y,
//     selector
//   });

//   // Perform click
//   if (isOverTarget) {
//     // Log
//     if (options.log) {
//       console.log(`Clicking at coordiates ${self.mousePosition.x}, ${self.mousePosition.y} (delay=${delay})`);
//     }

//     // Move to position and manually click
//     await self.page.mouse.move(self.mousePosition.x, self.mousePosition.y);
//     await self.page.mouse.down(); // Mouse down
//     await self.wait(delay); // Wait between down and up
//     await self.page.mouse.up(); // Mouse up
//   } else {
//     const element = await self.page.$(selector);
//     if (element) {
//       // Log
//       if (options.log) {
//         console.log(`Clicking at element ${selector} (delay=${delay})`);
//       }

//       // Get element position
//       const box = await element.boundingBox();
//       if (!box) throw new Error(`Could not get bounding box for: ${selector}`);

//       const x = box.x + box.width / 2;
//       const y = box.y + box.height / 2;

//       // Move to position and manually click
//       await self.page.mouse.move(x, y);
//       await self.page.mouse.down(); // Mouse down
//       await self.wait(delay); // Wait between down and up
//       await self.page.mouse.up(); // Mouse up
//     } else {
//       throw new Error(`Element not found: ${selector}`);
//     }
//   }
// };

PuppeteerHelpers.prototype.click = async function (selector, options) {
  const self = this;

  // Fix options
  options = options || {};
  options.timeout = typeof options.timeout === 'undefined' ? 10000 : options.timeout;
  options.minPredelay = typeof options.minPredelay === 'undefined' ? 80 : options.minPredelay;
  options.maxPredelay = typeof options.maxPredelay === 'undefined' ? 350 : options.maxPredelay;
  options.minDelay = typeof options.minDelay === 'undefined' ? 40 : options.minDelay;
  options.maxDelay = typeof options.maxDelay === 'undefined' ? 120 : options.maxDelay;
  options.move = typeof options.move === 'undefined' ? true : options.move;
  options.scroll = typeof options.scroll === 'undefined' ? true : options.scroll;

  // Log
  if (options.log) {
    console.log(options.log);
  }

  // Scroll to the element if it's not in the viewport
  if (options.scroll) {
    await self.scroll(selector, {
      timeout: options.timeout,
      minPredelay: options.minPredelay,
      maxPredelay: options.maxPredelay,
    });
  }

  // Move to element if specified
  if (options.move) {
    await self.move(selector, {
      timeout: options.timeout,
      minPredelay: options.minPredelay,
      maxPredelay: options.maxPredelay,
    });
  } else {
    // Wait for the selector to be visible
    await self.page.waitForSelector(selector, { visible: true, timeout: options.timeout });
  }

  // Calculate predelay
  const predelay = random(options.minPredelay, options.maxPredelay, { mode: 'gaussian' });
  const delay = random(options.minDelay, options.maxDelay, { mode: 'gaussian' });

  // Wait before clicking
  await wait(predelay);

  // Log
  if (options.log) {
    console.log(`Clicking at coordiates ${self.mousePosition.x}, ${self.mousePosition.y} (delay=${delay})`);
  }

  // Move to position and manually click
  await self.page.mouse.move(self.mousePosition.x, self.mousePosition.y);
  await self.page.mouse.down(); // Mouse down
  await self.wait(delay); // Wait between down and up
  await self.page.mouse.up(); // Mouse up
};

PuppeteerHelpers.prototype.type = async function (text, options) {
  const self = this;

  // Fix options
  options = options || {};
  options.minDelay = options.minDelay || 40;
  options.maxDelay = options.maxDelay || 120;

  if (options.log) {
    console.log(options.log);
  }

  for (let char of text) {
    await self.page.keyboard.type(char);
    await wait(options.minDelay, options.maxDelay, { mode: 'gaussian' });
  }
}

PuppeteerHelpers.prototype.press = async function (key, options) {
  const self = this;

  // Fix options
  options = options || {};
  options.minDelay = options.minDelay || 40;
  options.maxDelay = options.maxDelay || 120;
  options.quantity = typeof options.quantity === 'undefined' ? 1 : options.quantity;

  if (options.log) {
    console.log(options.log);
  }

  for (let i = 0; i < options.quantity; i++) {
    await self.page.keyboard.press(key);
    await wait(options.minDelay, options.maxDelay, { mode: 'gaussian' });
  }
}

// Scroll
PuppeteerHelpers.prototype.scroll = async function (selector, options) {
  const self = this;

  // Fix options
  options = options || {};
  options.minPredelay = typeof options.minPredelay === 'undefined' ? 80 : options.minPredelay;
  options.maxPredelay = typeof options.maxPredelay === 'undefined' ? 350 : options.maxPredelay;

  if (options.log) {
    console.log(options.log);
  }

  // Calculate predelay
  const predelay = random(options.minPredelay, options.maxPredelay, { mode: 'gaussian' });

  // Wait before clicking
  await wait(predelay);

  // Scroll to the element if it's not in the viewport
  const element = await self.page.$(selector);
  if (element) {
    const isInViewport = await self.page.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }, element);

    if (!isInViewport) {
      await self.page.evaluate(el => el.scrollIntoView(), element);
    }
  }
}

// Wait fn
PuppeteerHelpers.prototype.wait = async function (min, max, options) {
  const self = this;

  // Fix options
  min = min || 100;
  max = max || 200;
  options = options || {};

  // Randomize wait time
  const waitTime = random(min, max, options);

  // Log
  if (options.log) {
    console.log(`Waiting ${waitTime}ms (min=${min}, max=${max})`);
  }

  // Wait
  await wait(waitTime);
}

// Export
module.exports = PuppeteerHelpers;
