import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Get the current AWS region
const region = aws.getRegionOutput();

// Create IAM role for Lambda function
const lambdaRole = new aws.iam.Role("hello-world-lambda-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});

// Attach basic execution policy to Lambda role
const lambdaRolePolicy = new aws.iam.RolePolicyAttachment("hello-world-lambda-policy", {
    role: lambdaRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// Create Lambda function
const lambdaFunction = new aws.lambda.Function("hello-world-lambda", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../dist"),
    }),
    runtime: "nodejs20.x",
    handler: "index.handler",
    role: lambdaRole.arn,
    timeout: 30,
    memorySize: 128,
    description: "Hello World Lambda function with TypeScript",
}, {
    dependsOn: [lambdaRolePolicy],
});

// Create API Gateway REST API
const api = new aws.apigateway.RestApi("hello-world-api", {
    description: "Hello World API Gateway",
    endpointConfiguration: {
        types: "REGIONAL",
    },
});

// Create API Gateway resource for proxy (catch-all)
const proxyResource = new aws.apigateway.Resource("hello-world-proxy", {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: "{proxy+}",
});

// Create API Gateway method for root path
const rootMethod = new aws.apigateway.Method("hello-world-root-method", {
    restApi: api.id,
    resourceId: api.rootResourceId,
    httpMethod: "ANY",
    authorization: "NONE",
});

// Create API Gateway method for proxy path
const proxyMethod = new aws.apigateway.Method("hello-world-proxy-method", {
    restApi: api.id,
    resourceId: proxyResource.id,
    httpMethod: "ANY",
    authorization: "NONE",
});

// Create Lambda integration for root path
const rootIntegration = new aws.apigateway.Integration("hello-world-root-integration", {
    restApi: api.id,
    resourceId: api.rootResourceId,
    httpMethod: rootMethod.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambdaFunction.invokeArn,
});

// Create Lambda integration for proxy path
const proxyIntegration = new aws.apigateway.Integration("hello-world-proxy-integration", {
    restApi: api.id,
    resourceId: proxyResource.id,
    httpMethod: proxyMethod.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambdaFunction.invokeArn,
});

// Create API Gateway deployment
const deployment = new aws.apigateway.Deployment("hello-world-deployment", {
    restApi: api.id,
}, {
    dependsOn: [rootIntegration, proxyIntegration],
});

// Create API Gateway stage
const stage = new aws.apigateway.Stage("hello-world-stage", {
    deployment: deployment.id,
    restApi: api.id,
    stageName: "prod",
});

// Grant API Gateway permission to invoke Lambda
const lambdaPermission = new aws.lambda.Permission("hello-world-lambda-permission", {
    statementId: "AllowExecutionFromAPIGateway",
    action: "lambda:InvokeFunction",
    function: lambdaFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

// Export the API Gateway URL
export const invokeUrl = pulumi.interpolate`https://${api.id}.execute-api.${region.name}.amazonaws.com/${stage.stageName}`;
export const lambdaFunctionName = lambdaFunction.name;
export const apiId = api.id;
