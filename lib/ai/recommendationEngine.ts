import type { Job, RecommendedJob } from "@/lib/types"

const normalize = (value: string) => value.trim().toLowerCase()

export const rankJobsForUser = (
  userSkills: string[],
  userLocation: string,
  jobs: Job[],
  trustScore = 75,
): RecommendedJob[] => {
  const normalizedSkills = userSkills.map(normalize)
  const normalizedLocation = normalize(userLocation)

  return jobs
    .map((job) => {
      const normalizedTags = job.tags.map(normalize)
      const matchedTags = normalizedTags.filter((tag) =>
        normalizedSkills.some((skill) => skill.includes(tag) || tag.includes(skill)),
      )
      const matchedCertifications = job.certifications.filter((certification) =>
        normalizedSkills.some((skill) =>
          normalize(certification).includes(skill) || skill.includes(normalize(certification)),
        ),
      )
      const matchedTools = job.tools.filter((tool) =>
        normalizedSkills.some((skill) =>
          normalize(tool).includes(skill) || skill.includes(normalize(tool)),
        ),
      )

      let score = matchedTags.length * 22
      const reasons = matchedTags.map((tag) => `Matches ${tag}`)

      if (matchedCertifications.length > 0) {
        score += Math.min(matchedCertifications.length * 10, 20)
        reasons.push("Relevant certification or compliance experience")
      }

      if (matchedTools.length > 0) {
        score += Math.min(matchedTools.length * 6, 12)
        reasons.push("Tooling experience overlaps with the role")
      }

      if (normalize(job.location) === normalizedLocation) {
        score += 12
        reasons.push("Local delivery context aligns")
      } else if (job.remote) {
        score += 8
        reasons.push("Remote-friendly engagement")
      } else if (job.workMode === "onsite") {
        score += 4
        reasons.push("On-site opportunity expands marketplace footprint")
      }

      if (trustScore >= 85) {
        score += 10
        reasons.push("High trust score unlocks premium roles")
      } else if (trustScore >= 70) {
        score += 5
        reasons.push("Trust level supports shortlist placement")
      }

      return {
        ...job,
        matchScore: Math.min(score, 100),
        reasons: reasons.slice(0, 3),
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}
