"use client";

import React, { useCallback } from "react";
import { Upload, FileSpreadsheet, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const validateApplicationNumber = (number: string): boolean => {
    // Indian patent application numbers are typically 11 digits
    // Format: YYYYNNNNNN (4-digit year + 7-digit serial number)
    const regex = /^\d{11}$/;
    return regex.test(number);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract application numbers (first column)
        const applicationNumbers = jsonData
          .filter((row: any) => row[0]) // Filter out empty rows
          .map((row: any) => String(row[0]).trim())
          .filter((num: string) => num.length > 0); // Filter out empty strings
        
        // Validate application numbers
        const invalidNumbers = applicationNumbers.filter((num: string) => !validateApplicationNumber(num));
        if (invalidNumbers.length > 0) {
          setUploadError(`Invalid application number format found: ${invalidNumbers[0]}. Application numbers should be 11 digits (e.g., 20231234567).`);
          return;
        }
        
        if (applicationNumbers.length === 0) {
          setUploadError('No valid application numbers found in the file.');
          return;
        }
        
        onFileUpload(applicationNumbers);
      } catch (err) {
        console.error('File processing error:', err);
        setUploadError('Error processing the file. Please make sure it is a valid Excel file.');
      }
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
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>
                {uploadError}
              </AlertDescription>
            </Alert>
          )}
          
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
                  <li>First column should contain application numbers (e.g., 20231234567)</li>
                  <li>Application numbers must be exactly 11 digits</li>
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