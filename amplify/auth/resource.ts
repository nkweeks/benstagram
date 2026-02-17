import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // externalProviders: {
    //   google: {
    //     clientId: 'MOCK_CLIENT_ID', // Replaced with real secrets in production
    //     clientSecret: 'MOCK_CLIENT_SECRET', 
    //     scopes: ['email', 'profile'],
    //   },
    //   callbackUrls: [
    //     'http://localhost:3333/profile',
    //     'https://benstagram.net/profile'
    //   ],
    //   logoutUrls: [
    //     'http://localhost:3333', 
    //     'https://benstagram.net'
    //   ],
    // }
  },
});
