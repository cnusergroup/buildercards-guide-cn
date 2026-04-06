#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BuilderCardsStack } from '../lib/stack';

const app = new cdk.App();

// Deploy to us-east-1 so ACM certificate and CloudFront are in the same region
// This avoids cross-region certificate issues
new BuilderCardsStack(app, 'BuilderCardsSite', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  domainName: 'buildercards.awscommunity.cn',
});
