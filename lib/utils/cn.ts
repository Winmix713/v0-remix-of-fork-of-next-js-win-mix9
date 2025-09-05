import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility for conditional classes with better type safety
export function conditionalClass(condition: boolean, trueClass: string, falseClass?: string): string {
  return condition ? trueClass : falseClass || ""
}

// Utility for variant-based classes
export function variantClass(variant: string, variants: Record<string, string>, defaultVariant = "default"): string {
  return variants[variant] || variants[defaultVariant] || ""
}
