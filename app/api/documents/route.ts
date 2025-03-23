import { type NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, readdir } from "fs/promises"
import path from "path"

// Define the documents directory path
const DOCUMENTS_DIR = path.join(process.cwd(), "public", "documents")

// Helper function to get file size in MB
function getFileSizeInMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Helper function to determine file type
function getFileType(filename: string): "pdf" | "doc" | "xls" | "img" | "zip" | "code" {
  const extension = filename.split(".").pop()?.toLowerCase() || ""

  if (extension === "pdf") return "pdf"
  if (["doc", "docx"].includes(extension)) return "doc"
  if (["xls", "xlsx", "csv"].includes(extension)) return "xls"
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension)) return "img"
  if (["zip", "rar", "7z"].includes(extension)) return "zip"
  if (["js", "ts", "html", "css", "json", "py", "java"].includes(extension)) return "code"

  return "doc" // Default
}

// GET: List all documents
export async function GET() {
  try {
    // Read all files in the documents directory
    const files = await readdir(DOCUMENTS_DIR, { withFileTypes: true })

    // Filter out directories and get only files
    const documents = await Promise.all(
      files
        .filter((file) => file.isFile())
        .map(async (file) => {
          const filePath = path.join(DOCUMENTS_DIR, file.name)
          const stats = await import("fs").then((fs) => fs.promises.stat(filePath))

          return {
            id: file.name,
            name: file.name,
            type: getFileType(file.name),
            size: getFileSizeInMB(stats.size),
            url: `/documents/${file.name}`,
          }
        }),
    )

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error listing documents:", error)
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 })
  }
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create the documents directory if it doesn't exist
    await import("fs").then((fs) => fs.promises.mkdir(DOCUMENTS_DIR, { recursive: true }))

    // Write the file to the documents directory
    const filePath = path.join(DOCUMENTS_DIR, file.name)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        type: getFileType(file.name),
        size: getFileSizeInMB(file.size),
        url: `/documents/${file.name}`,
      },
    })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}

// DELETE: Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    // Ensure the filename doesn't contain path traversal attempts
    const sanitizedFilename = path.basename(filename)
    const filePath = path.join(DOCUMENTS_DIR, sanitizedFilename)

    // Delete the file
    await unlink(filePath)

    return NextResponse.json({ success: true, deleted: sanitizedFilename })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

