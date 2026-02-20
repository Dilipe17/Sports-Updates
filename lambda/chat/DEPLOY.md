# Deploy Sports Chat Lambda

## Prerequisites
- AWS CLI configured (`aws configure`)
- Bedrock access enabled in your AWS account for `anthropic.claude-3-haiku-20240307-v1:0`

## Steps

### 1. Install dependencies and package
```bash
cd lambda/chat
npm install
zip -r function.zip .
```

### 2. Create an IAM role for Lambda
```bash
aws iam create-role \
  --role-name SportsChatLambdaRole \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"lambda.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

# Attach basic Lambda execution + Bedrock invoke permissions
aws iam attach-role-policy \
  --role-name SportsChatLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam put-role-policy \
  --role-name SportsChatLambdaRole \
  --policy-name BedrockInvoke \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":"bedrock:InvokeModel",
      "Resource":"arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku*"
    }]
  }'
```

### 3. Create the Lambda function
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws lambda create-function \
  --function-name SportsChatHandler \
  --runtime nodejs20.x \
  --role arn:aws:iam::${ACCOUNT_ID}:role/SportsChatLambdaRole \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256
```

### 4. Create API Gateway (HTTP API – cheapest option)
```bash
API_ID=$(aws apigatewayv2 create-api \
  --name SportsChatAPI \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins='*',AllowMethods='POST,OPTIONS',AllowHeaders='Content-Type' \
  --query ApiId --output text)

INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:${ACCOUNT_ID}:function:SportsChatHandler \
  --payload-format-version 2.0 \
  --query IntegrationId --output text)

aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /chat" \
  --target integrations/$INTEGRATION_ID

aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy

# Allow API Gateway to invoke Lambda
aws lambda add-permission \
  --function-name SportsChatHandler \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:${ACCOUNT_ID}:${API_ID}/*"

echo "Your chat endpoint: https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/chat"
```

### 5. Update the mobile app
Replace `YOUR_API_GATEWAY_URL` in `shared/api.js` with the URL printed above:
```js
const CHAT_API_URL = 'https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/prod/chat';
```

## Cost estimate (Claude 3 Haiku)
| Usage | Approximate monthly cost |
|---|---|
| 100 chats/day | ~$0.05–$0.10 |
| 1,000 chats/day | ~$0.50–$1.00 |
| Lambda + API Gateway | ~$0 (within free tier) |
