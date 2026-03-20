import { DynamoDBClient, ScanCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputsPath = path.join(__dirname, '..', 'amplify_outputs.json');
const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });

async function check() {
  const listTablesCmd = new ListTablesCommand({});
  const tablesResponse = await ddbClient.send(listTablesCmd);
  const table = tablesResponse.TableNames.find(t => t.includes('UserProfile'));
  const res = await ddbClient.send(new ScanCommand({ TableName: table }));
  console.log(JSON.stringify(res.Items, null, 2));
}
check();
