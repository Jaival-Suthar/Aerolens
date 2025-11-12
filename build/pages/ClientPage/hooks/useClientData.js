import { useState, useCallback, useEffect } from "react";
import { getClients } from "../services/clientService";
import { useAuth } from "../../../shared/auth/AuthContext"; // Import useAuth
export const useClientData = (refreshTrigger = 0) => {
    const { accessToken } = useAuth(); // Get the token
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadClients = useCallback(async (page, limit) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getClients(accessToken, page, limit); // Pass token first!
            setClients(response.data ?? []);
            return response;
        }
        catch (err) {
            let message = "Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            setClients([]);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [accessToken]); // Add accessToken to dependencies
    // Auto-reload when refreshTrigger changes
    useEffect(() => {
        if (accessToken) { // Only load if token exists
            loadClients(1, 10).catch(() => { });
        }
    }, [refreshTrigger, loadClients, accessToken]);
    return { clients, loading, error, loadClients, setError };
};
