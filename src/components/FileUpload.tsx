"use client";

import React, { useCallback } from "react";
import { Upload, FileSpreadsheet, Info, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onFileUpload: (data: string[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

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
        
        if (applicationNumbers.length > 100) {
          setUploadError('Maximum 100 application numbers allowed per file. Please split your file into smaller batches.');
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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setUploadError('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Create a synthetic event to reuse the same handler
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
    }
  }, [handleFileUpload]);

  const downloadSampleFile = () => {
    // Create sample data
    const sampleData = [
      ["Application Number"],
      ["20231234567"],
      ["20231234568"],
      ["20231234569"],
      ["20231234570"]
    ];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Applications");
    
    // Export to file
    XLSX.writeFile(workbook, "sample_patent_application_numbers.xlsx");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Application Numbers
        </CardTitle>
        <CardDescription>
          Upload an Excel file with patent application numbers in the first column (Max 100 per batch)
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
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-gray-300",
              isProcessing && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
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
                or drag and drop your Excel file here
              </p>
              <p className="text-xs text-gray-400">
                Excel files only (.xlsx, .xls) • Max 100 applications per file
              </p>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="link" 
                onClick={downloadSampleFile}
                className="text-sm flex items-center gap-1 mx-auto"
              >
                <Download className="h-4 w-4" />
                Download Sample File
              </Button>
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
                  <li>Maximum 100 application numbers per file</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};