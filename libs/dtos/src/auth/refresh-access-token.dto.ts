import { z } from 'zod';

// ✅ Validate Token Request Schema (Zod)
export const RefreshAccessTokenRequestBodyDto = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
});

// ✅ TypeScript Type Inference for Request DTO
export type RefreshAccessTokenRequestBodyDto = z.infer<
  typeof RefreshAccessTokenRequestBodyDto
>;

// ✅ Validate Token Request Schema (Zod)
export const RefreshAccessTokenPayloadDto = z.object({
  token: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
});

// ✅ TypeScript Type Inference for Request DTO
export type RefreshAccessTokenPayloadDto = z.infer<
  typeof RefreshAccessTokenPayloadDto
>;

// ✅ Validate Token Response Schema (Zod)
export const RefreshAccessTokenResponseDto = z.object({
  message: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  sessionId: z.string().optional(),
});

// ✅ TypeScript Type Inference for Response DTO
export type RefreshAccessTokenResponseDto = z.infer<
  typeof RefreshAccessTokenResponseDto
>;
