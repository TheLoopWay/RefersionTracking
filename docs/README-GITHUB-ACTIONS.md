# GitHub Actions for Refersion Integration Testing

This repository includes automated testing via GitHub Actions to ensure the Refersion integration continues working correctly on TheLoopWay.com.

## Available Workflows

### 1. Simple Test (`simple-test.yml`)
A straightforward workflow that runs on every push and pull request:
- Runs the quick connectivity test
- Runs the full browser test
- Uploads screenshots for review

### 2. Comprehensive Test (`test-integration.yml`)
A more detailed workflow with:
- Scheduled daily runs
- Manual trigger options
- Separate quick and browser test jobs
- Automatic issue creation on failures

## Running Tests Manually

You can manually trigger tests from the GitHub Actions tab:

1. Go to the "Actions" tab in your repository
2. Select "Test Integration" workflow
3. Click "Run workflow"
4. Choose the branch and test type

## Test Results

After each run:
- Check the workflow summary for pass/fail status
- Download screenshots from the artifacts section
- Review any created issues for persistent failures

## Workflow Features

### Scheduled Runs
The comprehensive workflow runs daily at 8 AM UTC to catch any breaking changes to TheLoopWay.com or HubSpot forms.

### Artifact Storage
- Screenshots are saved for 30 days
- Test logs are available in the workflow output
- Failed test artifacts help with debugging

### Notifications
The comprehensive workflow can create GitHub issues when tests fail consistently.

## Customization

To modify the test schedule, edit the cron expression in `.github/workflows/test-integration.yml`:
```yaml
schedule:
  - cron: '0 8 * * *'  # Daily at 8 AM UTC
```

To change which branches trigger tests:
```yaml
on:
  push:
    branches: [ main, develop, staging ]
```