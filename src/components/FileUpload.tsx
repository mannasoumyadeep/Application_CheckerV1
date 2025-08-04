"use client";

import React, { useCallback } from "react";
import { Upload, FileSpreadsheet, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

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
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract application numbers (first column)
      const applicationNumbers = jsonData
        .filter((row: any) => row[0]) // Filter out empty rows
        .map((row: any) => String(row[0]).trim());
      
      onFileUpload(applicationNumbers);
    };
    reader.readAsArrayBuffer(file);
  }, [onFileUpload]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Application Numbers
        </CardTitle>
        <CardDescription>
          Upload an Excel file with patent application numbers in the first column
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <div className="mt-2">
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
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">File Format Instructions</h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>First column should contain application numbers (e.g., 2023123456)</li>
                  <li>Include only one application number per row</li>
                  <li>Do not include headers in the file</li>
                  <li>Save your file as .xlsx or .xls format</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};