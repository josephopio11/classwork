import { DocumentTiles } from "@/components/document-tiles"

export default function DocumentsPage() {
  // Get current date in the format "Month Day, Year" (e.g., "March 23, 2025")
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-right mb-4 text-muted-foreground">{currentDate}</div>
      <h1 className="text-3xl font-bold mb-3">Year 6 class work for - {currentDate}</h1>
      <p className="text-muted-foreground mb-8">Click to download the task file</p>
      <DocumentTiles />
    </div>
  )
}

