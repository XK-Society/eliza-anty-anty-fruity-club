// src/services.ts
import {
    TaskValidationRequest,
    TaskValidationResponse
} from "./types";

export const createTaskValidatorService = (baseUrl: string) => {
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json'
    };

    const validateTask = async (request: TaskValidationRequest): Promise<TaskValidationResponse> => {
        try {
            const url = `${baseUrl}/task/validate`;
            console.log(`Sending validation request to: ${url}`);
            console.log(`Request payload: ${JSON.stringify(request, null, 2)}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(request)
            });
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.message || response.statusText;
                } catch (e) {
                    errorMessage = response.statusText;
                }
                throw new Error(`Validation service error: ${errorMessage} (${response.status})`);
            }

            const data = await response.json();
            console.log(`Response data: ${JSON.stringify(data, null, 2)}`);
            return data;
        } catch (error: any) {
            console.error("Task Validator API Error:", error.message);
            throw error;
        }
    };

    // Helper to fetch available crypto symbols (if the service supports this)
    const getAvailableCryptos = async (): Promise<string[]> => {
        try {
            const url = `${baseUrl}/task/available-cryptos`;
            const response = await fetch(url, {
                method: 'GET',
                headers
            });
            
            if (!response.ok) {
                // If the endpoint doesn't exist, return a default list
                if (response.status === 404) {
                    return ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP"];
                }
                
                throw new Error(`Error fetching available cryptos: ${response.statusText}`);
            }

            const data = await response.json();
            return data.cryptos || [];
        } catch (error: any) {
            console.error("Error fetching available cryptos:", error.message);
            // Return default cryptocurrencies if endpoint fails
            return ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP"];
        }
    };

    return {
        validateTask,
        getAvailableCryptos
    };
};