import Navigation from "@/components/ui/Navigation"

export default function PremiumCoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      {children}
    </div>
  )
}
