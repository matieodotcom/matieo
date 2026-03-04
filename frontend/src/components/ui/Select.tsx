import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
}

export function Select({
  id,
  value,
  onValueChange,
  placeholder = 'Select…',
  options,
  disabled,
  className = '',
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200
          dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900
          dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2
          focus:ring-brand-primary/40 focus:border-brand-primary disabled:cursor-not-allowed
          disabled:opacity-50 data-[placeholder]:text-neutral-400 ${className}`}
        aria-label={placeholder}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-50 max-h-60 overflow-y-auto rounded-xl border border-neutral-100
            dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl py-1
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center px-3 py-2 text-sm
                  text-neutral-700 dark:text-neutral-300 focus:bg-neutral-50 dark:focus:bg-neutral-700
                  focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                  data-[highlighted]:bg-brand-primaryLight dark:data-[highlighted]:bg-neutral-700"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-3">
                  <Check className="h-3.5 w-3.5 text-brand-primary" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
