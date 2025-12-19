import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Get the current AWS region
const region = aws.getRegionOutput();

// Create a VPC for our application
const vpc = new awsx.ec2.Vpc("hello-world-vpc", {
    enableDnsHostnames: true,
    enableDnsSupport: true,
    cidrBlock: "10.0.0.0/16",
});

// Create an ECR repository for our container image
const repo = new awsx.ecr.Repository("hello-world-repo", {
    forceDelete: true,
});

// For now, use a simple nginx image to test deployment
// TODO: Build and push custom image separately
const imageUri = "nginx:latest";

// Create an ECS cluster
const cluster = new aws.ecs.Cluster("hello-world-cluster", {
    name: "hello-world-cluster",
});

// Create an Application Load Balancer
const alb = new aws.lb.LoadBalancer("hello-world-alb", {
    loadBalancerType: "application",
    subnets: vpc.publicSubnetIds,
    securityGroups: [vpc.vpc.defaultSecurityGroupId],
});

// Create a target group for the ALB
const targetGroup = new aws.lb.TargetGroup("hello-world-tg", {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.vpcId,
    healthCheck: {
        enabled: true,
        healthyThreshold: 2,
        interval: 30,
        matcher: "200",
        path: "/",
        port: "traffic-port",
        protocol: "HTTP",
        timeout: 5,
        unhealthyThreshold: 2,
    },
});

// Create a listener for the ALB
const listener = new aws.lb.Listener("hello-world-listener", {
    loadBalancerArn: alb.arn,
    port: 80,
    protocol: "HTTP",
    defaultActions: [{
        type: "forward",
        targetGroupArn: targetGroup.arn,
    }],
});

// Create an ECS task definition
const taskDefinition = new awsx.ecs.FargateTaskDefinition("hello-world-task", {
    container: {
        name: "hello-world-container",
        image: imageUri,
        memory: 512,
        cpu: 256,
        essential: true,
        portMappings: [{
            containerPort: 80,
            hostPort: 80,
            protocol: "tcp",
        }],
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-group": "/ecs/hello-world",
                "awslogs-region": region.name,
                "awslogs-stream-prefix": "ecs",
            },
        },
    },
});

// Create CloudWatch log group
const logGroup = new aws.cloudwatch.LogGroup("hello-world-logs", {
    name: "/ecs/hello-world",
    retentionInDays: 7,
});

// Create an ECS service
const service = new awsx.ecs.FargateService("hello-world-service", {
    cluster: cluster.arn,
    taskDefinition: taskDefinition.taskDefinition.arn,
    desiredCount: 1,
    networkConfiguration: {
        subnets: vpc.publicSubnetIds,
        securityGroups: [vpc.vpc.defaultSecurityGroupId],
        assignPublicIp: true,
    },
    loadBalancers: [{
        targetGroupArn: targetGroup.arn,
        containerName: "hello-world-container",
        containerPort: 80,
    }],
}, {
    dependsOn: [listener],
});

// Export the ALB URL
export const url = pulumi.interpolate`http://${alb.dnsName}`;
export const repositoryUrl = repo.url;
