# cypress-mock-latency

Easily simulate real-world, unstable network conditions — latency, jitter, and dropped connections — in your Cypress tests.

Cypress's built-in `cy.intercept()` lets you delay a response, but it doesn't give you randomized ranges, named network presets, or sporadic "jitter" spikes out of the box. This plugin adds a single, intuitive command that does.

## Installation

```bash
npm install cypress-mock-latency --save-dev
```

## Setup

Add this single line to your `cypress/support/e2e.js` (or `e2e.ts`):

```javascript
import 'cypress-mock-latency';
```

## Usage

### Named network presets

```javascript
describe('E-commerce Checkout Flakiness', () => {
  it('should display a loading spinner under poor 3G networks', () => {
    cy.mockLatency('/api/checkout', '3g-poor');

    cy.get('#pay-button').click();
    cy.get('.spinner').should('be.visible');
  });
});
```

Available presets:

| Preset            | Delay range     | Jitter chance | Spike  |
|-------------------|-----------------|----------------|--------|
| `3g-poor`         | 400–1200 ms     | 20%            | +1500ms|
| `3g-good`         | 150–500 ms      | 10%            | +800ms |
| `4g-congested`    | 150–450 ms      | 10%            | +1000ms|
| `satellite`       | 600–2000 ms     | 30%            | +2000ms|
| `offline-flaky`   | 2000–5000 ms    | 50%            | +3000ms|

### Fixed delay

```javascript
cy.mockLatency('/api/search', 250); // always 250ms
```

### Custom config

```javascript
cy.mockLatency('/api/orders', {
  min: 300,
  max: 900,
  jitter: 0.25, // 25% chance of a spike
  spike: 2000,  // +2000ms when a spike occurs
});
```

### Simulating a dropped connection

```javascript
cy.mockLatencyOffline('/api/payments'); // delays response by 30s (default)
cy.mockLatencyOffline('/api/payments', 60000); // custom timeout
```

### Options

```javascript
cy.mockLatency('/api/checkout', '3g-poor', {
  alias: 'checkoutLatency', // defaults to 'latencyIntercept'
  log: false,               // disable Cypress command-log entries
});

cy.wait('@checkoutLatency');
```

## Why this exists

Manually calculating randomized delay ranges and jitter spikes on top of `cy.intercept()` is repetitive boilerplate. `cypress-mock-latency` wraps that logic in one memorable command with sensible, realistic presets, so tests that need to prove your UI handles slow or flaky networks gracefully take one line instead of ten.

## Contributing

Issues and PRs welcome. If you'd like to add a new network preset, open a PR adding it to the `PROFILES` object in `src/commands.js` along with a short justification for the numbers chosen.

## License

MIT
