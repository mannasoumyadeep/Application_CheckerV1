"use client";

import { ApplicationStatusChecker } from "@/components/ApplicationStatusChecker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Indian Patent Application Status Checker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check the status of Indian patent applications quickly and easily
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle>Step 1</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Upload an Excel file containing patent application numbers in the first column.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="h-8 w-8 text-primary" />
                <CardTitle>Step 2</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Click "Start Processing" to check the status of all applications.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-primary" />
                <CardTitle>Step 3</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Download results as Excel files when processing is complete.</p>
            </CardContent>
          </Card>
        </div>

        <ApplicationStatusChecker />
      </div>
    </div>
  );
}