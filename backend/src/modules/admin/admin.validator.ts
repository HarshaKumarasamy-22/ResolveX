import { z } from 'zod';

export const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'] as const;
export const validPriorities = ['Low', 'Medium', 'High', 'Critical'] as const;
export const validRoles = ['user', 'admin'] as const;

export const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']),
  note: z.string().optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export const assignRequestSchema = z.object({
  assigned_to: z.number().int().positive('Assignee user ID must be a positive integer'),
});

export const updateUserSchema = z.object({
  is_active: z.boolean().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const adminRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'priority', 'status', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});
