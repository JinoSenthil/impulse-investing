'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { User, Bell, Lock, Globe, Smartphone, Shield, Eye } from 'lucide-react'

export default function SettingsPage() {
    const settingsSections = [
        {
            title: 'Profile Settings',
            icon: <User className="w-6 h-6 text-accent-gold" />,
            items: [
                { label: 'Full Name', value: 'John Trader', type: 'text' },
                { label: 'Email Address', value: 'john.trader@example.com', type: 'email' },
                { label: 'Phone Number', value: '+91 98765 43210', type: 'tel' },
                { label: 'Trading Experience', value: '3-5 Years', type: 'select' }
            ]
        },
        {
            title: 'Notification Preferences',
            icon: <Bell className="w-6 h-6 text-accent-gold" />,
            items: [
                { label: 'Email Notifications', value: true, type: 'toggle' },
                { label: 'SMS Alerts', value: true, type: 'toggle' },
                { label: 'Push Notifications', value: false, type: 'toggle' },
                { label: 'Trading Signals', value: true, type: 'toggle' },
                { label: 'Course Updates', value: true, type: 'toggle' },
                { label: 'Community Activity', value: false, type: 'toggle' }
            ]
        },
        {
            title: 'Security',
            icon: <Lock className="w-6 h-6 text-accent-gold" />,
            items: [
                { label: 'Two-Factor Authentication', value: true, type: 'toggle' },
                { label: 'Login Alerts', value: true, type: 'toggle' },
                { label: 'Session Timeout', value: '30 minutes', type: 'select' }
            ]
        },
        {
            title: 'Preferences',
            icon: <Globe className="w-6 h-6 text-accent-gold" />,
            items: [
                { label: 'Language', value: 'English', type: 'select' },
                { label: 'Timezone', value: 'IST (UTC+5:30)', type: 'select' },
                { label: 'Currency Display', value: 'INR (₹)', type: 'select' },
                { label: 'Theme', value: 'Dark', type: 'select' }
            ]
        }
    ]

    return (
        <DashboardPageWrapper title="Settings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {settingsSections.map((section, idx) => (
                        <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-border flex items-center gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold">{section.title}</h2>
                            </div>
                            <div className="p-5 md:p-6 space-y-6">
                                {section.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="font-semibold mb-1 text-sm md:text-base truncate">{item.label}</div>
                                            {item.type !== 'toggle' && (
                                                <div className="text-xs md:text-sm text-text-secondary truncate">{item.value as string}</div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {item.type === 'toggle' ? (
                                                <button
                                                    className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition ${item.value ? 'bg-accent-gold' : 'bg-bg-secondary'
                                                        }`}
                                                >
                                                    <div
                                                        className={`absolute top-0.5 md:top-1 w-5 h-5 bg-white rounded-full transition ${item.value ? 'right-0.5 md:right-1' : 'left-0.5 md:left-1'
                                                            }`}
                                                    />
                                                </button>
                                            ) : (
                                                <button className="text-accent-gold font-bold hover:underline text-sm md:text-base">
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border-2 border-red-500/30 rounded-2xl overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-red-500/30">
                            <h2 className="text-xl md:text-2xl font-bold text-red-400">Danger Zone</h2>
                        </div>
                        <div className="p-5 md:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="font-semibold mb-1 text-sm md:text-base">Delete Account</div>
                                    <div className="text-xs md:text-sm text-text-secondary">
                                        Permanently delete your account and all data
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto bg-red-500/20 text-red-400 px-6 py-2.5 rounded-xl font-bold hover:bg-red-500/30 transition text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 md:space-y-8">
                    {/* Account Status */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6">
                        <h3 className="text-lg font-bold mb-6">Account Status</h3>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="bg-bg-secondary p-2.5 rounded-xl">
                                    <Shield className="w-5 h-5 text-accent-green" />
                                </div>
                                <div>
                                    <div className="font-bold text-accent-green text-sm">Verified</div>
                                    <div className="text-[10px] md:text-xs text-text-secondary">Email & Phone</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-bg-secondary p-2.5 rounded-xl">
                                    <Lock className="w-5 h-5 text-accent-gold" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">2FA Enabled</div>
                                    <div className="text-[10px] md:text-xs text-text-secondary">Extra Security</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-bg-secondary p-2.5 rounded-xl">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Premium Member</div>
                                    <div className="text-[10px] md:text-xs text-text-secondary">Since Jan 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connected Devices */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6">
                        <h3 className="text-lg font-bold mb-6">Connected Devices</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-bg-secondary p-2.5 rounded-xl">
                                    <Smartphone className="w-5 h-5 text-accent-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm md:text-base">iPhone 14 Pro</div>
                                    <div className="text-xs text-text-secondary mb-1">Mumbai, India</div>
                                    <div className="text-[10px] font-bold text-accent-green uppercase tracking-wider">Active Now</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-bg-secondary p-2.5 rounded-xl">
                                    <Globe className="w-5 h-5 text-text-secondary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm md:text-base">Chrome on Windows</div>
                                    <div className="text-xs text-text-secondary mb-1">Mumbai, India</div>
                                    <div className="text-[10px] text-text-secondary uppercase tracking-wider">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-accent-gold/10 to-transparent border-2 border-accent-gold/30 rounded-2xl p-5 md:p-8">
                        <h3 className="font-bold text-lg mb-4">Need Help?</h3>
                        <div className="space-y-4">
                            <button className="w-full bg-bg-card border-2 border-border py-3 rounded-xl font-bold hover:border-accent-gold transition text-xs md:text-sm">
                                Contact Support
                            </button>
                            <button className="w-full bg-bg-card border-2 border-border py-3 rounded-xl font-bold hover:border-accent-gold transition text-xs md:text-sm">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 md:mt-12 flex justify-center sm:justify-end">
                <button className="w-full sm:w-auto bg-accent-gold text-bg-primary px-12 py-4 rounded-xl font-bold hover:bg-accent-gold/90 transition shadow-lg shadow-accent-gold/20 text-lg">
                    Save Changes
                </button>
            </div>
        </DashboardPageWrapper>
    )
}
