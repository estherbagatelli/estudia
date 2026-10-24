import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/estudos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/estudos"!</div>;
}
