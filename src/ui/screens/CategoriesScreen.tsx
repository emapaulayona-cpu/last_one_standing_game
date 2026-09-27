import { useState } from 'react'
import type { LocaleContent } from '../../content/types'
import type { Category, CategoryLevel } from '../../engine/types'
import { CATEGORY_TEXT_MAX_LENGTH, validateCategoryText } from '../../engine/validation'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'
import { SegmentedControl } from '../components/SegmentedControl'

interface CategoriesScreenProps {
  locale: LocaleContent
  customCategories: Category[]
  onAddCustom: (text: string, level: CategoryLevel) => void
  onUpdateCustom: (id: string, text: string, level: CategoryLevel) => void
  onDeleteCustom: (id: string) => void
  onBack: () => void
}

const LEVELS: CategoryLevel[] = ['easy', 'hard']

function errorText(
  errors: ReturnType<typeof validateCategoryText>,
  s: LocaleContent['strings']['categories'],
): string | null {
  if (errors.includes('REQUIRED')) return s.errorRequired
  if (errors.includes('TOO_LONG')) return s.errorTooLong
  if (errors.includes('DUPLICATE')) return s.errorDuplicate
  return null
}

function CategoryRow({
  category,
  allCategories,
  locale,
  onSave,
  onDelete,
}: {
  category: Category
  allCategories: Category[]
  locale: LocaleContent
  onSave: (text: string, level: CategoryLevel) => void
  onDelete: () => void
}) {
  const s = locale.strings.categories
  const [text, setText] = useState(category.text)
  const [level, setLevel] = useState(category.level)
  const dirty = text.trim() !== category.text || level !== category.level
  const errors = validateCategoryText(text, allCategories, category.id)
  const levelLabel: Record<CategoryLevel, string> = {
    easy: locale.strings.setup.difficultyEasy,
    hard: locale.strings.setup.difficultyHard,
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-indigo/10 bg-surface p-3">
      <div className="flex items-center gap-2">
        <input
          value={text}
          maxLength={CATEGORY_TEXT_MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          className="min-h-11 flex-1 rounded-xl border border-indigo/20 bg-cream px-3 py-2 text-center font-body text-ink outline-none focus:border-indigo"
        />
        <button
          type="button"
          onClick={onDelete}
          className="flex size-11 items-center justify-center rounded-xl text-indigo/60 hover:bg-indigo-soft"
          aria-label={s.deleteButton}
        >
          🗑
        </button>
      </div>
      <SegmentedControl
        options={LEVELS}
        value={level}
        onChange={setLevel}
        labelFor={(o) => levelLabel[o]}
      />
      {dirty && errorText(errors, s) && (
        <p className="text-sm text-danger">{errorText(errors, s)}</p>
      )}
      {dirty && errors.length === 0 && (
        <Button variant="secondary" onClick={() => onSave(text.trim(), level)}>
          {s.saveButton}
        </Button>
      )}
    </div>
  )
}

export function CategoriesScreen({
  locale,
  customCategories,
  onAddCustom,
  onUpdateCustom,
  onDeleteCustom,
  onBack,
}: CategoriesScreenProps) {
  const s = locale.strings.categories
  const [newText, setNewText] = useState('')
  const [newLevel, setNewLevel] = useState<CategoryLevel>('easy')
  const allCategories = [...locale.categories, ...customCategories]
  const newErrors = validateCategoryText(newText, allCategories)
  const levelLabel: Record<CategoryLevel, string> = {
    easy: locale.strings.setup.difficultyEasy,
    hard: locale.strings.setup.difficultyHard,
  }

  function handleAdd() {
    if (newErrors.length > 0) return
    onAddCustom(newText.trim(), newLevel)
    setNewText('')
  }

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{s.title}</h1>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.customLabel}</h2>
        <div className="flex flex-col gap-2">
          {customCategories.length === 0 && (
            <p className="font-body text-sm text-ink/60">{s.emptyCustom}</p>
          )}
          {customCategories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              allCategories={allCategories}
              locale={locale}
              onSave={(text, level) => onUpdateCustom(category.id, text, level)}
              onDelete={() => onDeleteCustom(category.id)}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-dashed border-indigo/30 p-3">
          <input
            value={newText}
            maxLength={CATEGORY_TEXT_MAX_LENGTH}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={s.textPlaceholder}
            className="min-h-11 rounded-xl border border-indigo/20 bg-surface px-3 py-2 text-center font-body text-ink outline-none focus:border-indigo"
          />
          <SegmentedControl
            options={LEVELS}
            value={newLevel}
            onChange={setNewLevel}
            labelFor={(o) => levelLabel[o]}
          />
          {newText.length > 0 && errorText(newErrors, s) && (
            <p className="text-sm text-danger">{errorText(newErrors, s)}</p>
          )}
          <Button onClick={handleAdd} disabled={newText.length === 0 || newErrors.length > 0}>
            {s.addButton}
          </Button>
        </div>
      </section>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.builtInLabel}</h2>
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-2xl border border-indigo/10 bg-surface p-3">
          {LEVELS.map((level) => (
            <div key={level}>
              <p className="mb-1.5 font-body text-sm font-semibold text-indigo/70">
                {levelLabel[level]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {locale.categories
                  .filter((category) => category.level === level)
                  .map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full border border-indigo/10 bg-cream px-2.5 py-1 font-body text-sm text-ink/80"
                    >
                      {category.text}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button variant="secondary" onClick={onBack}>
        {s.back}
      </Button>
    </ScreenShell>
  )
}
