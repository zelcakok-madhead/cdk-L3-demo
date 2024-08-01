import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from '@aws-solutions-constructs/aws-apigateway-lambda';

// Construct Hub
// https://constructs.dev/packages/@aws-solutions-constructs/aws-apigateway-lambda/v/2.61.0?lang=typescript

export class L3DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an API Gateway with a Lambda function as the backend
    const apiGatewayToLambda = new apigateway.ApiGatewayToLambda(this, 'ApiGatewayToLambda', {
      lambdaFunctionProps: {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromAsset('lambda'),
        environment: {
          EXAMPLE_ENV_VAR: 'example-value',
        },
      },
      apiGatewayProps: {
        defaultCorsPreflightOptions: {
          allowOrigins: ['*'],
          allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        defaultMethodOptions: {
          authorizationType: cdk.aws_apigateway.AuthorizationType.NONE,
        },
      },
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: apiGatewayToLambda.apiGateway.url!,
      description: 'The URL of the API Gateway',
    });
  }
}
