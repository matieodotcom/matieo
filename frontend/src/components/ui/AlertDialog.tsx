import * as RadixAlertDialog from '@radix-ui/react-alert-dialog'

export const AlertDialog = RadixAlertDialog.Root
export const AlertDialogTrigger = RadixAlertDialog.Trigger
export const AlertDialogTitle = RadixAlertDialog.Title
export const AlertDialogDescription = RadixAlertDialog.Description

export function AlertDialogContent({
  children,
  className = '',
  ...props
}: RadixAlertDialog.AlertDialogContentProps) {
  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay
        className="fixed inset-0 z-50 bg-black/50
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <RadixAlertDialog.Content
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
          w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-6 focus:outline-none
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
        {...props}
      >
        {children}
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  )
}

export function AlertDialogAction({
  children,
  className = '',
  ...props
}: RadixAlertDialog.AlertDialogActionProps) {
  return (
    <RadixAlertDialog.Action
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
        bg-red-600 hover:bg-red-700 text-white transition-colors
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </RadixAlertDialog.Action>
  )
}

export function AlertDialogCancel({
  children,
  className = '',
  ...props
}: RadixAlertDialog.AlertDialogCancelProps) {
  return (
    <RadixAlertDialog.Cancel
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
        border border-neutral-200 dark:border-neutral-700
        text-neutral-700 dark:text-neutral-300
        hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </RadixAlertDialog.Cancel>
  )
}
