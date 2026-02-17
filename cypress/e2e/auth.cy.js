
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear local storage to ensure fresh state
    cy.clearLocalStorage();
  });

  it('redirects unauthenticated users to login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('allows user to sign up', () => {
    cy.visit('/signup');
    
    // Check for "Are you a Ben?" modal (it appears immediately on mount)
    cy.contains('Is your name Ben?').should('be.visible');
    cy.get('.ben-btn.yes').click();
    
    // Fill out the form
    cy.get('input[type="email"]').type('testben@example.com');
    cy.get('input[placeholder="Full Name"]').type('Test Ben');
    cy.get('input[placeholder="Username"]').type('test_ben_123');
    cy.get('input[type="password"]').type('password123');
    
    // Click Sign Up
    cy.get('button.login-btn').click();

    // Verify loading state or error
    cy.get('button.login-btn').should('contain', 'Signing up...');
  });

  it('allows existing user to login', () => {
      // Seed local storage BEFORE page load
      cy.visit('/login', {
        onBeforeLoad: (win) => {
            win.localStorage.setItem('cypress_user', JSON.stringify({
                username: 'existing_ben',
                fullName: 'Existing Ben',
                email: 'ben@example.com'
            }));
        }
      });

      // Visiting /login with a logged-in user should redirect to /
      cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('allows user to logout', () => {
      // Seed user
      cy.visit('/', {
        onBeforeLoad: (win) => {
            win.localStorage.setItem('cypress_user', JSON.stringify({
                username: 'logout_ben',
                fullName: 'Logout Ben'
            }));
        }
      });
      
      // Open More Menu
      cy.get('.sidebar-footer button').last().click(); 
      
      // Click Logout
      cy.contains('Log Out').click();

      // Verify redirect
      cy.url().should('include', '/login');
  });
});
