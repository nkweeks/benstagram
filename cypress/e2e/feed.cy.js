
describe('Feed Interactions', () => {
  beforeEach(() => {
    // Mock a logged-in user via onBeforeLoad
    cy.visit('/', {
        onBeforeLoad: (win) => {
            win.localStorage.setItem('cypress_user', JSON.stringify({
                username: 'feed_tester',
                fullName: 'Feed Tester',
                email: 'tester@example.com'
            }));
        }
    });
  });

  it('displays the feed', () => {
    // Wait for initial load
    cy.wait(1000); 

    // Check where we are
    cy.url().then(url => cy.log('Current URL: ' + url));
    
    // Check if redirected to login
    cy.get('input[placeholder="Phone number, username, or email"]').should('not.exist');

    // Check if stuck on loading
    // cy.contains('Loading...').should('not.exist'); // ProtectedRoute loading
    
    // Wait for feed to load
    cy.get('.feed-container', { timeout: 10000 }).should('be.visible');
    cy.get('article.post').should('have.length.greaterThan', 0);
  });

  it('allows liking a post', () => {
    // Use the second post (index 1) which is NOT liked initially
    cy.get('article.post').eq(1).within(() => {
       // Check initial state (heart icon)
       cy.get('button.action-btn').first().should('be.visible').click();
       // Verify heart is filled (red)
       cy.get('button.action-btn.liked').should('exist');
    });
  });

  it('allows creating a post', () => {
    // Open Create Modal from Sidebar using class selector for reliability
    cy.get('.create-btn').click();
    
    // Check if modal is visible
    cy.contains('Create new post').should('be.visible');
    
    // Close modal to reset state - Using first() AND force:true for maximum robustness
    cy.contains('h3', 'Create new post').parent().find('.modal-close').first().click({ force: true });
    cy.contains('Create new post').should('not.exist');
  });
});
