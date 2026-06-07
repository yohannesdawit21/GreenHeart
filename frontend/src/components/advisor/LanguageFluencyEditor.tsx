import { MaterialIcon } from '../MaterialIcon'
import { btnOutline } from '../layout/buttonStyles'
import type { AdvisorLanguage } from '@shared/contracts/models.advisor'
import { FLUENCY_LEVELS, LANGUAGE_OPTIONS, getLanguageByCode } from '@shared/advisor/languageOptions'
import { createEmptyLanguageRow } from '@shared/advisor/languageUtils'

const selectClass =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer'

const inputClass =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelClass = 'block font-label-md text-xs text-on-surface-variant mb-1'

interface LanguageFluencyEditorProps {
  languages: AdvisorLanguage[]
  onChange: (languages: AdvisorLanguage[]) => void
  maxRows?: number
}

export function LanguageFluencyEditor({ languages, onChange, maxRows = 15 }: LanguageFluencyEditorProps) {
  const usedCodes = new Set(languages.map((l) => l.code).filter(Boolean))

  const updateRow = (index: number, patch: Partial<AdvisorLanguage>) => {
    onChange(languages.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const handleLanguageSelect = (index: number, code: string) => {
    if (code === 'other') {
      updateRow(index, { code: 'other', name: '' })
      return
    }
    const option = getLanguageByCode(code)
    if (!option) return
    updateRow(index, { code: option.code, name: option.name })
  }

  const addRow = () => {
    if (languages.length >= maxRows) return
    onChange([...languages, createEmptyLanguageRow()])
  }

  const removeRow = (index: number) => {
    onChange(languages.filter((_, i) => i !== index))
  }

  const africaLangs = LANGUAGE_OPTIONS.filter((l) => l.group === 'africa')
  const worldLangs = LANGUAGE_OPTIONS.filter((l) => l.group === 'world')
  const otherLangs = LANGUAGE_OPTIONS.filter((l) => l.group === 'other')

  return (
    <div className="space-y-3">
      {languages.length === 0 && (
        <p className="text-sm text-on-surface-variant italic">
          Add at least one language you can offer sessions in.
        </p>
      )}

      {languages.map((row, index) => (
        <div
          key={`lang-row-${index}`}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3 items-end p-3 rounded-lg border border-outline-variant/50 bg-surface-container-low/30"
        >
          <div>
            <label className={labelClass}>Language</label>
            <div className="relative">
              <select
                className={selectClass}
                value={row.code || ''}
                onChange={(e) => handleLanguageSelect(index, e.target.value)}
                required
              >
                <option value="">Select language…</option>
                <optgroup label="African languages">
                  {africaLangs.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      disabled={usedCodes.has(lang.code) && row.code !== lang.code}
                    >
                      {lang.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Major world languages">
                  {worldLangs.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      disabled={usedCodes.has(lang.code) && row.code !== lang.code}
                    >
                      {lang.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {otherLangs.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <MaterialIcon
                name="expand_more"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base"
              />
            </div>
            {row.code === 'other' && (
              <input
                className={`${inputClass} mt-2`}
                placeholder="Enter language name"
                value={row.name}
                onChange={(e) => updateRow(index, { name: e.target.value.slice(0, 80) })}
                required
              />
            )}
          </div>

          <div>
            <label className={labelClass}>Fluency level</label>
            <div className="relative">
              <select
                className={selectClass}
                value={row.fluency}
                onChange={(e) =>
                  updateRow(index, { fluency: e.target.value as AdvisorLanguage['fluency'] })
                }
                required
              >
                {FLUENCY_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
              <MaterialIcon
                name="expand_more"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeRow(index)}
            className="flex items-center justify-center gap-1 text-on-surface-variant hover:text-error px-2 py-2.5 sm:mb-0"
            aria-label="Remove language"
          >
            <MaterialIcon name="delete" className="text-base" />
            <span className="text-xs sm:hidden">Remove</span>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={languages.length >= maxRows}
        className={`${btnOutline} text-sm py-2 px-4 flex items-center gap-2 w-full sm:w-auto justify-center`}
      >
        <MaterialIcon name="add" className="text-base" />
        Add language
      </button>
    </div>
  )
}

export function validateLanguages(languages: AdvisorLanguage[]): string | null {
  if (languages.length === 0) return 'Add at least one language you offer sessions in.'
  for (const lang of languages) {
    if (!lang.code) return 'Select a language for each row.'
    if (lang.code === 'other' && !lang.name.trim()) return 'Enter the name for custom languages.'
    if (!lang.fluency) return 'Select a fluency level for each language.'
  }
  const codes = languages.map((l) => (l.code === 'other' ? l.name.trim().toLowerCase() : l.code))
  if (new Set(codes).size !== codes.length) return 'Each language can only be listed once.'
  return null
}
