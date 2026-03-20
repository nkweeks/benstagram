import { CognitoIdentityProviderClient, ListUsersCommand, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
// Need Dynamodb client, we can install it if it's missing, but it is part of aws-sdk
import { DynamoDBClient, ListTablesCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputsPath = path.join(__dirname, '..', 'amplify_outputs.json');
const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));

const region = outputs.auth.aws_region;
const userPoolId = outputs.auth.user_pool_id;

const cognitoClient = new CognitoIdentityProviderClient({ region });
const ddbClient = new DynamoDBClient({ region });

async function clearUsers() {
    try {
        console.log("=== Phase 1: Deleting Cognito Users ===");
        const listCmd = new ListUsersCommand({ UserPoolId: userPoolId });
        const { Users } = await cognitoClient.send(listCmd);
        
        if (Users && Users.length > 0) {
            console.log(`Found ${Users.length} users in Cognito.`);
            for (const user of Users) {
                console.log(` Deleting ${user.Username}...`);
                await cognitoClient.send(new AdminDeleteUserCommand({
                    UserPoolId: userPoolId,
                    Username: user.Username
                }));
            }
            console.log("✅ Cognito users deleted.\n");
        } else {
            console.log("✅ No users found in Cognito.\n");
        }

        console.log("=== Phase 2: Deleting UserProfiles from DynamoDB ===");
        const listTablesCmd = new ListTablesCommand({});
        const tablesResponse = await ddbClient.send(listTablesCmd);
        
        // Find the UserProfile table for this environment
        const tableName = tablesResponse.TableNames.find(t => t.includes('UserProfile'));
        
        if (!tableName) {
            console.log("⚠️ Could not find a UserProfile table in DynamoDB!");
            return;
        }
        
        console.log(`Found table: ${tableName}`);
        
        // Scan for all items
        const scanCmd = new ScanCommand({ TableName: tableName });
        const scanResponse = await ddbClient.send(scanCmd);
        
        if (scanResponse.Items && scanResponse.Items.length > 0) {
            console.log(`Found ${scanResponse.Items.length} UserProfiles.`);
            for (const item of scanResponse.Items) {
                // The primary key for UserProfile is 'id' based on the schema
                const id = item.id.S;
                console.log(` Deleting profile with ID: ${id}...`);
                
                await ddbClient.send(new DeleteItemCommand({
                    TableName: tableName,
                    Key: {
                        id: { S: id }
                    }
                }));
            }
            console.log("✅ UserProfiles deleted.\n");
        } else {
            console.log("✅ No UserProfiles found in DynamoDB.\n");
        }

        console.log("🎉 Complete: All user accounts and profiles have been deleted.");
    } catch (e) {
        console.error("❌ Error occurred:", e);
    }
}

clearUsers();
