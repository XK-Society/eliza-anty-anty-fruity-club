# Anty Fruity Club AVS Task Validator Plugin

A plugin for Eliza that provides integration with the Anty Fruity Club AVS validation service, allowing agents to validate cryptocurrency volatility task results.

## Overview

This plugin connects to the Validation_Service of the Anty Fruity Club AVS system to:

- Validate cryptocurrency volatility tasks
- Check task data against current volatility measurements
- Verify IPFS-stored task results
- Provide detailed validation feedback to users

## Installation

```bash
npm install plugin-avs-task-validator
```

## Configuration

The plugin requires the following configuration value:

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| TASK_VALIDATOR_API_URL | The base URL of the AVS validation service | No | http://localhost:4003 |

### Setting up configuration

Add the configuration to your Eliza agent:

```typescript
// In your agent configuration
{
  settings: {
    TASK_VALIDATOR_API_URL: "http://localhost:4003"  // or your custom URL
  }
}
```

## Usage

Import and register the plugin with your Eliza agent:

```typescript
import { avsTaskValidatorPlugin } from 'plugin-avs-task-validator';

// Register with your agent
agent.registerPlugin(avsTaskValidatorPlugin);
```

## Available Actions

The plugin provides the following action:

### Validate Task (`VALIDATE_TASK`)

Validates a cryptocurrency volatility task.

```typescript
// Example action invocation with just a task ID
{
  action: "VALIDATE_TASK",
  actionParams: {
    taskId: "12345"
  }
}

// Example action invocation with task ID and crypto symbol
{
  action: "VALIDATE_TASK",
  actionParams: {
    taskId: "67890",
    cryptoSymbol: "BTC"
  }
}

// Example action invocation with IPFS hash
{
  action: "VALIDATE_TASK",
  actionParams: {
    taskId: "ABC123",
    cryptoSymbol: "ETH",
    ipfsHash: "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"
  }
}

// Example action invocation with task data
{
  action: "VALIDATE_TASK",
  actionParams: {
    taskId: "DEF456",
    cryptoSymbol: "SOL",
    taskData: {
      volatility: 0.0234,
      timestamp: 1709183458,
      cryptoSymbol: "SOL"
    }
  }
}
```

#### Parameters

- `taskId` (required): The ID of the task to validate
- `cryptoSymbol` (optional): The cryptocurrency symbol (e.g., BTC, ETH, SOL)
- `ipfsHash` (optional): IPFS hash of the stored task result
- `taskData` (optional): Volatility task data to validate, containing:
  - `volatility`: The stored volatility measurement
  - `timestamp`: The time when the volatility was measured
  - `cryptoSymbol`: The cryptocurrency that was measured

#### Response

The action returns a validation result with detailed information:

- Validity status: Whether the task is valid
- Current volatility from oracle
- Stored volatility from the task
- Volatility difference percentage
- Acceptable margin of error (usually 5%)
- Task age in seconds
- Any additional validation details

## How It Works

The validation process checks if a stored cryptocurrency volatility measurement falls within an acceptable margin (typically 5%) of the current volatility as reported by the DefiDive API. The system:

1. Retrieves the stored volatility (either via IPFS hash or provided task data)
2. Fetches the current volatility from the oracle
3. Compares the two values within the acceptable margin
4. Validates the task age (if timestamp is available)
5. Returns detailed validation results

## Example Responses

For a valid task:

```
✅ Crypto volatility task 12345 is valid.

Validation Details:
- Current Volatility: 0.0245
- Stored Volatility: 0.0234
- Volatility Difference: 0.0011
- Acceptable Margin: 0.0012
- Task Age: 3600 seconds
```

For an invalid task:

```
❌ Crypto volatility task 67890 is not valid.

The stored volatility is outside the acceptable margin compared to the current market volatility.

Errors:
1. Volatility difference of 0.0032 exceeds acceptable margin of 0.0012

Validation Details:
- Current Volatility: 0.0266
- Stored Volatility: 0.0234
- Volatility Difference: 0.0032
- Acceptable Margin: 0.0012
- Task Age: 3600 seconds
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure the Validation_Service is running at the configured URL
   - Check that port 4003 is accessible (or your configured port)

2. **Task Not Found**
   - Verify the task ID exists in the system
   - Check if the IPFS hash is correct

3. **Oracle Service Unavailable**
   - The DefiDive API may be temporarily down
   - The validation service may be unable to fetch current volatility data

### Logging

The plugin uses `elizaLogger` for logging. Enable verbose logging in your Eliza runtime to see detailed API request and response information.

## Development

### Building the Plugin

```bash
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## API Reference

This plugin interacts with the Anty Fruity Club AVS Validation_Service which provides an endpoint at `/task/validate` that accepts POST requests with the following structure:

```json
{
  "taskId": "string",
  "ipfsHash": "string",  // optional
  "cryptoSymbol": "string",  // optional
  "taskData": {  // optional
    "volatility": number,
    "timestamp": number,
    "cryptoSymbol": "string"
  }
}
```

The expected response format is:

```json
{
  "valid": boolean,
  "message": "string",  // optional
  "errors": ["string"],  // optional array of error messages
  "details": {  // optional
    "currentVolatility": number,
    "storedVolatility": number,
    "volatilityDiff": number,
    "acceptableMargin": number,
    "timestamp": number,
    "age": number
  }
}
```

## License

MIT
