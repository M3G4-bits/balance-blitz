import { z } from 'zod';

// Transfer validation schema
export const transferSchema = z.object({
  amount: z.number()
    .positive({ message: "Amount must be greater than 0" })
    .max(1000000, { message: "Amount exceeds maximum limit" }),
  recipient: z.string()
    .trim()
    .min(2, { message: "Recipient name must be at least 2 characters" })
    .max(100, { message: "Recipient name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s\-']+$/, { message: "Recipient name can only contain letters, spaces, hyphens, and apostrophes" }),
  accountNumber: z.string()
    .trim()
    .length(10, { message: "Account number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
  bankName: z.string()
    .trim()
    .min(2, { message: "Bank name must be at least 2 characters" })
    .max(100, { message: "Bank name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s\-&.]+$/, { message: "Bank name contains invalid characters" }),
  sortCode: z.string()
    .trim()
    .regex(/^\d{2}-\d{2}-\d{2}$/, { message: "Sort code must be in format 12-34-56" }),
  description: z.string()
    .trim()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
});

export type TransferFormData = z.infer<typeof transferSchema>;

// OTP validation schema
export const otpSchema = z.object({
  code: z.string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only digits" })
});

// Security code validation schema
export const securityCodeSchema = z.object({
  code: z.string()
    .length(6, { message: "Security code must be exactly 6 characters" })
    .regex(/^[A-Z0-9]+$/, { message: "Security code must contain only uppercase letters and numbers" })
});

// TIN validation schema
export const tinSchema = z.object({
  tin: z.string()
    .trim()
    .min(9, { message: "TIN must be at least 9 digits" })
    .max(12, { message: "TIN must be less than 12 digits" })
    .regex(/^\d+$/, { message: "TIN must contain only digits" })
});
