const aws = require("aws-sdk");
const ddb = new aws.DynamoDB();

const tableName = process.env.USERTABLE;

exports.handler = async (event) => {
  // event event.request.userAttributes.(sub, email)
  // insert code to be executed by your lambda trigger

  if (!event?.request?.userAttributes?.sub){
    console.log("No sub provided");
    return;
  }

  const now = new Date();
  const timestamp = now.getTime();

  const userItem = {
    __typename: { S: 'User' },
    _lastChangedAt: { N: timestamp.toString() },
    _version: { N: "1" },
    createdAt: { S: now.toISOString() },
    updatedAt: { S: now.toISOString() },
    id: { S: event.request.userAttributes.sub },
    name: { S: event.request.userAttributes.email.split('@')[0] },
    status: { S: "Hi, I'm "+event.request.userAttributes.email.split('@')[0]},
    imageUri: { S: "https://talkjob-app-bucket164426-staging.s3.us-east-2.amazonaws.com/default-user-image.png"},
    email: { S: event.request.userAttributes.email},
    phone: { S: event.request.userAttributes.phone_number},
    friends: { L: []}
  }
  
  const params = {
    Item: userItem,
    TableName: tableName
  };
  
  // save a new user to DynamoDB
  try {
    await ddb.putItem(params).promise();
    console.log("success");
  } catch (e) {
    console.log(e)
  }
};
