import { createFileRoute } from "@tanstack/react-router";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { GuestOnly } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  return (
    <GuestOnly>
      <AuthScreen initialMode="signup" />
    </GuestOnly>
  );
}
