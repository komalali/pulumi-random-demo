# Pulumi Random Demo

A simple Pulumi program that uses the random provider to create a random string.

## Project Structure

- `index.js` - Main Pulumi program that creates a random string
- `Pulumi.yaml` - Pulumi project configuration
- `package.json` - Node.js dependencies
- `.github/workflows/` - GitHub Actions workflows

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Pulumi:
   ```bash
   pulumi login https://api-kokomo.review-stacks.pulumi-dev.io/
   pulumi stack init dev
   ```

3. Run locally:
   ```bash
   pulumi preview  # Preview changes
   pulumi up       # Deploy changes
   ```

## GitHub Actions Workflows

This project includes two workflows:

### PR Preview (`pr-preview.yml`)
- Triggers on pull requests against the `main` branch
- Runs `pulumi preview` to show what changes would be made
- Uses the custom Pulumi backend at `https://api-kokomo.review-stacks.pulumi-dev.io/`
- Requires `PULUMI_ACCESS_TOKEN` secret to be set in the repository

### Deploy (`deploy.yml`)
- Triggers when PRs are merged to `main`
- Runs `pulumi up` to deploy changes
- Uses the custom Pulumi backend at `https://api-kokomo.review-stacks.pulumi-dev.io/`
- Requires `PULUMI_ACCESS_TOKEN` secret to be set in the repository

## Required Secrets

Add the following secret to your GitHub repository:
- `PULUMI_ACCESS_TOKEN` - Your Pulumi access token from https://api-kokomo.review-stacks.pulumi-dev.io/

## What This Program Does

The program creates a single random string resource with the following properties:
- Length: 16 characters
- Includes special characters, uppercase, lowercase, and numbers
- The random string value is exported as `randomStringValue`
