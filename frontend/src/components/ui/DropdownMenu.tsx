import * as RadixDropdown from '@radix-ui/react-dropdown-menu'

export const DropdownMenu = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger
export const DropdownMenuPortal = RadixDropdown.Portal

export function DropdownMenuContent({
  children,
  className = '',
  ...props
}: RadixDropdown.DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={8}
        align="end"
        className={`z-50 min-w-[160px] bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-lg py-1
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          ${className}`}
        {...props}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  )
}

export function DropdownMenuItem({
  children,
  className = '',
  ...props
}: RadixDropdown.DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      className={`relative flex cursor-pointer select-none items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300
        hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:bg-neutral-50 dark:focus:bg-neutral-700 focus:outline-none
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${className}`}
      {...props}
    >
      {children}
    </RadixDropdown.Item>
  )
}

export function DropdownMenuSeparator({
  className = '',
  ...props
}: RadixDropdown.DropdownMenuSeparatorProps) {
  return (
    <RadixDropdown.Separator
      className={`my-1 h-px bg-neutral-100 dark:bg-neutral-700 ${className}`}
      {...props}
    />
  )
}
