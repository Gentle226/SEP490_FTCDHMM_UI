'use client';

import { PropsWithChildren, createContext, useContext, useState } from 'react';

import { ConfirmLogoutDialog } from '../components/confirm-logout-dialog';

type ConfirmLogoutDialogContextValue = {
  setOpen: (open: boolean) => void;
};

const ConfirmLogoutDialogContext = createContext<ConfirmLogoutDialogContextValue | null>(null);

export function ConfirmLogoutDialogProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <ConfirmLogoutDialogContext.Provider value={{ setOpen }}>
      {children}
      <ConfirmLogoutDialog open={open} onOpenChange={setOpen} />
    </ConfirmLogoutDialogContext.Provider>
  );
}

export function useConfirmLogoutDialog() {
  const context = useContext(ConfirmLogoutDialogContext);

  if (!context) {
    throw new Error('useConfirmLogoutDialog must be used within an ConfirmLogoutDialogProvider');
  }

  return context;
}
