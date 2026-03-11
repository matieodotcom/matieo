import { useState, useRef, useEffect } from 'react'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'
import { Smile } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPickerButton({ onEmojiSelect }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function handleEmojiClick(data: EmojiClickData) {
    onEmojiSelect(data.emoji)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('common.insertEmoji')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-brand-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <Smile size={18} />
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            height={350}
            width={300}
            searchDisabled={false}
            skinTonesDisabled
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  )
}
