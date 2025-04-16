import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth hook

const CallbackHandler = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth(); // Get the callback handler from context

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleOAuthCallback(); // Process the callback
        // Success is handled inside handleOAuthCallback (redirects to '/')
      } catch (error) {
        console.error("OAuth callback processing failed:", error);
        // Error is handled inside handleOAuthCallback (redirects to '/login')
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return <div>Processing login...</div>; // Show a loading message
};

export default CallbackHandler;
