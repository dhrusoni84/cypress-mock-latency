describe('cy.mockLatency', () => {
  beforeEach(() => {
    // Base stub: what /api/checkout would normally return.
    // Registered first, so mockLatency's intercept (registered after)
    // can add delay and then fall through to this response.
    cy.intercept('GET', '/api/checkout', {
      statusCode: 200,
      body: { status: 'success' },
    });
  });

  it('delays the response by roughly the configured fixed amount', () => {
    cy.mockLatency('/api/checkout', 500); // fixed 500ms delay, no jitter

    cy.visit('/');

    const clickedAt = Date.now();
    cy.get('#pay-button').click();

    // Spinner should be visible immediately while the request is in flight.
    cy.get('#spinner').should('be.visible');

    // Once the result renders, confirm at least ~500ms actually elapsed.
    cy.get('#result', { timeout: 4000 })
      .should('contain.text', 'success')
      .then(() => {
        expect(Date.now() - clickedAt).to.be.greaterThan(450);
      });

    cy.get('#spinner').should('not.be.visible');
  });

  it('applies a named network profile (3g-poor) without breaking the response', () => {
    cy.mockLatency('/api/checkout', '3g-poor');

    cy.visit('/');
    cy.get('#pay-button').click();

    cy.get('#spinner').should('be.visible');
    cy.get('#result', { timeout: 6000 }).should('contain.text', 'success');
    cy.get('#spinner').should('not.be.visible');
  });

  it('supports a custom config object', () => {
    cy.mockLatency('/api/checkout', { min: 200, max: 300, jitter: 0 });

    cy.visit('/');
    cy.get('#pay-button').click();

    cy.get('#spinner').should('be.visible');
    cy.get('#result', { timeout: 4000 }).should('contain.text', 'success');
  });
});

describe('cy.mockLatencyOffline', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/checkout', {
      statusCode: 200,
      body: { status: 'success' },
    });
  });

  it('keeps the spinner visible while the connection is simulated as dropped', () => {
    // Short timeout so the test itself stays fast; real usage would use
    // a longer value to genuinely exercise timeout/retry UX.
    cy.mockLatencyOffline('/api/checkout', 2000);

    cy.visit('/');
    cy.get('#pay-button').click();

    cy.get('#spinner').should('be.visible');
    // Confirm it is still spinning well before the simulated delay resolves.
    cy.wait(500);
    cy.get('#spinner').should('be.visible');
  });
});
