
import { CognitoIdentityProviderClient, DescribeUserPoolCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const run = async () => {
  try {
    const data = await client.send(new DescribeUserPoolCommand({
      UserPoolId: "us-east-1_7tq90ZnHR"
    }));
    
    console.log("User Pool Domain:", data.UserPool.Domain);
    console.log("Custom Domain:", data.UserPool.CustomDomain);
    console.log("Full User Pool Data (Partial):", JSON.stringify({
      Domain: data.UserPool.Domain,
      CustomDomain: data.UserPool.CustomDomain
    }, null, 2));

  } catch (err) {
    console.error("Error describing user pool:", err);
  }
};

run();
