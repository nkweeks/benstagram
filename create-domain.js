
import { CognitoIdentityProviderClient, CreateUserPoolDomainCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const run = async () => {
  try {
    const domainPrefix = "benstagram-auth-nathan";
    console.log(`Creating User Pool Domain: ${domainPrefix}...`);
    
    await client.send(new CreateUserPoolDomainCommand({
      UserPoolId: "us-east-1_7tq90ZnHR",
      Domain: domainPrefix
    }));
    
    console.log(`Successfully created domain: ${domainPrefix}`);
    console.log(`Full Auth Domain: https://${domainPrefix}.auth.us-east-1.amazoncognito.com`);

  } catch (err) {
    if (err.name === 'DomainDescriptionExistsException') {
       console.log("Domain already exists for this user pool. Skipping creation.");
    } else {
       console.error("Error creating domain:", err);
    }
  }
};

run();
