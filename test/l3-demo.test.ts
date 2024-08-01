import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as L3Demo from '../lib/l3-demo-stack';

describe('L3DemoStack', () => {
    let app: cdk.App;
    let stack: L3Demo.L3DemoStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new L3Demo.L3DemoStack(app, 'MyTestStack');
        template = Template.fromStack(stack);
    });

    test('Lambda Function Created', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
        });
    });

    test('API Gateway Created', () => {
        template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    test('Lambda Function Has Environment Variable', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Environment: {
                Variables: {
                    EXAMPLE_ENV_VAR: 'example-value',
                },
            },
        });
    });

    test('API Gateway Has CORS Configuration', () => {
        const expectedHeaders = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'";
        const expectedMethods = "GET,POST,PUT,DELETE";
        const expectedOrigin = "'*'";

        template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'OPTIONS',
            ResourceId: {
                Ref: Match.stringLikeRegexp('ApiGatewayToLambda')
            },
            Integration: {
                IntegrationResponses: Match.arrayWith([
                    Match.objectLike({
                        ResponseParameters: {
                            'method.response.header.Access-Control-Allow-Headers': Match.exact(expectedHeaders),
                            'method.response.header.Access-Control-Allow-Methods': Match.stringLikeRegexp(expectedMethods),
                            'method.response.header.Access-Control-Allow-Origin': Match.exact(expectedOrigin),
                        }
                    })
                ])
            }
        });
    });

    test('API Gateway URL Output Created', () => {
        template.hasOutput('APIGatewayURL', {
            Description: 'The URL of the API Gateway',
        });
    });
});