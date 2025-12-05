"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
  organizationName: string;
}

export default function LogoUpload({
  currentLogo,
  onLogoChange,
  organizationName,
}: LogoUploadProps) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "warning");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("File size must be less than 2MB", "warning");
      return;
    }

    setIsUploading(true);

    try {
      // For now, we'll create a data URL
      // In production, you'd upload to a cloud storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      showToast("Error uploading logo. Please try again.", "error");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">Organization Logo</div>

      <div className="flex items-center space-x-4">
        {/* Current Logo Preview */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt={`${organizationName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {organizationName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? "Uploading..." : "Upload Logo"}
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
        </div>
      </div>
    </div>
  );
}
