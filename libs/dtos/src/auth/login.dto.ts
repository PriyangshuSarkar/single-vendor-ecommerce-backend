import { z } from 'zod';

export const LoginRequestBodyDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

export type LoginRequestBodyDto = z.infer<typeof LoginRequestBodyDto>;

export const LoginPayloadDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

export type LoginPayloadDto = z.infer<typeof LoginPayloadDto>;

// ✅ Verify OTP Response Schema (Zod)
export const LoginResponseDto = z.object({
  token: z.string(),
});
// ✅ TypeScript Type Inference for Response DTO
export type LoginResponseDto = z.infer<typeof LoginResponseDto>;
