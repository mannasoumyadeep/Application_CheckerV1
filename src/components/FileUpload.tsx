"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { showError } from "@/utils/toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.name.endsWith(".xlsx")) {
        onFileSelect(selectedFile);
      } else {
        showError("Please upload a valid Excel file (.xlsx)");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>
          Upload an Excel file containing patent application numbers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              Excel files only (.xlsx)
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}