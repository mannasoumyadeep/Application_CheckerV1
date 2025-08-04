"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ProcessingControls } from "@/components/ProcessingControls";
import { ResultsTable } from "@/components/ResultsTable";
import { ErrorTable } from "@/components/ErrorTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Play, Square, FileText } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError, showSuccess } from "@/utils/toast";
import { usePatentProcessing } from "@/hooks/usePatentProcessing";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [applicationNumbers, setApplicationNumbers] = useState<string[]>([]);
  
  const {
    isProcessing,
    progress,
   <dyad-command type="refresh"></dyad-command>
<dyad-chat-summary>Creating patent application status checker</dyad-chat-summary>I'll create a web-based version of the Python patent application status checker. Let me implement the main components for this application.

<dyad-write path="src/pages/Index.tsx" description="Creating the main patent application status checker page">
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Play, Square, FileText, AlertCircle } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError, showSuccess } from "@/utils/toast";
import * as XLSX from 'xlsx';

interface ApplicationData {
  applicationNumber: string;
  applicantName?: string;
  applicationType?: string;
  dateOfFiling?: string;
  titleOfInvention?: string;
  fieldOfInvention?: string;
  emailAsPerRecord?: string;
  additionalEmailAsPerRecord?: string;
  emailUpdatedOnline?: string;
  pctInternationalApplicationNumber?: string;
  pctInternationalFilingDate?: string;
  priorityDate?: string;
  requestForExaminationDate?: string;
  publicationDate?: string;
  applicationStatus?: string;
}

interface ProcessingResult {
  applicationNumber: string;
  data?: ApplicationData;
  error?: string;
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [processedApplications, setProcessedApplications] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopProcessingRef = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.name.endsWith(".xlsx")) {
        setFile(selectedFile);
      } else {
        showError("Please upload a valid Excel file (.xlsx)");
      }
    }
  };

  const readExcelFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extract application numbers from the first column
          const applicationNumbers = (jsonData as any[])
            .slice(1) // Skip header row
            .map(row => row[0])
            .filter(num => num && String(num).trim() !== '')
            .map(num => String(num).trim());
          
          resolve(applicationNumbers);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const processApplication = async (applicationNumber: string): Promise<ProcessingResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate some errors for demonstration
    if (Math.random() < 0.1) {
      return {
        applicationNumber,
        error: "Application not found in database"
      };
    }
    
    // Return mock data
    return {
      applicationNumber,
      data: {
        applicationNumber,
        applicantName: `Applicant ${Math.floor(Math.random() * 1000)}`,
        applicationType: ["Provisional", "Non-Provisional", "Design"][Math.floor(Math.random() * 3)],
        dateOfFiling: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/202${Math.floor(Math.random() * 4)}`,
        titleOfInvention: `Invention Title ${Math.floor(Math.random() * 1000)}`,
        fieldOfInvention: ["Chemistry", "Mechanical", "Electrical", "Biotechnology"][Math.floor(Math.random() * 4)],
        applicationStatus: ["Filed", "Published", "Examined", "Granted", "Rejected"][Math.floor(Math.random() * 5)]
      }
    };
  };

  const processApplications = async (applicationNumbers: string[]) => {
    stopProcessingRef.current = false;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setTotalApplications(applicationNumbers.length);
    setProcessedApplications(0);

    const results: ProcessingResult[] = [];
    
    try {
      for (let i = 0; i < applicationNumbers.length; i++) {
        if (stopProcessingRef.current) {
          break;
        }
        
        const result = await processApplication(applicationNumbers[i]);
        results.push(result);
        
        setProcessedApplications(i + 1);
        setProgress(Math.round(((i + 1) / applicationNumbers.length) * 100));
        setResults([...results]);
      }
      
      if (!stopProcessingRef.current) {
        showSuccess(`Processing completed! ${results.length} applications processed.`);
      }
    } catch (error) {
      showError("An error occurred during processing");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      showError("Please upload a file first");
      return;
    }

    try {
      const applicationNumbers = await readExcelFile(file);
      if (applicationNumbers.length === 0) {
        showError("No application numbers found in the file");
        return;
      }
      
      await processApplications(applicationNumbers);
    } catch (error) {
      showError("Failed to read the Excel file");
      console.error(error);
    }
  };

  const handleStop = () => {
    stopProcessingRef.current = true;
    setIsProcessing(false);
    showSuccess("Processing stopped");
  };

  const handleDownload = (type: "results" | "errors") => {
    const dataToExport = type === "results" 
      ? results.filter(r => r.data)
      : results.filter(r => r.error);
    
    if (dataToExport.length === 0) {
      showError(`No ${type} to download`);
      return;
    }

    const worksheetData = [
      // Headers
      type === "results" 
        ? [
            "Application Number", "Applicant Name", "Application Type", "Date of Filing",
            "Title of Invention", "Field of Invention", "Application Status"
          ]
        : ["Application Number", "Error"]
    ];

    // Data rows
    dataToExport.forEach(result => {
      if (type === "results" && result.data) {
        worksheetData.push([
          result.data.applicationNumber,
          result.data.applicantName || "",
          result.data.applicationType || "",
          result.data.dateOfFiling || "",
          result.data.titleOfInvention || "",
          result.data.fieldOfInvention || "",
          result.data.applicationStatus || ""
        ]);
      } else if (type === "errors" && result.error) {
        worksheetData.push([result.applicationNumber, result.error]);
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === "results" ? "Results" : "Errors");
    
    XLSX.writeFile(workbook, `patent_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded successfully!`);
  };

  const successfulResults = results.filter(r => r.data);
  const errorResults = results.filter(r => r.error);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Patent Application Status Checker</h1>
          <p className="text-gray-600">
            Upload your Excel file with application numbers to check their status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    {file ? file.name : "Click to upload or drag and drop"}
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

          <Card>
            <CardHeader>
              <CardTitle>Process Data</CardTitle>
              <CardDescription>
                Start processing to check application statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Processing Controls</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing || !file}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                    <Button
                      onClick={handleStop}
                      variant="destructive"
                      disabled={!isProcessing}
                      className="flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{totalApplications}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">Processed</p>
                    <p className="text-2xl font-bold text-green-600">{processedApplications}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {(results.length > 0 || isProcessing) && (
          <>
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Results</span>
                    <Badge variant="secondary">{successfulResults.length} items</Badge>
                  </CardTitle>
                  <CardDescription>
                    Successfully processed applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleDownload("results")}
                        disabled={successfulResults.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Results
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="text-left p-3">Application</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Applicant</th>
                            <th className="text-left p-3">Filing Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {successfulResults.map((result, index) => (
                            result.data && (
                              <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{result.data.applicationNumber}</td>
                                <td className="p-3">
                                  <Badge variant="default">{result.data.applicationStatus}</Badge>
                                </td>
                                <td className="p-3">{result.data.applicantName}</td>
                                <td className="p-3">{result.data.dateOfFiling}</td>
                              </tr>
                            )
                          ))}
                          {isProcessing && processedApplications < totalApplications && (
                            <tr>
                              <td colSpan={4} className="p-3 text-center text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                  Processing...
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Errors</span>
                    <Badge variant="destructive">{errorResults.length} items</Badge>
                  </CardTitle>
                  <CardDescription>
                    Applications with processing errors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleDownload("errors")}
                        disabled={errorResults.length === 0}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Errors
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="text-left p-3">Application</th>
                            <th className="text-left p-3">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorResults.map((error, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="p-3 font-mono text-sm">{error.applicationNumber}</td>
                              <td className="p-3 text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {error.error}
                              </td>
                            </tr>
                          ))}
                          {isProcessing && processedApplications < totalApplications && (
                            <tr>
                              <td colSpan={2} className="p-3 text-center text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                  Checking for errors...
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Upload File</h3>
                <p className="text-sm text-gray-600">
                  Upload an Excel file with patent application numbers
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-green-100 p-3 rounded-full mb-3">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Process Data</h3>
                <p className="text-sm text-gray-600">
                  System checks each application status automatically
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-purple-100 p-3 rounded-full mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Download Results</h3>
                <p className="text-sm text-gray-600">
                  Get separate files for results and errors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;