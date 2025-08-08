"use client";

import { PatentStatusChecker } from "@/components/PatentStatusChecker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Server, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Indian Patent Application Status Checker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional tool for checking the status of Indian patent applications in bulk
          </p>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Server className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">System Status</AlertTitle>
          <AlertDescription className="text-blue-700">
            This tool uses advanced web automation to fetch real-time data from the Indian Patent Office website. 
            Processing time varies based on server load and captcha complexity.
          </AlertDescription>
        </Alert>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Fast Processing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Process multiple applications simultaneously with optimized automation
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Reliable Data</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Direct integration with Indian Patent Office website ensures accurate, up-to-date information
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Smart Error Handling</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic retry mechanism and detailed error reporting for failed requests
            </p>
          </div>
        </div>

        {/* Main Component */}
        <PatentStatusChecker />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            This tool automates the process of checking patent application status from the official Indian Patent Office website. 
            Please ensure you have a stable internet connection during processing.
          </p>
        </div>
      </div>
    </div>
  );
}