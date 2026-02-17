
import { CognitoIdentityProviderClient, UpdateUserPoolClientCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const run = async () => {
  try {
    const command = new UpdateUserPoolClientCommand({
      UserPoolId: "us-east-1_7tq90ZnHR",
      ClientId: "7nvlt7h2h7k1mc182uh30vkhjn",
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

    const data = await client.send(command);
    console.log("Successfully updated User Pool Client:", JSON.stringify(data.UserPoolClient, null, 2));
  } catch (err) {
    console.error("Error updating User Pool Client:", err);
  }
};

run();
