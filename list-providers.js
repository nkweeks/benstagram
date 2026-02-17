
import { CognitoIdentityProviderClient, ListIdentityProvidersCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const run = async () => {
  try {
    const data = await client.send(new ListIdentityProvidersCommand({
      UserPoolId: "us-east-1_7tq90ZnHR"
    }));
    console.log("Identity Providers:", JSON.stringify(data.Providers, null, 2));
  } catch (err) {
    console.error("Error listing identity providers:", err);
  }
};

run();
