import { z } from 'zod';

// ✅ Validate Token Request Schema (Zod)
export const ValidateAccessTokenRequestBodyDto = z.object({});

// ✅ TypeScript Type Inference for Request DTO
export type ValidateAccessTokenRequestBodyDto = z.infer<
  typeof ValidateAccessTokenRequestBodyDto
>;

// ✅ Validate Token Request Schema (Zod)
export const ValidateAccessTokenPayloadDto = z.object({
  token: z.string(),
});

// ✅ TypeScript Type Inference for Request DTO
export type ValidateAccessTokenPayloadDto = z.infer<
  typeof ValidateAccessTokenPayloadDto
>;

// ✅ Validate Token Response Schema (Zod)
export const ValidateAccessTokenResponseDto = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
  })
  .optional();

// ✅ TypeScript Type Inference for Response DTO
export type ValidateAccessTokenResponseDto = z.infer<
  typeof ValidateAccessTokenResponseDto
>;
