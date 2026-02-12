export interface DateOfBirth {
  month: number
  year: number
}

/**
 * Calculate the approximate age from a date of birth
 * Note: Companies House only provides month and year, not the exact day
 * We'll use the middle of the month (15th) for calculation
 */
export function calculateAge(dob: DateOfBirth): number {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed

  let age = currentYear - dob.year

  // Adjust if birthday hasn't occurred yet this year
  if (currentMonth < dob.month) {
    age--
  }

  return age
}

/**
 * Check if a director is within the retirement age range
 */
export function isRetirementAge(age: number, minAge: number = 60, maxAge: number = 75): boolean {
  return age >= minAge && age <= maxAge
}

/**
 * Format date of birth for display
 */
export function formatDateOfBirth(dob: DateOfBirth): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[dob.month - 1]} ${dob.year}`
}
