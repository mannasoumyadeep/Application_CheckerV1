"use client";

import React, { useCallback } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = window.XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract application numbers (first column)
      const applicationNumbers = jsonData
        .filter((row: any) => row[0]) // Filter out empty rows
        .map((row: any) => String(row[0]).trim());
      
      onFileUpload(applicationNumbers);
    };
    reader.readAsArrayBuffer(file);
  }, [onFileUpload]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Application Numbers
        </CardTitle>
        <CardDescription>
          Upload an Excel file containing patent application numbers in the first column
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload">
              <Button 
                variant="outline" 
                disabled={isProcessing}
                className={cn("relative cursor-pointer", isProcessing && "opacity-50")}
              >
                {isProcessing ? "Processing..." : "Select Excel File"}
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </Button>
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Excel files only (.xlsx, .xls)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};