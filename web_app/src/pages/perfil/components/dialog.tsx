import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/src/contexts/AuthContext";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import { AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

export function DeleteAccountDialog() {
  const { deleteAccount } = useAuth();

  const router = useRouter();

  async function handleDeleteAccount() {
    try {
      await deleteAccount();

      toast.success("Conta excluída com sucesso.", { richColors: true });
      await router.replace("/");
    } catch {
      toast.error("Não foi possível excluir a conta. Tente novamente.", {
        richColors: true,
      });
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
        >
          <Trash size={18} /> Excluir conta
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-slate-600">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row gap-2 items-center text-amber-400">
            <AlertTriangleIcon size={24} />
            Você tem certeza?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Essa ação não poderá ser desfeita. Seu perfil será permanentemente
            apagado do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-red-600 text-red-600 cursor-pointer font-semibold transition-all hover:bg-red-500 hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-white cursor-pointer hover:text-slate-200"
            onClick={() => handleDeleteAccount()}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
