import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Install: npm install clsx tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToMediaType(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,/);
  return (matches?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
}

export function stripBase64Prefix(dataUrl: string) {
  return dataUrl.replace(/^data:[^;]+;base64,/, '');
}
