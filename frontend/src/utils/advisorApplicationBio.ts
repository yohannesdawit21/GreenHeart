/** Parsed fields from advisor apply form (stored in profiles.bio). */
export interface ParsedAdvisorApplication {
  professionalTitle?: string
  credentials?: string
  yearsExperience?: string
  approach?: string
  rawBio: string
  isStructured: boolean
}

export function parseAdvisorApplicationBio(bio: string): ParsedAdvisorApplication {
  const rawBio = bio?.trim() ?? ''
  if (!rawBio) {
    return { rawBio: '', isStructured: false }
  }

  const [headerPart, ...rest] = rawBio.split('\n---\n')
  const approach = rest.join('\n---\n').trim() || undefined

  let professionalTitle: string | undefined
  let credentials: string | undefined
  let yearsExperience: string | undefined
  let isStructured = false

  for (const line of headerPart.split('\n')) {
    if (line.startsWith('Title: ')) {
      professionalTitle = line.slice(7).trim()
      isStructured = true
    } else if (line.startsWith('Credentials: ')) {
      credentials = line.slice(13).trim()
      isStructured = true
    } else if (line.startsWith('Experience: ')) {
      yearsExperience = line.slice(12).replace(/ years$/, '').trim()
      isStructured = true
    }
  }

  if (!isStructured) {
    return { approach: rawBio, rawBio, isStructured: false }
  }

  return {
    professionalTitle,
    credentials,
    yearsExperience,
    approach,
    rawBio,
    isStructured: true,
  }
}
