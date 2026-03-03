import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return <SimpleEditor />;
}
