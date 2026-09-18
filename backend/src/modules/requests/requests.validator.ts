import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  category_id: z.coerce.number().int().positive('Valid category ID is required'),
  department: z.string().min(2, 'AIT Faculty/Department is required'),
  location: z.string().min(2, 'Campus location is required'),
  room_number: z.string().optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
});

export const requestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'priority', 'status', 'title', 'request_code']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type RequestQueryParams = z.infer<typeof requestQuerySchema>;
