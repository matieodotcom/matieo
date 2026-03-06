import * as RadixPopover from '@radix-ui/react-popover'

export const Popover = RadixPopover.Root
export const PopoverTrigger = RadixPopover.Trigger
export const PopoverAnchor = RadixPopover.Anchor

interface PopoverContentProps extends RadixPopover.PopoverContentProps {
  className?: string
}

export function PopoverContent({ className = '', children, ...props }: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        className={[
          'z-50 rounded-xl border border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-900 shadow-lg outline-none p-3',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
}
