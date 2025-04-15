import React from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LOADING_MESSAGES, LOADING_CONTAINER_CLASSES } from "@/lib/constants";

interface LoadingContainerProps {
  message?: keyof typeof LOADING_MESSAGES | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingContainer: React.FC<LoadingContainerProps> = ({
  message = "generic",
  className,
  size = "lg",
}) => {
  const loadingMessage =
    message in LOADING_MESSAGES
      ? LOADING_MESSAGES[message as keyof typeof LOADING_MESSAGES]
      : message;

  return (
    <div className={cn(LOADING_CONTAINER_CLASSES, className)}>
      <LoadingSpinner size={size} text={loadingMessage} />
    </div>
  );
};
