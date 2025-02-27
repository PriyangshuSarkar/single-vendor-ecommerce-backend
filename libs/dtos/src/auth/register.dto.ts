import { z } from 'zod';

// ✅ Signup Request Schema (Zod)
export const RegisterRequestBodyDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().trim().min(1, 'Name is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

// ✅ TypeScript Type Inference
export type RegisterRequestBodyDto = z.infer<typeof RegisterRequestBodyDto>;

export const RegisterPayloadDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().trim().min(1, 'Name is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

// ✅ TypeScript Type Inference
export type RegisterPayloadDto = z.infer<typeof RegisterPayloadDto>;

// ✅ Signup Response Schema (Zod)
export const RegisterResponseDto = z.object({
  message: z.string(),
});

// ✅ TypeScript Type for Response
export type RegisterResponseDto = z.infer<typeof RegisterResponseDto>;
