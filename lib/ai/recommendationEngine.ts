export interface Job {
  id: string;
  title: string;
  tags: string[];
  location: string;
}

export const rankJobsForUser = (userSkills: string[], userLocation: string, jobs: Job[]) => {
  return jobs.map(job => {
    let score = 0;
    
    // Skill Match (highest weight)
    const matches = job.tags.filter(tag => userSkills.includes(tag)).length;
    score += (matches * 10);

    // Location Match (Zambian local preference)
    if (job.location === userLocation) {
      score += 5;
    }

    return { ...job, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);
};