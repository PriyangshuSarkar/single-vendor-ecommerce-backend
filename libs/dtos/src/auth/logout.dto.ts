import { z } from 'zod';

export const LogoutRequestBodyDto = z
  .object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.sessionId || data.userId, {
    message: 'Either sessionId or userId must be provided',
    path: ['sessionId', 'userId'],
  });

export type LogoutRequestBodyDto = z.infer<typeof LogoutRequestBodyDto>;

export const LogoutPayloadDto = z
  .object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.sessionId || data.userId, {
    message: 'Either sessionId or userId must be provided',
    path: ['sessionId', 'userId'],
  });

export type LogoutPayloadDto = z.infer<typeof LogoutPayloadDto>;

// ✅ Verify OTP Response Schema (Zod)
export const LogoutResponseDto = z.object({
  token: z.string(),
});
// ✅ TypeScript Type Inference for Response DTO
export type LogoutResponseDto = z.infer<typeof LogoutResponseDto>;
