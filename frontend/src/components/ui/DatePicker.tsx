import { useState } from 'react'
import { DayPicker, useDayPicker } from 'react-day-picker'
import type { CalendarMonth } from 'react-day-picker'
import { format, parse, isValid, getMonth, getYear } from 'date-fns'
import * as RadixPopover from '@radix-ui/react-popover'
import { CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover'

interface DatePickerProps {
  id?: string
  value?: string           // YYYY-MM-DD string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  disableFuture?: boolean
  className?: string
}

const navBtnClass = [
  'shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors',
  'text-neutral-500 dark:text-neutral-400',
  'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
  'focus:outline-none focus:ring-2 focus:ring-brand-primary',
  'disabled:opacity-30 disabled:pointer-events-none',
].join(' ')

const dayBtnClass = [
  'w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors',
  'text-neutral-700 dark:text-neutral-300',
  'hover:bg-brand-primaryLight dark:hover:bg-brand-primary/20 hover:text-brand-primary',
  'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-neutral-900',
].join(' ')

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1799 }, (_, i) => CURRENT_YEAR - i)

// ── Minimal themed select dropdown ────────────────────────────────────────────

interface CalendarSelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onSelect: (value: string) => void
}

function CalendarSelect({ label, value, options, onSelect }: CalendarSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={[
            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-semibold transition-colors',
            'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
            'text-neutral-800 dark:text-neutral-100',
            'hover:border-brand-primary hover:text-brand-primary',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary',
          ].join(' ')}
        >
          {selectedLabel}
          <ChevronDown size={12} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" aria-hidden="true" />
        </button>
      </RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={4}
          align="start"
          className={[
            'z-[200] rounded-xl border border-neutral-200 dark:border-neutral-700',
            'bg-white dark:bg-neutral-900 shadow-lg outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          ].join(' ')}
        >
          <ul role="listbox" aria-label={label} className="max-h-52 w-36 overflow-y-auto py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(opt.value)
                  setOpen(false)
                }}
                className={[
                  'flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer select-none transition-colors',
                  opt.value === value
                    ? 'bg-brand-primaryLight dark:bg-brand-primary/20 text-brand-primary font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                ].join(' ')}
              >
                {opt.label}
                {opt.value === value && <Check size={13} className="text-brand-primary flex-shrink-0" />}
              </li>
            ))}
          </ul>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

// ── Custom header — rendered inside DayPicker context ─────────────────────────

const YEAR_OPTIONS = YEARS.map((y) => ({ value: String(y), label: String(y) }))
const MONTH_OPTIONS = MONTH_NAMES.map((m, i) => ({ value: String(i), label: m }))

function CalendarCaption({ calendarMonth }: { calendarMonth: CalendarMonth }) {
  const { goToMonth, previousMonth, nextMonth } = useDayPicker()
  const month = getMonth(calendarMonth.date)
  const year  = getYear(calendarMonth.date)

  return (
    <div className="flex items-center gap-1.5 mb-3 px-1">
      <button
        type="button"
        aria-label="Previous month"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={navBtnClass}
      >
        <ChevronLeft size={14} aria-hidden="true" />
      </button>

      <div className="flex items-center gap-1.5 flex-1 justify-center">
        <CalendarSelect
          label="Year"
          value={String(year)}
          options={YEAR_OPTIONS}
          onSelect={(v) => goToMonth(new Date(Number(v), month))}
        />
        <CalendarSelect
          label="Month"
          value={String(month)}
          options={MONTH_OPTIONS}
          onSelect={(v) => goToMonth(new Date(year, Number(v)))}
        />
      </div>

      <button
        type="button"
        aria-label="Next month"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={navBtnClass}
      >
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

// ── DatePicker ─────────────────────────────────────────────────────────────────

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  disableFuture,
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined
  const displayValue = selected ? format(selected, 'dd MMM yyyy') : undefined

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={displayValue ?? placeholder}
          className={[
            'w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm text-left transition-colors',
            'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            displayValue
              ? 'text-neutral-900 dark:text-neutral-100'
              : 'text-neutral-400 dark:text-neutral-500',
            className,
          ].filter(Boolean).join(' ')}
        >
          <span>{displayValue ?? placeholder}</span>
          <CalendarIcon size={15} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={4}>
        <DayPicker
          mode="single"
          hideNavigation
          startMonth={new Date(1800, 0)}
          endMonth={disableFuture ? today : undefined}
          selected={selected}
          defaultMonth={selected ?? new Date()}
          disabled={disableFuture ? { after: today } : undefined}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : undefined)
            setOpen(false)
          }}
          components={{ MonthCaption: CalendarCaption }}
          classNames={{
            root: '',
            months: '',
            month: 'w-[272px]',
            month_caption: '',
            caption_label: '',
            nav: '',
            button_previous: '',
            button_next: '',
            chevron: '',
            month_grid: 'w-full border-collapse',
            weekdays: '',
            weekday: 'text-[11px] font-medium text-neutral-400 dark:text-neutral-500 w-9 h-9 text-center align-middle',
            weeks: '',
            week: '',
            day: 'p-0',
            day_button: dayBtnClass,
            selected: '[&_button]:!bg-brand-primary [&_button]:!text-white [&_button]:hover:!bg-brand-primaryHover',
            today: '[&_button]:font-bold [&_button]:text-brand-primary',
            outside: 'opacity-30',
            disabled: 'opacity-30 pointer-events-none',
            hidden: 'invisible',
            range_start: '',
            range_middle: '',
            range_end: '',
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
