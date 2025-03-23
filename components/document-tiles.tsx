"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  FileArchive,
  FileCode,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

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
      return <FilePdf className="h-10 w-10 text-red-500" />;
    case "doc":
      return <FileText className="h-10 w-10 text-blue-500" />;
    case "xls":
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
    case "img":
      return <FileImage className="h-10 w-10 text-purple-500" />;
    case "zip":
      return <FileArchive className="h-10 w-10 text-yellow-500" />;
    case "code":
      return <FileCode className="h-10 w-10 text-gray-500" />;
    default:
      return <FileText className="h-10 w-10 text-gray-500" />;
  }
};

const getTypeName = (type: Document["type"]) => {
  switch (type) {
    case "pdf":
      return "PDF";
    case "doc":
      return "Document";
    case "xls":
      return "Spreadsheet";
    case "img":
      return "Image";
    case "zip":
      return "Archive";
    case "code":
      return "Code";
    default:
      return "File";
  }
};

export function DocumentTiles() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        setError("Failed to load documents. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDownload = (doc: Document) => {
    setDownloadingId(doc.id);

    // Create a download link
    const link = document.createElement("a");
    link.href = doc.url;
    link.setAttribute("download", doc.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset downloading state after a short delay
    setTimeout(() => {
      setDownloadingId(null);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>No documents available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((document) => (
        <Card
          key={document.id}
          className="group cursor-pointer transition-all hover:shadow-md"
          onClick={() => handleDownload(document)}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <div className="mb-4 mt-2">{getDocumentIcon(document.type)}</div>
            <h3 className="font-medium text-center mb-2 line-clamp-2">
              {document.name}
            </h3>
            <div className="flex items-center justify-between w-full mt-2">
              <Badge variant="outline">{getTypeName(document.type)}</Badge>
              <span className="text-xs text-muted-foreground">
                {document.size}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={downloadingId === document.id}
            >
              {downloadingId === document.id ? (
                <span>Downloading...</span>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
