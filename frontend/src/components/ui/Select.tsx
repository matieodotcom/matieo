import { useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
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
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const anchorRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  function handleFocus() {
    if (!disabled) setOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
  }

  function handleSelect(optValue: string) {
    onValueChange(optValue)
    setOpen(false)
    setQuery('')
  }

  function handleOpenChange(next: boolean) {
    if (!next) setQuery('')
    setOpen(next)
  }

  // Closed: show selected label. Open: show what the user has typed (empty = full list shown)
  const inputValue = open ? query : (selectedLabel ?? '')
  // When open + no query typed, ghost the selected label as placeholder
  const inputPlaceholder = open ? (selectedLabel ?? placeholder) : placeholder

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Anchor asChild>
        <div ref={anchorRef} className="relative w-full">
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            autoComplete="off"
            disabled={disabled}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={inputPlaceholder}
            className={`flex w-full items-center rounded-lg border border-neutral-200
              dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 pr-9 text-sm
              text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary
              disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Don't close when clicking back on the anchor (the input wrapper)
            if (anchorRef.current?.contains(e.target as Node)) {
              e.preventDefault()
            }
          }}
          style={{ width: anchorRef.current?.offsetWidth }}
          className="z-50 rounded-xl border border-neutral-100
            dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-400 select-none">No results</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  onMouseDown={(e) => {
                    // prevent input blur before click registers
                    e.preventDefault()
                    handleSelect(opt.value)
                  }}
                  className="relative flex cursor-pointer select-none items-center pl-3 pr-8 py-2 text-sm
                    text-neutral-700 dark:text-neutral-300 hover:bg-brand-primaryLight
                    dark:hover:bg-neutral-700"
                >
                  {opt.label}
                  {opt.value === value && (
                    <span className="absolute right-3">
                      <Check className="h-3.5 w-3.5 text-brand-primary" />
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
