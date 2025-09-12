import { NextResponse } from 'next/server';
import { ApiResponse } from '../types';

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status });
}

export function validateRequired(obj: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (!obj[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}