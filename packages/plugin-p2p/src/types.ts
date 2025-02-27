// src/types.ts
export interface CreatePodResponse {
    transaction: string;
  }
  
  export interface RestakingRequestResponse {
    id: string;
    status: string;
    validatorsCount: number;
    eigenPodOwnerAddress: string;
    feeRecipientAddress: string;
    controllerAddress: string;
  }
  
  export interface StatusResponse {
    status: string;
    validatorsCount: number;
    validators: ValidatorInfo[];
  }
  
  export interface ValidatorInfo {
    pubkey: string;
    status: string;
    depositData?: DepositData;
  }
  
  export interface DepositData {
    pubkey: string;
    signature: string;
    depositDataRoot: string;
  }
  
  export interface DepositParams {
    withdrawalAddress: string;
    depositData: DepositData[];
  }
  
  export interface DepositResponse {
    transaction: string;
  }
  
  export interface VerifyCredentialsParams {
    eigenPodOwnerAddress: string;
    pubkey: string;
  }
  
  export interface VerifyCredentialsResponse {
    transaction: string;
  }
  
  export interface Operator {
    id: string;
    address: string;
    name: string;
    metadataUrl: string;
    delegatedShares: string;
  }
  
  export interface OperatorsResponse {
    operators: Operator[];
  }
  
  export interface DelegateToParams {
    operatorAddress: string;
  }
  
  export interface DelegateToResponse {
    transaction: string;
  }