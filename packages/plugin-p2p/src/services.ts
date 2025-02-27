// src/services.ts
import {
    CreatePodResponse,
    RestakingRequestResponse,
    StatusResponse,
    DepositParams,
    DepositResponse,
    VerifyCredentialsParams,
    VerifyCredentialsResponse,
    Operator,
    OperatorsResponse,
    DelegateToParams,
    DelegateToResponse
} from "./types";

export const createP2PService = (apiKey: string, baseUrl: string) => {
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json'
    };

    const createEigenPod = async (): Promise<CreatePodResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/eigenlayer/tx/create-pod`;
            const response = await fetch(url, {
                method: 'POST',
                headers
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (createEigenPod):", error.message);
            throw error;
        }
    };

    const createRestakingRequest = async (
        id: string,
        validatorsCount: number,
        eigenPodOwnerAddress: string,
        feeRecipientAddress: string,
        controllerAddress: string,
        location: string = "any"
    ): Promise<RestakingRequestResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/direct/nodes-request/create`;
            const payload = {
                id,
                type: "RESTAKING",
                validatorsCount,
                eigenPodOwnerAddress,
                feeRecipientAddress,
                controllerAddress,
                nodesOptions: {
                    location,
                    relaysSet: null
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (createRestakingRequest):", error.message);
            throw error;
        }
    };

    const getRequestStatus = async (id: string): Promise<StatusResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/direct/nodes-request/status/${id}`;
            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (getRequestStatus):", error.message);
            throw error;
        }
    };

    const createDepositTransaction = async (params: DepositParams): Promise<DepositResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/direct/tx/deposit`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (createDepositTransaction):", error.message);
            throw error;
        }
    };

    const verifyWithdrawalCredentials = async (params: VerifyCredentialsParams): Promise<VerifyCredentialsResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/eigenlayer/tx/verify-withdrawal-credentials`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (verifyWithdrawalCredentials):", error.message);
            throw error;
        }
    };

    const getOperators = async (): Promise<OperatorsResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/eigenlayer/operator`;
            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (getOperators):", error.message);
            throw error;
        }
    };

    const delegateTo = async (params: DelegateToParams): Promise<DelegateToResponse> => {
        try {
            const url = `${baseUrl}/api/v1/eth/staking/eigenlayer/tx/delegate-to`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("P2P API Error (delegateTo):", error.message);
            throw error;
        }
    };

    return {
        createEigenPod,
        createRestakingRequest,
        getRequestStatus,
        createDepositTransaction,
        verifyWithdrawalCredentials,
        getOperators,
        delegateTo
    };
};