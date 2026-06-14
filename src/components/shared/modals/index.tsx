import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional width constraint class, defaults to max-w-lg */
  maxWidth?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  title,
  maxWidth = "max-w-lg",
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />

        {/* Panel */}
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-full ${maxWidth} -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 focus:outline-none data-[state=open]:animate-fade-in`}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition">
              <FiX className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-xl font-bold text-[#0d1e43] mb-6">
            {title}
          </Dialog.Title>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
