// src/types.ts
export interface TaskValidationRequest {
    taskId: string;
    ipfsHash?: string;
    cryptoSymbol?: string;
    taskData?: {
      volatility?: number;
      timestamp?: number;
      cryptoSymbol?: string;
      [key: string]: any;
    };
  }
  
  export interface TaskValidationResponse {
    valid: boolean;
    message?: string;
    errors?: string[];
    details?: {
      currentVolatility?: number;
      storedVolatility?: number;
      volatilityDiff?: number;
      acceptableMargin?: number;
      timestamp?: number;
      age?: number;
      [key: string]: any;
    };
  }