
import { 
  CognitoIdentityProviderClient, 
  CreateIdentityProviderCommand, 
  UpdateUserPoolClientCommand 
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const userPoolId = "us-east-1_7tq90ZnHR";
const clientId = "7nvlt7h2h7k1mc182uh30vkhjn";

const googleClientId = "1056235745845-d4t3ucjevji574csuvp8oqjc6rapvcq9.apps.googleusercontent.com";
const googleClientSecret = "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";

const run = async () => {
  try {
    // 1. Create Google Identity Provider
    console.log("Creating Google Identity Provider...");
    try {
      await client.send(new CreateIdentityProviderCommand({
        UserPoolId: userPoolId,
        ProviderName: "Google",
        ProviderType: "Google",
        ProviderDetails: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
          authorize_scopes: "profile email openid"
        },
        AttributeMapping: {
          email: "email",
          username: "sub", // flexible mapping
        }
      }));
      console.log("Google Identity Provider created successfully.");
    } catch (err) {
      if (err.name === 'DuplicateProviderException') {
        console.log("Google Identity Provider already exists. Skipping creation.");
      } else {
        throw err;
      }
    }

    // 2. Update User Pool Client
    console.log("Updating User Pool Client...");
    const updateCommand = new UpdateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      SupportedIdentityProviders: ["COGNITO", "Google"],
      CallbackURLs: [
        "http://localhost:3333/profile",
        "https://benstagram.net/profile"
      ],
      LogoutURLs: [
        "http://localhost:3333",
        "https://benstagram.net"
      ],
      AllowedOAuthFlows: ["code"],
      AllowedOAuthScopes: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
      AllowedOAuthFlowsUserPoolClient: true
    });

    const data = await client.send(updateCommand);
    console.log("Successfully updated User Pool Client:", JSON.stringify(data.UserPoolClient, null, 2));

  } catch (err) {
    console.error("Error configuring Google Auth:", err);
  }
};

run();
