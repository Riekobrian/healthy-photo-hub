import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle any callback logic here, then redirect
    navigate("/");
  }, [navigate]);

  return <div>Loading...</div>;
};

export default CallbackHandler;