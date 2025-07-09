import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

interface InactivityModalProps {
  isOpen: boolean;
  timeUntilExpiry: number;
  onContinue: () => void;
  onLogout: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  timeUntilExpiry,
  onContinue,
  onLogout
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Sessão Inativa</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está inativo há um tempo. Sua sessão expirará em breve por motivos de segurança.
            </p>
            {timeUntilExpiry > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(timeUntilExpiry)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tempo restante
                </div>
              </div>
            )}
            <p className="text-sm">
              Deseja continuar logado ou sair agora?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onLogout}
            className="sm:w-auto"
          >
            Sair Agora
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onContinue}
            className="sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Continuar Logado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};