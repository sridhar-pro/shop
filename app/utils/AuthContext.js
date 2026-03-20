"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2; // Maximum number of retry attempts

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activePromiseRef = useRef(null);
  const initialTokenRef = useRef(null); // To track the first generated token

  const [isAuthReady, setIsAuthReady] = useState(false);

  const login = useCallback(async (retryCount = 0) => {
    // If there's already an active request, return its promise
    if (activePromiseRef.current) {
      return activePromiseRef.current;
    }

    try {
      const promise = axios.post(
        "/api/login",
        {},
        {
          timeout: API_TIMEOUT,
        },
      );

      activePromiseRef.current = promise;

      const response = await promise;

      if (response.data.status === "success") {
        const newToken = response.data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", newToken);
        }
        setToken(newToken);
        setError(null);

        // Track the first generated token
        if (!initialTokenRef.current) {
          initialTokenRef.current = newToken;
          // console.log("🔑 First generated token:", newToken);
        } else if (initialTokenRef.current !== newToken) {
          // console.log("🔄 Token regenerated. New token:", newToken);
          initialTokenRef.current = newToken;
        }

        return newToken;
      }
      throw new Error("Login failed - Invalid response");
    } catch (err) {
      console.error("Login attempt failed:", err);

      // Handle timeout specifically
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please check your connection.");
      } else {
        setError(err.message || "Login failed");
      }

      // Retry logic for timeouts or network errors
      if (
        (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") &&
        retryCount < MAX_RETRIES
      ) {
        console.log(`Retrying login (attempt ${retryCount + 1})...`);
        return login(retryCount + 1);
      }

      // Clear invalid token if exists
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      setToken(null);
      return null;
    } finally {
      activePromiseRef.current = null;
    }
  }, []);

  // Initialize auth - runs once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

        if (storedToken) {
          setToken(storedToken);

          if (!initialTokenRef.current) {
            initialTokenRef.current = storedToken;
          } else if (initialTokenRef.current !== storedToken) {
            initialTokenRef.current = storedToken;
          }
        } else {
          await login();
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
        setIsAuthReady(true); // ✅ auth is now ready
      }
    };

    initializeAuth();
  }, [login]);

  const getValidToken = useCallback(async () => {
    // ✅ 1. If token already in state → return immediately
    if (token) return token;

    // ✅ 2. Check localStorage
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (storedToken) {
      setToken(storedToken); // sync state
      return storedToken;
    }

    // ✅ 3. If login already in progress → WAIT for it
    if (activePromiseRef.current) {
      try {
        const res = await activePromiseRef.current;
        if (res?.data?.token) {
          setToken(res.data.token);
          return res.data.token;
        }
      } catch (err) {
        console.error("Waiting for active login failed:", err);
      }
    }

    // ✅ 4. Otherwise trigger login
    const newToken = await login();
    return newToken;
  }, [login, token]);

  return (
    <AuthContext.Provider
      value={{ token, loading, error, getValidToken, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
