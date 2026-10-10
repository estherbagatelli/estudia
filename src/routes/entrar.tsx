import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/entrar")({
  component: EntrarPage,
});

function EntrarPage() {
  return <LoginForm />;
}
