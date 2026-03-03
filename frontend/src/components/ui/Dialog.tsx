import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger
export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description
export const DialogClose = RadixDialog.Close

export function DialogContent({
  children,
  className = '',
  ...props
}: RadixDialog.DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="fixed inset-0 z-50 bg-black/50
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <RadixDialog.Content
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
          w-full max-w-md bg-white rounded-2xl shadow-xl p-8 focus:outline-none
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400
            hover:text-neutral-600 transition-colors focus:outline-none
            focus:ring-2 focus:ring-brand-primary"
          aria-label="Close"
        >
          <X size={18} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
