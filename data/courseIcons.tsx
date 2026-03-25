import { BookOpen, Zap, Crosshair, Droplets } from 'lucide-react'
import type { IconName } from './courseData'

export function getCourseIcon(
  iconName: IconName,
  className: string = "w-8 h-8 text-accent-gold"
) {
  const icons = {
    book: <BookOpen className={className} />,
    bolt: <Zap className={className} />,
    crosshairs: <Crosshair className={className} />,
    water: <Droplets className={className} />,
  } as const

  return icons[iconName]
}
