import { createFileRoute } from "@tanstack/react-router";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { GuestOnly } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/entrar")({
  component: EntrarPage,
});

function EntrarPage() {
  return (
    <GuestOnly>
      <AuthScreen initialMode="login" />
    </GuestOnly>
  );
}
