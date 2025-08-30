import React from 'react';
import { Button } from "../ui/button";
import { FaUpload } from "react-icons/fa";

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  isUploading: boolean;
  children?: React.ReactNode; // Optional children for custom text
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onClick,
  disabled,
  isUploading,
  children = "Upload Image", // Default text
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isUploading}
      className="flex items-center space-x-2"
    >
      <FaUpload className={`w-4 h-4 ${isUploading ? "animate-spin" : ""}`} />
      <span>{isUploading ? "Uploading..." : children}</span>
    </Button>
  );
};

export default UploadButton;
