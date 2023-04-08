/// <reference types="cypress" />

describe('Server side rendering', () => {
  const indexUrl = '/';

  it('should render `app-progress` component', () => {
    cy.visit(indexUrl).get('.progress-wrapper').should('be.visible');
  });

  it('should click the button and the progress should be updated', () => {
    let resolve: VoidFunction;

    const progressCompleted = new Promise<void>(r => (resolve = r));

    cy.visit(indexUrl)
      .then(window => {
        window.addEventListener('progressCompleted', () => {
          resolve();
        });
      })
      .get('[data-cy=start-progress]')
      .click()
      .then(() => progressCompleted);

    cy.get('.progress').should('have.attr', 'style', 'width: 100%;');
  });
});
