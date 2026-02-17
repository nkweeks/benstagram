
import { CognitoIdentityProviderClient, DescribeUserPoolClientCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

const run = async () => {
  try {
    const data = await client.send(new DescribeUserPoolClientCommand({
      UserPoolId: "us-east-1_7tq90ZnHR",
      ClientId: "7nvlt7h2h7k1mc182uh30vkhjn"
    }));
    console.log(JSON.stringify(data.UserPoolClient, null, 2));
  } catch (err) {
    console.error(err);
  }
};

run();
