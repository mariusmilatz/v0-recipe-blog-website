export function parseTimeToMinutes(timeString: string | null | undefined): number {
  if (!timeString) return 0

  // Remove any extra whitespace and convert to lowercase
  const cleanTime = timeString.toLowerCase().trim()

  // Extract numbers and time units
  const hourMatch = cleanTime.match(/(\d+)\s*h/)
  const minuteMatch = cleanTime.match(/(\d+)\s*m/)

  let totalMinutes = 0

  if (hourMatch) {
    totalMinutes += Number.parseInt(hourMatch[1]) * 60
  }

  if (minuteMatch) {
    totalMinutes += Number.parseInt(minuteMatch[1])
  }

  // If no specific format found, try to extract just the number and assume minutes
  if (totalMinutes === 0) {
    const numberMatch = cleanTime.match(/(\d+)/)
    if (numberMatch) {
      totalMinutes = Number.parseInt(numberMatch[1])
    }
  }

  return totalMinutes
}

export function formatMinutesToTime(minutes: number): string {
  if (minutes === 0) return "30 mins" // Default fallback

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? "s" : ""}`
    } else {
      return `${hours} hr${hours !== 1 ? "s" : ""} ${remainingMinutes} min${remainingMinutes !== 1 ? "s" : ""}`
    }
  }
}

export function calculateTotalTime(prepTime: string | null | undefined, cookTime: string | null | undefined): string {
  const prepMinutes = parseTimeToMinutes(prepTime)
  const cookMinutes = parseTimeToMinutes(cookTime)
  const totalMinutes = prepMinutes + cookMinutes

  if (totalMinutes === 0) {
    // If no total time, try to return the available time
    if (cookMinutes > 0) return formatMinutesToTime(cookMinutes)
    if (prepMinutes > 0) return formatMinutesToTime(prepMinutes)
    return "Time N/A"
  }

  return formatMinutesToTime(totalMinutes)
}
