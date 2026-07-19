/**
 * cypress-mock-latency
 * Simulate real-world, unstable network conditions (latency + jitter) in Cypress tests.
 */

// Built-in network condition presets
const PROFILES = {
  '3g-poor': { min: 400, max: 1200, jitter: 0.2, spike: 1500 },
  '3g-good': { min: 150, max: 500, jitter: 0.1, spike: 800 },
  '4g-congested': { min: 150, max: 450, jitter: 0.1, spike: 1000 },
  'satellite': { min: 600, max: 2000, jitter: 0.3, spike: 2000 },
  'offline-flaky': { min: 2000, max: 5000, jitter: 0.5, spike: 3000 },
};

/**
 * Resolve a profile name, numeric ms value, or custom config object
 * into a normalized { min, max, jitter, spike } config.
 */
function resolveConfig(profileOrMsOrConfig) {
  if (typeof profileOrMsOrConfig === 'number') {
    const ms = Math.max(0, profileOrMsOrConfig);
    return { min: ms, max: ms, jitter: 0, spike: 0 };
  }

  if (typeof profileOrMsOrConfig === 'object' && profileOrMsOrConfig !== null) {
    const {
      min = 200,
      max = 600,
      jitter = 0,
      spike = 1000,
    } = profileOrMsOrConfig;
    return { min, max, jitter, spike };
  }

  if (typeof profileOrMsOrConfig === 'string' && PROFILES[profileOrMsOrConfig]) {
    return PROFILES[profileOrMsOrConfig];
  }

  // Fallback default
  return PROFILES['3g-poor'];
}

/**
 * Compute a single randomized delay value from a resolved config.
 */
function computeDelay(config) {
  const { min, max, jitter, spike } = config;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  let delay = Math.floor(Math.random() * (hi - lo + 1)) + lo;

  if (jitter > 0 && Math.random() < jitter) {
    delay += spike;
  }

  return delay;
}

/**
 * cy.mockLatency(routeMatcher, profileOrMsOrConfig, options?)
 *
 * @param {string|RegExp|object} routeMatcher - Same matcher cy.intercept() accepts.
 * @param {string|number|object} [profileOrMsOrConfig='3g-poor'] - Preset name, fixed ms, or custom config.
 * @param {object} [options] - Extra options.
 * @param {string} [options.alias='latencyIntercept'] - Alias to assign to the intercept.
 * @param {boolean} [options.log=true] - Whether to log applied delays to the Cypress command log.
 */
Cypress.Commands.add(
  'mockLatency',
  (routeMatcher, profileOrMsOrConfig = '3g-poor', options = {}) => {
    const config = resolveConfig(profileOrMsOrConfig);
    const alias = options.alias || 'latencyIntercept';
    const shouldLog = options.log !== false;

    return cy
      .intercept(routeMatcher, (req) => {
        const delay = computeDelay(config);

        if (shouldLog) {
          Cypress.log({
            name: 'mockLatency',
            message: `${req.method} ${req.url} → ${delay}ms`,
            consoleProps: () => ({ config, delay, url: req.url, method: req.method }),
          });
        }

        req.on('response', (res) => {
          res.setDelay(delay);
        });
      })
      .as(alias);
  }
);

/**
 * cy.mockLatencyOffline(routeMatcher)
 * Convenience command that simulates a fully dropped / timed-out connection
 * by forcing an extreme delay. Useful for testing timeout & retry logic.
 */
Cypress.Commands.add('mockLatencyOffline', (routeMatcher, timeoutMs = 30000) => {
  return cy
    .intercept(routeMatcher, (req) => {
      req.on('response', (res) => {
        res.setDelay(timeoutMs);
      });
    })
    .as('offlineIntercept');
});

// Expose profiles + helpers for advanced use (e.g. custom assertions, debugging)
module.exports = { PROFILES, resolveConfig, computeDelay };
