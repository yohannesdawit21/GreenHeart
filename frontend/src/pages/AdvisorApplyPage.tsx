import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { Logo } from '../components/Logo'
import { PasswordInput } from '../components/PasswordInput'
import { btnPrimary, btnOutline } from '../components/layout/buttonStyles'
import { FormError } from '../components/layout/dashboard-ui'
import { LanguageFluencyEditor, validateLanguages } from '../components/advisor/LanguageFluencyEditor'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'
import { buildAdvisorBio } from '../utils/advisorApplicationBio'
import {
  clearAdvisorApplyDraft,
  loadAdvisorApplyDraft,
  saveAdvisorApplyDraft,
} from '../utils/advisorApplyDraft'
import { formatLanguagesList } from '@shared/advisor/languageUtils'
import type { AdvisorCredentials } from '@shared/contracts/models.advisor'
import { EMPTY_ADVISOR_CREDENTIALS, OTHER_OPTION } from '@shared/contracts/models.advisor'
import {
  COUNTRY_REGIONS,
  DEGREE_OPTIONS,
  getCredentialTypesForRegionProfession,
  getIssuingBodiesForRegionCredential,
  getRegionsByGroup,
  getSpecialtiesForCategory,
  isOtherSelection,
  isUsRegion,
  PROFESSION_TYPES,
  resolveCredentialTypeDisplay,
  resolveIssuingBodyDisplay,
  resolveRegionDisplay,
  SESSION_RATE_OPTIONS,
  SPECIALTY_CATEGORIES,
  US_STATE_REGIONS,
} from '@shared/advisor/credentialOptions'

const STEPS = [
  { id: 1, title: 'Account', icon: 'person' },
  { id: 2, title: 'Languages', icon: 'translate' },
  { id: 3, title: 'Credentials', icon: 'badge' },
  { id: 4, title: 'Practice', icon: 'medical_services' },
  { id: 5, title: 'Review', icon: 'fact_check' },
] as const

const inputClass =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline'

const selectClass = `${inputClass} appearance-none cursor-pointer`

const labelClass = 'block font-label-md text-label-md text-on-surface-variant mb-unit'

type ApplyLocationState = {
  email?: string
  password?: string
  username?: string
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  grouped,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[] | readonly { id: string; label: string }[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  grouped?: Record<string, readonly { id: string; label: string }[]>
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <select
          className={`${selectClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
        >
          <option value="">{placeholder ?? 'Select…'}</option>
          {grouped
            ? Object.entries(grouped).map(([groupLabel, items]) => (
                <optgroup key={groupLabel} label={groupLabel}>
                  {items.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((opt) =>
                typeof opt === 'string' ? (
                  <option key={opt} value={opt}>
                    {opt === OTHER_OPTION ? 'Other / not listed' : opt}
                  </option>
                ) : (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ),
              )}
        </select>
        <MaterialIcon
          name="expand_more"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        />
      </div>
    </div>
  )
}

function WizardProgress({ step }: { step: number }) {
  return (
    <div className="mb-stack-lg">
      <div className="flex items-center mb-3">
        {STEPS.map((s, i) => {
          const active = step === s.id
          const done = step > s.id
          return (
            <div key={s.id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    active
                      ? 'bg-primary border-primary text-on-primary'
                      : done
                        ? 'bg-secondary-container border-secondary text-on-secondary-container'
                        : 'bg-surface-container-low border-outline-variant text-outline'
                  }`}
                >
                  {done ? (
                    <MaterialIcon name="check" className="text-base" />
                  ) : (
                    <MaterialIcon name={s.icon} className="text-base" />
                  )}
                </div>
                <span
                  className={`text-[9px] sm:text-xs font-label-md text-center truncate max-w-[4.5rem] sm:max-w-none ${
                    active ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 sm:mx-2 rounded-full ${
                    step > s.id ? 'bg-secondary' : 'bg-outline-variant/40'
                  }`}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-xs text-on-surface-variant mt-2 text-center">
        Step {step} of {STEPS.length} — {STEPS[step - 1].title}
      </p>
    </div>
  )
}

export function AdvisorApplyPage() {
  const location = useLocation()
  const prefilled = (location.state as ApplyLocationState | null) ?? {}

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(prefilled.email ?? '')
  const [password, setPassword] = useState(prefilled.password ?? '')
  const [confirmPassword, setConfirmPassword] = useState(prefilled.password ?? '')
  const [username, setUsername] = useState(prefilled.username ?? '')
  const [credentials, setCredentials] = useState<AdvisorCredentials>({ ...EMPTY_ADVISOR_CREDENTIALS })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [coinRatePerSession, setCoinRatePerSession] = useState(100)
  const [approach, setApproach] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  const { registerAdvisor } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const draft = loadAdvisorApplyDraft()
    if (!draft) return
    if (!prefilled.email && draft.email) setEmail(draft.email)
    if (!prefilled.username && draft.username) setUsername(draft.username)
    if (draft.step > 1) setStep(draft.step)
    if (draft.credentials) setCredentials({ ...EMPTY_ADVISOR_CREDENTIALS, ...draft.credentials })
    if (draft.selectedTags?.length) setSelectedTags(draft.selectedTags)
    if (draft.coinRatePerSession) setCoinRatePerSession(draft.coinRatePerSession)
    if (draft.approach) setApproach(draft.approach)
    setDraftRestored(true)
  }, [])

  useEffect(() => {
    if (step === 1 && !email && !username) return
    saveAdvisorApplyDraft({
      step,
      email,
      username,
      credentials,
      selectedTags,
      coinRatePerSession,
      approach,
    })
  }, [step, email, username, credentials, selectedTags, coinRatePerSession, approach])

  useEffect(() => {
    if (prefilled.email) setEmail(prefilled.email)
    if (prefilled.password) {
      setPassword(prefilled.password)
      setConfirmPassword(prefilled.password)
    }
    if (prefilled.username) setUsername(prefilled.username)
  }, [prefilled.email, prefilled.password, prefilled.username])

  const regionGroups = getRegionsByGroup()
  const credentialOptions = getCredentialTypesForRegionProfession(
    credentials.issuingRegion,
    credentials.professionType,
  )
  const issuingBodyOptions = credentials.credentialType
    ? getIssuingBodiesForRegionCredential(credentials.issuingRegion, credentials.credentialType)
    : []
  const specialtyOptions = credentials.specialtyCategory
    ? getSpecialtiesForCategory(credentials.specialtyCategory)
    : []

  const setCredentialField = <K extends keyof AdvisorCredentials>(key: K, value: AdvisorCredentials[K]) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const handleRegionChange = (issuingRegion: string) => {
    setCredentials((prev) => ({
      ...prev,
      issuingRegion,
      issuingRegionOther: issuingRegion === OTHER_OPTION ? prev.issuingRegionOther : isUsRegion(issuingRegion) ? prev.issuingRegionOther : '',
      professionType: '',
      credentialType: '',
      credentialTypeOther: '',
      issuingBody: '',
      issuingBodyOther: '',
    }))
  }

  const handleProfessionChange = (professionType: string) => {
    setCredentials((prev) => ({
      ...prev,
      professionType,
      credentialType: '',
      credentialTypeOther: '',
      issuingBody: '',
      issuingBodyOther: '',
    }))
  }

  const handleCredentialTypeChange = (credentialType: string) => {
    setCredentials((prev) => ({
      ...prev,
      credentialType,
      credentialTypeOther: isOtherSelection(credentialType) ? prev.credentialTypeOther : '',
      issuingBody: '',
      issuingBodyOther: '',
    }))
  }

  const handleSpecialtyCategoryChange = (specialtyCategory: string) => {
    setCredentialField('specialtyCategory', specialtyCategory)
    setSelectedTags([])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 8 ? [...prev, tag] : prev,
    )
  }

  const addCustomTag = () => {
    const tag = customTag.trim()
    if (!tag || selectedTags.includes(tag) || selectedTags.length >= 8) return
    setSelectedTags((prev) => [...prev, tag.slice(0, 50)])
    setCustomTag('')
  }

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!email.trim()) return 'Email is required.'
      if (password.length < 8) return 'Password must be at least 8 characters.'
      if (password !== confirmPassword) return 'Passwords do not match.'
      if (username.trim().length < 2) return 'Display name is required.'
    }
    if (s === 2) {
      return validateLanguages(credentials.languages)
    }
    if (s === 3) {
      if (!credentials.issuingRegion) return 'Select your country or licensing region.'
      if (isOtherSelection(credentials.issuingRegion) && !credentials.issuingRegionOther?.trim()) {
        return 'Enter your country or region.'
      }
      if (isUsRegion(credentials.issuingRegion) && !credentials.issuingRegionOther?.trim()) {
        return 'Select your US licensing state.'
      }
      if (!credentials.professionType) return 'Select your profession type.'
      if (!credentials.credentialType) return 'Select your credential or license type.'
      if (isOtherSelection(credentials.credentialType) && !credentials.credentialTypeOther?.trim()) {
        return 'Enter your credential or license type.'
      }
      if (!credentials.issuingBody) return 'Select the issuing body or board.'
      if (isOtherSelection(credentials.issuingBody) && !credentials.issuingBodyOther?.trim()) {
        return 'Enter the issuing body or board.'
      }
      if (!credentials.licenseNumber.trim()) return 'License or certification number is required.'
      if (!credentials.professionalTitle.trim()) return 'Professional title is required.'
      if (credentials.yearsExperience < 0) return 'Years of experience is required.'
    }
    if (s === 4) {
      if (!credentials.specialtyCategory) return 'Select a primary focus area.'
      if (selectedTags.length === 0) return 'Select at least one specialty.'
      if (approach.trim().length < 40) return 'Please write at least a few sentences about your approach.'
      if (coinRatePerSession < 20) return 'Set a valid session rate.'
    }
    if (s === 5) {
      if (!termsAccepted) return 'You must accept the advisor terms to submit.'
    }
    return null
  }

  const goNext = () => {
    setError('')
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    setError('')
    for (let s = 1; s <= STEPS.length; s++) {
      const err = validateStep(s)
      if (err) {
        setError(err)
        setStep(s)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const bio = buildAdvisorBio(credentials, approach)
      await registerAdvisor({
        email,
        password,
        profile: {
          username: username.trim(),
          bio,
          tags: selectedTags,
          coinRatePerSession,
          credentials,
        },
      })
      clearAdvisorApplyDraft()
      navigate('/advisor', { state: { applicationSubmitted: true } })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Application submission failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col justify-between w-1/3 bg-secondary-container p-margin-desktop text-on-secondary relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-stack-sm mb-stack-md">
            <Logo className="w-12 h-12" />
            <h1 className="font-display-lg text-display-lg text-primary">Green Heart</h1>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-stack-md">Join Our Network of Advisors</h2>
          <p className="font-body-lg text-body-lg text-on-secondary-container max-w-md mb-stack-lg">
            Share your expertise and help our global community achieve holistic health and balance.
          </p>
          <ul className="space-y-3 text-sm text-on-secondary-container">
            {[
              'Five-step application with languages & structured credentials',
              'Africa-focused licensing bodies and global coverage',
              'Partners review credentials before video verification',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <MaterialIcon name="check_circle" className="text-secondary shrink-0 text-base" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 mt-auto pt-stack-lg">
          <p className="font-label-md text-label-md text-on-secondary-container uppercase tracking-widest">
            Expertise. Empathy. Growth.
          </p>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex items-start justify-center p-margin-mobile md:p-margin-desktop bg-surface relative overflow-y-auto">
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl p-stack-lg my-stack-lg transition-all duration-300 relative z-10">
          <div className="mb-stack-md">
            <Link to="/auth" className="text-primary flex items-center gap-1 font-label-md hover:underline mb-stack-sm">
              <MaterialIcon name="arrow_back" className="text-sm" />
              Back to login
            </Link>
            <h2 className="font-display-md text-display-md text-on-surface">Advisor application</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Complete each step — partners use this profile during verification.
            </p>
          </div>

          <WizardProgress step={step} />

          {draftRestored && (
            <p className="text-xs text-secondary bg-secondary-container/20 border border-secondary/20 rounded-lg px-3 py-2 mb-stack-md">
              Your previous application progress was restored. Password is not saved — re-enter it on step 1 if needed.
            </p>
          )}

          {error && <FormError className="mb-stack-md">{error}</FormError>}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="md:col-span-2">
                <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface mb-stack-sm flex items-center gap-2">
                  <MaterialIcon name="person" className="text-secondary" />
                  Account details
                </h3>
              </div>
              <div>
                <label className={labelClass}>Display name</label>
                <input className={inputClass} type="text" placeholder="Dr. Jane Smith" value={username} onChange={(e) => setUsername(e.target.value)} minLength={2} required />
              </div>
              <div>
                <label className={labelClass}>Email address</label>
                <input className={inputClass} type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <PasswordInput value={password} onChange={setPassword} placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} required />
              </div>
              <div>
                <label className={labelClass}>Confirm password</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" autoComplete="new-password" minLength={8} required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-stack-md">
              <div>
                <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface mb-stack-sm flex items-center gap-2">
                  <MaterialIcon name="translate" className="text-secondary" />
                  Languages & fluency
                </h3>
                <p className="text-sm text-on-surface-variant mb-stack-sm">
                  Add every language you can offer sessions in, with your fluency level. African languages are listed first.
                </p>
              </div>
              <LanguageFluencyEditor
                languages={credentials.languages}
                onChange={(languages) => setCredentialField('languages', languages)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="md:col-span-2">
                <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface mb-stack-sm flex items-center gap-2">
                  <MaterialIcon name="badge" className="text-secondary" />
                  Professional credentials
                </h3>
                <p className="text-sm text-on-surface-variant mb-stack-sm">
                  Select your licensing country, profession, credential type, and issuing body.
                </p>
              </div>
              <SelectField
                label="Country / licensing region"
                value={credentials.issuingRegion}
                onChange={handleRegionChange}
                options={COUNTRY_REGIONS}
                grouped={{
                  Africa: regionGroups.africa,
                  Americas: regionGroups.americas,
                  Europe: regionGroups.europe,
                  'Asia-Pacific': regionGroups.asia_pacific,
                  'Middle East': regionGroups.middle_east,
                  Other: regionGroups.other,
                }}
                placeholder="Select country…"
                required
              />
              {isOtherSelection(credentials.issuingRegion) && (
                <div>
                  <label className={labelClass}>Country / region (specify)</label>
                  <input
                    className={inputClass}
                    placeholder="Enter country or region"
                    value={credentials.issuingRegionOther ?? ''}
                    onChange={(e) => setCredentialField('issuingRegionOther', e.target.value)}
                    required
                  />
                </div>
              )}
              {isUsRegion(credentials.issuingRegion) && (
                <SelectField
                  label="US licensing state"
                  value={credentials.issuingRegionOther ?? ''}
                  onChange={(v) => setCredentialField('issuingRegionOther', v)}
                  options={US_STATE_REGIONS}
                  placeholder="Select state…"
                  required
                />
              )}
              <SelectField
                label="Profession type"
                value={credentials.professionType}
                onChange={handleProfessionChange}
                options={PROFESSION_TYPES}
                placeholder={credentials.issuingRegion ? 'Select profession…' : 'Choose country first'}
                required
                disabled={!credentials.issuingRegion}
              />
              <SelectField
                label="Credential / license type"
                value={credentials.credentialType}
                onChange={handleCredentialTypeChange}
                options={credentialOptions}
                placeholder={credentials.professionType ? 'Select credential…' : 'Choose profession first'}
                required
                disabled={!credentials.professionType}
              />
              {isOtherSelection(credentials.credentialType) && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Credential type (specify)</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Licensed Clinical Psychologist"
                    value={credentials.credentialTypeOther ?? ''}
                    onChange={(e) => setCredentialField('credentialTypeOther', e.target.value)}
                    required
                  />
                </div>
              )}
              <SelectField
                label="Issuing body / board"
                value={credentials.issuingBody}
                onChange={(v) =>
                  setCredentials((prev) => ({
                    ...prev,
                    issuingBody: v,
                    issuingBodyOther: isOtherSelection(v) ? prev.issuingBodyOther : '',
                  }))
                }
                options={issuingBodyOptions}
                placeholder={credentials.credentialType ? 'Select issuing body…' : 'Choose credential first'}
                required
                disabled={!credentials.credentialType}
              />
              {isOtherSelection(credentials.issuingBody) && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Issuing body (specify)</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. National Medical Council"
                    value={credentials.issuingBodyOther ?? ''}
                    onChange={(e) => setCredentialField('issuingBodyOther', e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>License / certification number</label>
                <input
                  className={inputClass}
                  placeholder="e.g. PSY12345, HPCSA MP 0123456"
                  value={credentials.licenseNumber}
                  onChange={(e) => setCredentialField('licenseNumber', e.target.value)}
                  required
                />
              </div>
              <SelectField
                label="Highest relevant degree"
                value={credentials.degree ?? ''}
                onChange={(v) => setCredentialField('degree', v)}
                options={DEGREE_OPTIONS}
                placeholder="Select degree (optional)"
              />
              <div>
                <label className={labelClass}>Professional title</label>
                <input
                  className={inputClass}
                  placeholder="Licensed Clinical Psychologist"
                  value={credentials.professionalTitle}
                  onChange={(e) => setCredentialField('professionalTitle', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Years of experience</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={60}
                  value={credentials.yearsExperience || ''}
                  onChange={(e) => setCredentialField('yearsExperience', Number(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Additional board certifications (optional)</label>
                <input
                  className={inputClass}
                  placeholder="e.g. NBCC, ABPP, EMDR certified"
                  value={credentials.additionalCertifications ?? ''}
                  onChange={(e) => setCredentialField('additionalCertifications', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 gap-stack-md">
              <div>
                <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface mb-stack-sm flex items-center gap-2">
                  <MaterialIcon name="medical_services" className="text-secondary" />
                  Practice & specialties
                </h3>
              </div>
              <SelectField
                label="Primary focus area"
                value={credentials.specialtyCategory ?? ''}
                onChange={handleSpecialtyCategoryChange}
                options={SPECIALTY_CATEGORIES}
                placeholder="Select category…"
                required
              />
              <div>
                <label className={labelClass}>
                  Specialties & focus areas (up to 8)
                  {!credentials.specialtyCategory && (
                    <span className="text-xs font-normal ml-1">— choose a category first</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2 mb-stack-sm">
                  {specialtyOptions.map((tag) => {
                    const active = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={!credentials.specialtyCategory}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                          active
                            ? 'bg-secondary-container text-on-secondary-container border-secondary'
                            : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1 py-2 text-sm`}
                    placeholder="Add custom specialty"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                      }
                    }}
                  />
                  <button type="button" onClick={addCustomTag} className={`${btnOutline} text-sm px-4 shrink-0`}>
                    Add
                  </button>
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-secondary mt-2">Selected: {selectedTags.join(', ')}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Session rate (coins per consultation)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SESSION_RATE_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCoinRatePerSession(rate)}
                      className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                        coinRatePerSession === rate
                          ? 'bg-primary-container text-on-primary-container border-primary'
                          : 'border-outline-variant hover:border-primary/40'
                      }`}
                    >
                      {rate} coins
                    </button>
                  ))}
                </div>
                <input
                  className={`${inputClass} max-w-xs`}
                  type="number"
                  min={20}
                  max={500}
                  step={5}
                  value={coinRatePerSession}
                  onChange={(e) => setCoinRatePerSession(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelClass}>Your approach & who you help</label>
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  placeholder="Describe your therapeutic approach and the types of clients you work best with…"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">{approach.length}/40 characters minimum</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-stack-md">
              <h3 className="font-label-md text-sm font-bold uppercase tracking-wide text-on-surface flex items-center gap-2">
                <MaterialIcon name="fact_check" className="text-secondary" />
                Review your application
              </h3>
              <div className="rounded-lg border border-outline-variant/60 bg-surface-container-low/40 p-stack-md space-y-stack-sm text-sm">
                <div className="grid sm:grid-cols-2 gap-stack-sm">
                  <p><span className="text-on-surface-variant">Name:</span> {username}</p>
                  <p><span className="text-on-surface-variant">Email:</span> {email}</p>
                  <p className="sm:col-span-2">
                    <span className="text-on-surface-variant">Languages:</span>{' '}
                    {credentials.languages.length ? formatLanguagesList(credentials.languages) : '—'}
                  </p>
                  <p><span className="text-on-surface-variant">Region:</span>{' '}
                    {resolveRegionDisplay(credentials.issuingRegion, credentials.issuingRegionOther) || '—'}
                  </p>
                  <p><span className="text-on-surface-variant">Title:</span> {credentials.professionalTitle || '—'}</p>
                  <p><span className="text-on-surface-variant">Credential:</span>{' '}
                    {resolveCredentialTypeDisplay(credentials.credentialType, credentials.credentialTypeOther) || '—'}
                  </p>
                  <p><span className="text-on-surface-variant">License #:</span> {credentials.licenseNumber || '—'}</p>
                  <p><span className="text-on-surface-variant">Issuing body:</span>{' '}
                    {resolveIssuingBodyDisplay(credentials.issuingBody, credentials.issuingBodyOther) || '—'}
                  </p>
                  <p><span className="text-on-surface-variant">Experience:</span> {credentials.yearsExperience} years</p>
                  <p><span className="text-on-surface-variant">Rate:</span> {coinRatePerSession} coins</p>
                </div>
                <p><span className="text-on-surface-variant">Specialties:</span> {selectedTags.join(', ') || '—'}</p>
                <p className="text-on-surface-variant italic line-clamp-4">{approach || '—'}</p>
              </div>
              <div className="flex items-start gap-stack-sm rounded-lg bg-primary-container/10 border border-primary/20 p-stack-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 shrink-0"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="font-label-md text-label-md text-on-surface-variant text-sm">
                  I agree to the Advisor Terms of Service and confirm that all credentials and information provided are
                  accurate. I understand I must pass partner video verification before accepting patient consultations.
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-stack-sm mt-stack-lg pt-stack-md border-t border-outline-variant/40">
            {step > 1 ? (
              <button type="button" onClick={goBack} className={`${btnOutline} py-3 px-6 flex items-center justify-center gap-2`}>
                <MaterialIcon name="arrow_back" className="text-sm" />
                Back
              </button>
            ) : (
              <div className="hidden sm:block flex-1" />
            )}
            {step < STEPS.length ? (
              <button type="button" onClick={goNext} className={`${btnPrimary} py-3 px-6 flex-1 flex items-center justify-center gap-2`}>
                Continue
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${btnPrimary} py-4 flex-1 flex justify-center items-center gap-stack-sm shadow-lg`}
              >
                {isSubmitting ? 'Submitting application…' : 'Submit application'}
                <MaterialIcon name="send" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
