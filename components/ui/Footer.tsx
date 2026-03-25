export default function Footer() {
  return (
    <footer className="py-16 px-8 border-t border-border bg-bg-primary text-text-primary">
      <div className="w-[90%] max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="font-cinzel text-2xl font-bold text-accent-gold mb-4">IMPULSE</div>
            <p className="text-text-secondary leading-relaxed font-medium">
              Empowering traders worldwide with professional tools, expert education, and cutting-edge
              strategies to succeed in the financial markets.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-text-primary font-cinzel tracking-wider uppercase">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#indicators" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Indicators</a></li>
              <li><a href="#courses" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Courses</a></li>
              <li><a href="#news" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Market News</a></li>
              <li><a href="#enroll" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-text-primary font-cinzel tracking-wider uppercase">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">About Us</a></li>
              <li><a href="#contact" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Contact</a></li>
              <li><a href="#" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Blog</a></li>
              <li><a href="#" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-text-primary font-cinzel tracking-wider uppercase">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/privacy-policy" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Privacy Policy</a></li>
              <li><a href="#" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Terms of Service</a></li>
              <li><a href="#" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Disclaimer</a></li>
              <li><a href="#" className="inline-block text-text-secondary hover:text-accent-gold hover:translate-x-1 transition-all duration-300 font-medium">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-text-secondary text-sm font-medium">
          <p>© 2026 IMPULSE. All rights reserved. Trade responsibly. Past performance is not indicative of future results.</p>
        </div>
      </div>
    </footer>
  )
}
