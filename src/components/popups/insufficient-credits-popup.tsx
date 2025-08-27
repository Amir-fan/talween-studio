'use client';

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
import { useRouter } from 'next/navigation';

interface InsufficientCreditsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsufficientCreditsPopup({ open, onOpenChange }: InsufficientCreditsPopupProps) {
  const router = useRouter();

  const handleGoToPackages = () => {
    router.push('/packages');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>نفدت النقاط!</AlertDialogTitle>
          <AlertDialogDescription>
            ليس لديك نقاط كافية لإكمال هذا الإجراء. يرجى شراء المزيد من النقاط للمتابعة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>لاحقاً</AlertDialogCancel>
          <AlertDialogAction onClick={handleGoToPackages}>
            شراء نقاط
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
