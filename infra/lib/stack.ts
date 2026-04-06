import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import * as path from 'path';

interface BuilderCardsStackProps extends cdk.StackProps {
  domainName: string;
}

export class BuilderCardsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BuilderCardsStackProps) {
    super(scope, id, props);

    const { domainName } = props;

    // S3 bucket — private, no public access
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: domainName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ACM certificate in us-east-1 (required for CloudFront)
    // After deploy, manually add the CNAME validation record in Alibaba Cloud DNS
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(), // No hosted zone — manual DNS validation
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      domainNames: [domainName],
      certificate,
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    // Deploy site content to S3 + invalidate CloudFront cache
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../'), {
        exclude: ['infra', 'infra/**', '.vscode', '.vscode/**', '.git', '.git/**', 'node_modules', 'node_modules/**', '.kiro', '.kiro/**', 'cdk.out', 'cdk.out/**'],
        ignoreMode: cdk.IgnoreMode.GLOB,
      })],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${domainName}`,
    });
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'Add CNAME record in Alibaba Cloud DNS: buildercards -> this value',
    });
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
    });
  }
}
