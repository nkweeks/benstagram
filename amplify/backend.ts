import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

// Configure Custom Domain for Cognito Hosted UI
// Only apply the custom domain to the production 'main' branch
// to prevent "Domain already associated" collisions with 'staging'
if (process.env.AWS_BRANCH === 'main') {
  backend.auth.resources.userPool.addDomain('CustomDomain', {
    customDomain: {
      domainName: 'auth.benstagram.net',
      certificate: Certificate.fromCertificateArn(
        backend.auth.resources.userPool,
        'BenstagramAuthCert',
        'arn:aws:acm:us-east-1:951282861149:certificate/3e8c05a8-5274-4f8c-9e17-eed9f409d596'
      )
    }
  });
}
