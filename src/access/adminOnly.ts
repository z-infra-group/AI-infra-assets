import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

// TODO: Enhance with proper role-based access control when Users collection has a role field
// For now, any authenticated user can perform admin operations
// In production, consider adding: role field to Users, or email-based admin checks
export const adminOnly: isAdmin = ({ req: { user } }) => {
  return Boolean(user)
}
