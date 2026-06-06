/** Shared button class strings — consistent hover lift + cursor across dashboards */

const interactive =
  'cursor-pointer transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0'

const hoverLift =
  'hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(13,92,96,0.16)] active:translate-y-0 active:scale-[0.98] disabled:active:scale-100'

export const btnPrimary = `${interactive} ${hoverLift} bg-primary text-on-primary font-label-md rounded-lg hover:bg-on-primary-fixed-variant`

export const btnSecondary = `${interactive} ${hoverLift} bg-secondary text-on-secondary font-label-md rounded-lg hover:bg-secondary/90`

export const btnOutline = `${interactive} ${hoverLift} border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md rounded-lg hover:bg-surface-container hover:border-primary/40`

export const btnGhost = `${interactive} text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container hover:text-primary`

export const btnDanger = `${interactive} ${hoverLift} border border-error text-error font-label-md rounded-lg hover:bg-error/10`

export const btnDangerSolid = `${interactive} ${hoverLift} bg-error/20 border border-error text-white font-label-md rounded-lg hover:bg-error`

export const btnSuccess = `${interactive} ${hoverLift} bg-secondary/10 text-secondary font-label-md rounded-lg hover:bg-secondary/20 border border-secondary/30`

export const btnCoral = `${interactive} ${hoverLift} bg-vibrant-coral text-white font-label-md rounded-lg hover:bg-[#ff5252] shadow-sm`

export const btnSoft = `${interactive} bg-secondary-container text-on-secondary-container font-label-md rounded-lg hover:bg-secondary-fixed border border-transparent hover:shadow-sm`

export const btnIcon = `${interactive} p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary`

export const btnIconSuccess = `${interactive} p-2 rounded-lg hover:bg-secondary/10 text-secondary hover:shadow-sm`

export const btnIconDanger = `${interactive} p-2 rounded-lg hover:bg-error/10 text-error hover:shadow-sm`

export const btnFilter = (active: boolean) =>
  `${interactive} whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md border ${
    active
      ? `${hoverLift} bg-primary text-on-primary border-transparent hover:bg-on-primary-fixed-variant shadow-sm`
      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container hover:text-primary hover:border-primary/30 hover:shadow-sm'
  }`

export const btnPackage = (selected: boolean) =>
  `${interactive} text-left bg-surface-container-lowest rounded-xl p-stack-md border ${
    selected
      ? `${hoverLift} border-primary ring-2 ring-primary/20 shadow-ambient`
      : 'border-outline-variant hover:border-primary/40 hover:shadow-ambient hover:-translate-y-0.5'
  }`

export const btnLink = `${interactive} text-primary hover:underline hover:text-on-primary-fixed-variant`

export const btnTextDanger = `${interactive} text-error font-label-md hover:underline hover:text-error/80`

export const btnToggle = `${interactive} rounded-full relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:opacity-90`
