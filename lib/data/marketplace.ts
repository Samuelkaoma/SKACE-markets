import { adminSeeds, demoAccounts, employerProfiles, freelancerSeeds } from "@/lib/data/demo-users"
import {
  activityLogSeeds,
  applicationSeeds,
  disputeSeeds,
  escrowSeeds,
  fraudFlags,
  hireSeeds,
  jobPostings,
  reviewSeeds,
  trustEventSeeds,
} from "@/lib/data/demo-workflows"
import { platformSignals } from "@/lib/data/demo-signals"

export {
  adminSeeds,
  activityLogSeeds,
  applicationSeeds,
  demoAccounts,
  disputeSeeds,
  employerProfiles,
  escrowSeeds,
  fraudFlags,
  freelancerSeeds,
  hireSeeds,
  jobPostings,
  platformSignals,
  reviewSeeds,
  trustEventSeeds,
}

export const marketplaceSeed = {
  freelancers: freelancerSeeds,
  employers: employerProfiles,
  admins: adminSeeds,
  jobs: jobPostings,
  applications: applicationSeeds,
  hires: hireSeeds,
  escrows: escrowSeeds,
  reviews: reviewSeeds,
  disputes: disputeSeeds,
  fraudFlags,
  trustEvents: trustEventSeeds,
  activityLogs: activityLogSeeds,
  platformSignals,
}
