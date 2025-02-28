# P2P EigenLayer Restaking Plugin

A plugin for Eliza that provides integration with P2P's EigenLayer restaking services, allowing agents to help users with the complete EigenLayer restaking flow.

## Overview

This plugin enables Eliza agents to assist users with the full EigenLayer restaking process through P2P's infrastructure, including:

- Creating an EigenPod
- Setting up restaking nodes
- Monitoring node setup status
- Creating deposit transactions
- Verifying withdrawal credentials
- Finding and delegating to EigenLayer operators

## Installation

```bash
pnpm add plugin-p2p
```

## Configuration

The plugin requires the following configuration values:

| Setting | Description | Required |
|---------|-------------|----------|
| P2P_API_KEY | Your P2P API key for authentication | Yes |
| P2P_API_URL | P2P API base URL (defaults to https://api.p2p.org) | Yes |

### Setting up configuration

Add the configuration to your Eliza agent:

```typescript
// In your agent configuration
{
  settings: {
    P2P_API_KEY: "your-p2p-api-key",
    P2P_API_URL: "https://api.p2p.org"  // or https://api-test-holesky.p2p.org for testing
  }
}
```

## Usage

Import and register the plugin with your Eliza agent:

```typescript
import { p2pPlugin } from 'plugin-p2p';

// Register with your agent
agent.registerPlugin(p2pPlugin);
```

## Available Actions

The plugin provides the following actions:

### 1. Create EigenPod (`P2P_CREATE_EIGENPOD`)

Generates a transaction to create an EigenPod for restaking.

```typescript
// Example action invocation
{
  action: "P2P_CREATE_EIGENPOD"
}
```

### 2. Create Restaking Request (`P2P_CREATE_RESTAKE_REQUEST`)

Sets up staking nodes through P2P infrastructure.

```typescript
// Example action invocation
{
  action: "P2P_CREATE_RESTAKE_REQUEST",
  actionParams: {
    eigenPodOwnerAddress: "0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
    feeRecipientAddress: "0x39D02C253dA1d9F85ddbEB3B6Dc30bc1EcBbFA17",
    controllerAddress: "0x39D02C253dA1d9F85ddbEB3B6Dc30bc1EcBbFA17",
    validatorsCount: 1,
    location: "any"  // Optional
  }
}
```

### 3. Check Restaking Status (`P2P_CHECK_RESTAKE_STATUS`)

Monitors the status of a node setup request.

```typescript
// Example action invocation
{
  action: "P2P_CHECK_RESTAKE_STATUS",
  actionParams: {
    requestId: "6df58880-c4c9-484a-8fc4-7f7668fe9522"
  }
}
```

### 4. Create Deposit Transaction (`P2P_CREATE_DEPOSIT_TX`)

Generates a transaction for depositing stake.

```typescript
// Example action invocation - Method 1: Using request ID
{
  action: "P2P_CREATE_DEPOSIT_TX",
  actionParams: {
    withdrawalAddress: "0x1433F808a4867aDEeEb3AE0Df58691C252269A2C",
    requestId: "6df58880-c4c9-484a-8fc4-7f7668fe9522"
  }
}

// Example action invocation - Method 2: Using validator data
{
  action: "P2P_CREATE_DEPOSIT_TX",
  actionParams: {
    withdrawalAddress: "0x1433F808a4867aDEeEb3AE0Df58691C252269A2C",
    validatorPubkey: "0xaed7226d86d884dd44bc45c2b57f7634e72abf247713163388b1c34d89a1322d7228ca023dbaf2465b822e35ba00da13",
    signature: "0x91b710f0e3affe704e76ada81b095afbedf4b760f3160760e8fa0298cc4858e0f325c2652dc698ec63c59db65562551114ab7fcafe1d675eaaf186fa7758800f0157bd0b51cd3a131fac562d6933658ddbf182aab8d20a9483b1392085e54cf5",
    depositDataRoot: "0xd0d00dce54b4ec8a7803783fc786a859459ead1d35b856c525cb289aba4b0f89"
  }
}
```

### 5. Verify Withdrawal Credentials (`P2P_VERIFY_CREDENTIALS`)

Verifies the withdrawal credentials for an EigenPod.

```typescript
// Example action invocation
{
  action: "P2P_VERIFY_CREDENTIALS",
  actionParams: {
    eigenPodOwnerAddress: "0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
    pubkey: "0xffC08FcD7cFeF5c70fB2b0e1f2A8EaA690AaE2bDFfa5dBEc4dEef31DcC0B19eB1f9Cebe3E2fe9eefBD9a1BDF6FD89b39"
  }
}
```

### 6. Get Operators (`P2P_GET_OPERATORS`)

Retrieves a list of available EigenLayer operators.

```typescript
// Example action invocation
{
  action: "P2P_GET_OPERATORS"
}
```

### 7. Delegate to Operator (`P2P_DELEGATE_TO`)

Generates a transaction to delegate restaked ETH to an operator.

```typescript
// Example action invocation
{
  action: "P2P_DELEGATE_TO",
  actionParams: {
    operatorAddress: "0xdbed88d83176316fc46797b43adee927dc2ff2f5"
  }
}
```

## Complete Restaking Flow

The typical workflow for using this plugin follows these steps:

1. Create an EigenPod with `P2P_CREATE_EIGENPOD`
2. Create a restaking request with `P2P_CREATE_RESTAKE_REQUEST`
3. Monitor the request status with `P2P_CHECK_RESTAKE_STATUS`
4. Once validators are ready, create deposit transactions with `P2P_CREATE_DEPOSIT_TX`
5. Verify withdrawal credentials with `P2P_VERIFY_CREDENTIALS`
6. Find operators with `P2P_GET_OPERATORS`
7. Delegate to an operator with `P2P_DELEGATE_TO`

## Troubleshooting

### Common Issues

1. **Unauthorized Error**
   - Ensure your P2P API key is valid and has not expired
   - Verify the API key has permissions for EigenLayer operations
   - Contact P2P support to confirm the status of your API key

2. **Node Setup Delays**
   - The node setup process may take time; check status regularly
   - Ensure the EigenPod is properly created before attempting node setup

3. **Deposit Failures**
   - Verify the validators are in a ready state before creating deposit transactions
   - Ensure sufficient ETH balance for staking operations

### Logging

The plugin uses `elizaLogger` for logging. To enable verbose logging, configure your logging level accordingly in your Eliza runtime.

## Development

### Building the Plugin

```bash
pnpm build
```

## API Reference

This plugin interacts with the P2P API. For complete API documentation, please refer to P2P's official documentation.

## License

MIT
