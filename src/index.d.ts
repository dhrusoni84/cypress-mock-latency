/// <reference types="cypress" />

declare namespace CypressMockLatency {
  interface LatencyConfig {
    /** Minimum delay in ms */
    min?: number;
    /** Maximum delay in ms */
    max?: number;
    /** Probability (0–1) of an extra spike being added to the delay */
    jitter?: number;
    /** Extra ms added to the delay when a jitter spike occurs */
    spike?: number;
  }

  interface MockLatencyOptions {
    /** Alias assigned to the underlying intercept (default: 'latencyIntercept') */
    alias?: string;
    /** Whether to print the applied delay to the Cypress command log (default: true) */
    log?: boolean;
  }

  type NetworkProfile = '3g-poor' | '3g-good' | '4g-congested' | 'satellite' | 'offline-flaky';
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Simulates real-world network latency and jitter on requests matching the given route.
     *
     * @param routeMatcher - Same matcher accepted by cy.intercept()
     * @param profileOrMsOrConfig - A named preset, a fixed delay in ms, or a custom config object. Defaults to '3g-poor'.
     * @param options - Optional alias/logging overrides.
     *
     * @example
     * cy.mockLatency('/api/checkout', '3g-poor')
     *
     * @example
     * cy.mockLatency('/api/search', 250)
     *
     * @example
     * cy.mockLatency('/api/orders', { min: 300, max: 900, jitter: 0.25, spike: 2000 })
     */
    mockLatency(
      routeMatcher: string | RegExp | Partial<Cypress.RouteMatcher>,
      profileOrMsOrConfig?: CypressMockLatency.NetworkProfile | number | CypressMockLatency.LatencyConfig,
      options?: CypressMockLatency.MockLatencyOptions
    ): Chainable<null>;

    /**
     * Simulates a dropped/timed-out connection by delaying the response
     * far beyond normal thresholds. Useful for testing timeout and retry UX.
     *
     * @param routeMatcher - Same matcher accepted by cy.intercept()
     * @param timeoutMs - Delay to apply, in ms (default: 30000)
     *
     * @example
     * cy.mockLatencyOffline('/api/payments')
     */
    mockLatencyOffline(
      routeMatcher: string | RegExp | Partial<Cypress.RouteMatcher>,
      timeoutMs?: number
    ): Chainable<null>;
  }
}
