import { z } from 'zod';

export const AddCredentialRequestBodyDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{7,14}$/, 'Invalid phone number format')
      .optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

export type AddCredentialRequestBodyDto = z.infer<
  typeof AddCredentialRequestBodyDto
>;

export const AddCredentialPayloadDto = z
  .object({
    id: z.string().trim(),
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{7,14}$/, 'Invalid phone number format')
      .optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

export type AddCredentialPayloadDto = z.infer<typeof AddCredentialPayloadDto>;

// ✅ Verify OTP Response Schema (Zod)
export const AddCredentialResponseDto = z.object({
  message: z.string(),
});

// ✅ TypeScript Type Inference for Response DTO
export type AddCredentialResponseDto = z.infer<typeof AddCredentialResponseDto>;
