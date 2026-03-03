import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export const Sheet = RadixDialog.Root
export const SheetTrigger = RadixDialog.Trigger
export const SheetClose = RadixDialog.Close
export const SheetTitle = RadixDialog.Title
export const SheetDescription = RadixDialog.Description

export function SheetContent({
  children,
  className = '',
  ...props
}: RadixDialog.DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="fixed inset-0 z-50 bg-black/40
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          duration-300"
      />
      <RadixDialog.Content
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left
          duration-300 focus:outline-none ${className}`}
        {...props}
      >
        <RadixDialog.Close
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400
            hover:text-neutral-600 transition-colors focus:outline-none
            focus:ring-2 focus:ring-brand-primary"
          aria-label="Close navigation"
        >
          <X size={18} />
        </RadixDialog.Close>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
