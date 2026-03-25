import React from 'react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-bg-primary text-text-primary font-montserrat">
            <Navigation />

            <div className="pt-32 pb-20 px-8">
                <div className="w-[90%] max-w-[1800px] mx-auto">
                    <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-accent-gold mb-8 text-center">
                        Privacy Policy
                    </h1>

                    <div className="bg-bg-secondary/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-border/50 shadow-2xl">
                        <p className="text-text-secondary mb-8 leading-relaxed">
                            This Privacy Policy applies to the mobile application <strong>&quot;Impulse&quot;</strong>, which are developed and operated by <strong>SVJ Tech</strong>.
                        </p>

                        <section className="space-y-12">
                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    1. Information We Collect
                                </h2>
                                <ul className="space-y-4 text-text-secondary leading-relaxed">
                                    <li>
                                        <strong className="text-text-primary">User Registration Data:</strong> To use the app, you can register using your mobile number. Providing an email address is optional.
                                    </li>
                                    <li>
                                        <strong className="text-text-primary">App Data:</strong> Information related to courses you access, your progress, and any purchase requests is stored securely on our servers.
                                    </li>
                                    <li>
                                        <strong className="text-text-primary">Purchase Requests:</strong> If you request to purchase a course, the information you provide is used so our admin can contact you to complete the purchase.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    2. How We Use Your Information
                                </h2>
                                <ul className="list-disc list-inside space-y-3 text-text-secondary leading-relaxed marker:text-accent-gold">
                                    <li>To allow you to log in and access courses.</li>
                                    <li>To track your course progress on our servers.</li>
                                    <li>To process purchase requests and contact you regarding your order.</li>
                                    <li>To communicate updates about your courses, if you choose to provide an email.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    3. Data Storage
                                </h2>
                                <ul className="list-disc list-inside space-y-3 text-text-secondary leading-relaxed marker:text-accent-gold">
                                    <li>All registration, course, and purchase request data is stored securely on our servers.</li>
                                    <li>We implement appropriate security measures to protect your information from unauthorized access.</li>
                                    <li>We do not share your personal information with third parties without your consent.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    4. Third-Party Services
                                </h2>
                                <p className="text-text-secondary leading-relaxed">
                                    The app does not use third-party payment gateways, analytics, advertising, or cloud storage.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    5. Your Rights
                                </h2>
                                <ul className="list-disc list-inside space-y-3 text-text-secondary leading-relaxed marker:text-accent-gold">
                                    <li>You can request deletion of your account and personal data by contacting us.</li>
                                    <li>You can update your mobile number or email in the app settings at any time.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    6. Changes to This Privacy Policy
                                </h2>
                                <ul className="list-disc list-inside space-y-3 text-text-secondary leading-relaxed marker:text-accent-gold">
                                    <li>We may update this Privacy Policy occasionally.</li>
                                    <li>The latest version will always be available within the app.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-accent-gold mb-4 border-b border-border/30 pb-2">
                                    7. Contact Us
                                </h2>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    If you have questions about this Privacy Policy, please contact us at:
                                </p>
                                <a
                                    href="mailto:sales@svjtechnologies.com"
                                    className="text-accent-gold hover:text-accent-gold/80 transition-colors font-medium text-lg"
                                >
                                    sales@svjtechnologies.com
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
