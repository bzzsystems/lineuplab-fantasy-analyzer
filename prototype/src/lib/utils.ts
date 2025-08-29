import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(points: number): string {
  return points.toFixed(1)
}

export function getPerformanceColor(score: number, maxScore: number = 10): string {
  const percentage = score / maxScore
  if (percentage >= 0.8) return "text-green-600"
  if (percentage >= 0.6) return "text-yellow-600"
  if (percentage >= 0.4) return "text-orange-600"
  return "text-red-600"
}

export function getPerformanceIcon(points: number): string {
  if (points >= 25) return "🔥"
  if (points >= 20) return "🏆"
  if (points >= 15) return "💪"
  if (points >= 10) return "✅"
  if (points >= 5) return "📈"
  if (points > 0) return "📉"
  return "🚨"
}