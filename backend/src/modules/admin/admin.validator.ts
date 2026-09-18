import { z } from 'zod';

export const adminRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  assigned_team: z.string().optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
  requester_role: z.enum(['student', 'lecturer', 'staff', 'support_staff', 'admin', 'user']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'priority', 'status', 'title', 'request_code', 'department']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']),
  note: z.string().max(500).optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
});

export const assignRequestSchema = z.object({
  assigned_to: z.number().int().positive('Assignee user ID must be a positive integer').optional(),
  assigned_team: z.string().min(2, 'Support team name is required').optional(),
}).refine(data => data.assigned_to !== undefined || data.assigned_team !== undefined, {
  message: 'Must provide either assigned_to or assigned_team',
});

export const updateUserSchema = z.object({
  is_active: z.boolean().optional(),
  role: z.enum(['student', 'lecturer', 'staff', 'support_staff', 'admin', 'user']).optional(),
  department: z.string().optional(),
});

export type AdminRequestQueryParams = z.infer<typeof adminRequestQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
