import { toast } from "sonner";

/**
 * Mensagens de sucesso do app, com os textos combinados no relatório de UX/UI.
 * Os hooks usam no `onSuccess` das mutations, para toda tela falar igual.
 */
export const avisar = {
  adicionado: () => toast.success("Adicionado com sucesso!"),
  removido: () => toast("Item removido."),
  tarefaConcluida: () => toast.success("Tarefa concluída!"),
  treinoRegistrado: () => toast.success("Treino registrado!"),
  temaAtualizado: () => toast.success("Tema atualizado."),
};
