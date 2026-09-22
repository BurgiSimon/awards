// Shared browser actions for trusted recipe states and declarative capture plans.
const FIELDS = {
  click: ['selector'], hover: ['selector'], focus: ['selector'], press: ['key'],
  move: ['x', 'y', 'steps'], down: [], up: [], wheel: ['dx', 'dy'], wait: ['ms'],
  waitFor: ['selector', 'state', 'fn'], reload: [],
};

export function validateActions(actions, { allowFunctions = true } = {}) {
  if (!Array.isArray(actions)) throw new Error('actions must be an array');
  for (const [index, action] of actions.entries()) {
    const fail = (message) => { throw new Error('action ' + (index + 1) + ': ' + message); };
    if (!action || typeof action !== 'object' || !Object.hasOwn(FIELDS, action.type)) fail('unknown action type');
    const fields = FIELDS[action.type];
    for (const key of Object.keys(action)) if (!['type', 'timeout', ...fields].includes(key)) fail('unknown field ' + key);
    const string = (key) => { if (typeof action[key] !== 'string' || !action[key].trim()) fail(key + ' must be a nonempty string'); };
    if (['click', 'hover', 'focus'].includes(action.type)) string('selector');
    if (action.type === 'press') string('key');
    if (action.type === 'move' && (!Number.isFinite(action.x) || !Number.isFinite(action.y))) fail('move requires finite x and y');
    for (const key of ['timeout', 'steps', 'ms', 'dx', 'dy']) {
      if (action[key] === undefined) continue;
      if (!Number.isFinite(action[key])) fail(key + ' must be finite');
      if (['timeout', 'steps'].includes(key) && action[key] <= 0) fail(key + ' must be positive');
      if (key === 'steps' && !Number.isInteger(action[key])) fail('steps must be an integer');
      if (key === 'ms' && action[key] < 0) fail('ms cannot be negative');
    }
    if (action.type === 'waitFor') {
      if ((action.selector !== undefined) === (action.fn !== undefined)) fail('waitFor needs exactly one of selector or fn');
      if (action.fn !== undefined && !allowFunctions) fail('capture plans use selector-based waitFor, not executable fn');
      string(action.selector !== undefined ? 'selector' : 'fn');
      if (action.state !== undefined && (!action.selector || !['visible', 'hidden', 'attached', 'detached'].includes(action.state))) fail('invalid selector state');
    }
  }
}

export async function runActions(page, actions, { timeout = 15000 } = {}) {
  validateActions(actions);
  for (const [index, action] of actions.entries()) {
    const options = { timeout: action.timeout ?? timeout };
    try {
      switch (action.type) {
        case 'click': await page.click(action.selector, options); break;
        case 'hover': await page.hover(action.selector, options); break;
        case 'focus': await page.focus(action.selector, options); break;
        case 'press': await page.keyboard.press(action.key); break;
        case 'move': await page.mouse.move(action.x, action.y, { steps: action.steps ?? 8 }); break;
        case 'down': await page.mouse.down(); break;
        case 'up': await page.mouse.up(); break;
        case 'wheel': await page.mouse.wheel(action.dx ?? 0, action.dy ?? 0); break;
        case 'wait': await page.waitForTimeout(action.ms ?? 300); break;
        case 'waitFor':
          if (action.selector) await page.waitForSelector(action.selector, { ...options, state: action.state ?? 'visible' });
          else await page.waitForFunction(action.fn, null, options);
          break;
        case 'reload':
          await page.reload({ waitUntil: 'load', ...options });
          await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((resolve) => setTimeout(resolve, 8000))]));
          break;
      }
    } catch (error) {
      throw new Error('action ' + (index + 1) + ' (' + action.type + '): ' + error.message);
    }
  }
}
