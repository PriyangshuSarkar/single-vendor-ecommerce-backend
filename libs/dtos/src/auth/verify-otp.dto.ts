import { z } from 'zod';

// ✅ Verify OTP Request Schema (Zod)
export const VerifyOtpRequestBodyDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  })
  .refine((data) => (data.email ? !data.phone : data.phone), {
    message: 'Either email or phone must be provided, but not both.',
    path: ['email', 'phone'], // Affects both fields in error messages
  });

// ✅ TypeScript Type Inference for Request DTO
export type VerifyOtpRequestBodyDto = z.infer<typeof VerifyOtpRequestBodyDto>;

// ✅ Verify OTP Request Schema (Zod)
export const VerifyOtpPayloadDto = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}\d{10}$/)
      .optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  })
  .refine((data) => (data.email ? !data.phone : data.phone), {
    message: 'Either email or phone must be provided, but not both.',
    path: ['email', 'phone'], // Affects both fields in error messages
  });

// ✅ TypeScript Type Inference for Request DTO
export type VerifyOtpPayloadDto = z.infer<typeof VerifyOtpPayloadDto>;

// ✅ Verify OTP Response Schema (Zod)
export const VerifyOtpResponseDto = z.object({
  token: z.string().trim(),
});

// ✅ TypeScript Type Inference for Response DTO
export type VerifyOtpResponseDto = z.infer<typeof VerifyOtpResponseDto>;
