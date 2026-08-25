import { Card } from "@/components/ui/Card";
import { TestForm } from "@/components/admin/TestForm";

export default function NewTestPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">New test</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll get a shareable link right after creating it.
        </p>
      </div>
      <Card className="p-6">
        <TestForm />
      </Card>
    </div>
  );
}
