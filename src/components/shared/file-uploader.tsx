"use client";

import React, { useState } from "react";
import { formatBytes } from "@/utils/file";
import { siteConfig } from "@/config/site";

interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3 text-zinc-600 dark:text-zinc-400">
          📄
        </div>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          Click to upload or drag & drop
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          PDF, PNG, JPG (Max {siteConfig.maxFileSizeMB}MB)
        </span>
      </label>
      {selectedFile && (
        <div className="mt-4 p-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full text-xs text-zinc-700 dark:text-zinc-300 flex justify-between items-center">
          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          <span>{formatBytes(selectedFile.size)}</span>
        </div>
      )}
    </div>
  );
}
