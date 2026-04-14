"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileArchive,
  FileCode,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Document = {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "img" | "zip" | "code";
  size: string;
  url: string;
};

const getDocumentIcon = (type: Document["type"]) => {
  switch (type) {
    case "pdf":
      return <FilePdf className="h-6 w-6 text-red-500" />;
    case "doc":
      return <FileText className="h-6 w-6 text-blue-500" />;
    case "xls":
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    case "img":
      return <FileImage className="h-6 w-6 text-purple-500" />;
    case "zip":
      return <FileArchive className="h-6 w-6 text-yellow-500" />;
    case "code":
      return <FileCode className="h-6 w-6 text-gray-500" />;
    default:
      return <FileText className="h-6 w-6 text-gray-500" />;
  }
};

export default function AdminPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) {
        toast.error("Failed to fetch documents");
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError("Failed to load documents");
      toast.error("Failed to load documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file upload
  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;

    if (!fileInput.files || fileInput.files.length === 0) {
      setError("Please select a file to upload");
      toast.error("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      toast.info("Uploading file...");
      setError(null);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to upload file");
        throw new Error(data.error || "Failed to upload file");
      }

      // Show success message
      setSuccess(`File "${file.name}" uploaded successfully`);
      toast.success(`File "${file.name}" uploaded successfully`);

      // Reset form
      form.reset();

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload file");
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);

      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  // Handle file deletion
  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(
        `/api/documents?filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to delete file");
        throw new Error(data.error || "Failed to delete file");
      }

      router.refresh();
      // Show success message
      setSuccess(`File "${filename}" deleted successfully`);
      toast.success(`File "${filename}" deleted successfully`);

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>
            Upload class work documents for students to download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Documents</CardTitle>
          <CardDescription>View and delete uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((document, index) => (
                <div key={document.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(document.type)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {document.type.toUpperCase()}
                          </Badge>
                          <span>{document.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(document.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  {index < documents.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
