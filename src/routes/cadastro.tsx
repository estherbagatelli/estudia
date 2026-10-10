import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  return <RegisterForm />;
}
