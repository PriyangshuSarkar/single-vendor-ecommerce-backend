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
  sessionId: z.string(),
  token: z.string(),
  userId: z.string().optional(),
});

// ✅ TypeScript Type Inference for Request DTO
export type RefreshAccessTokenPayloadDto = z.infer<
  typeof RefreshAccessTokenPayloadDto
>;

// ✅ Validate Token Response Schema (Zod)
export const RefreshAccessTokenResponseDto = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
  })
  .optional();

// ✅ TypeScript Type Inference for Response DTO
export type RefreshAccessTokenResponseDto = z.infer<
  typeof RefreshAccessTokenResponseDto
>;
