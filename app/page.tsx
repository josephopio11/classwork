import DateDisplay from "@/components/date-display";
import { DocumentTiles } from "@/components/document-tiles";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-right mb-4 text-muted-foreground">
        <DateDisplay />
      </div>
      <h1 className="text-3xl font-bold mb-3">
        Classwork - <DateDisplay />
      </h1>
      <p className="text-muted-foreground mb-8">
        Click to download the task file
      </p>
      <DocumentTiles />
    </div>
  );
}
