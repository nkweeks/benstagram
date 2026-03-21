import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

try {
    const isLocalhost = window.location.hostname === 'localhost';
    const isProdEnv = window.location.hostname === 'thebenapp.com' || window.location.hostname === 'www.thebenapp.com';
    
    // Deep copy to safely mutate the imported Amplify configuration JSON
    const amplifyConfig = JSON.parse(JSON.stringify(outputs));

    if (amplifyConfig.auth && amplifyConfig.auth.oauth) {
        // Enforce the custom domain on production
        amplifyConfig.auth.oauth.domain = isProdEnv 
            ? 'auth.thebenapp.com' 
            : (outputs.auth?.oauth?.domain || 'thebenapp-auth-nathan.auth.us-east-1.amazoncognito.com');
            
        // Gen 2 strictly expects arrays for redirect URIs and must exactly match the trailing slash
        amplifyConfig.auth.oauth.redirect_sign_in_uri = isLocalhost 
            ? ['http://localhost:3333/profile/'] 
            : ['https://thebenapp.com/profile/'];
            
        amplifyConfig.auth.oauth.redirect_sign_out_uri = isLocalhost 
            ? ['http://localhost:3333'] 
            : ['https://thebenapp.com'];
    }
    
    Amplify.configure(amplifyConfig);
} catch (e) {
    console.error("Amplify configure failed:", e);
}
