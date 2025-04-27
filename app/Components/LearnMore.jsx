import React from 'react'

const LearnMore = () => {
    return (
        <>
            <main className="flex-1 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    <section className="bg-white/5 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-blue-500/20 shadow-lg">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 flex items-center">
                            <Zap className="mr-2 w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                            Why Swift Cause?
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Mobile-First Fundraising:</strong> In today&apos;s world, mobile is key. Swift Cause prioritizes
                                    mobile interactions, making it easy for donors to contribute directly from their smartphones.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Designed for Growth:</strong> Starting with a focus on the UK, Swift Cause is built for global
                                    expansion, supporting multi-currency and localization.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Effortless Campaign Management:</strong> Our intuitive interface simplifies campaign creation,
                                    with UK-specific features like Gift Aid integration.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Real-Time Insights:</strong> Stay informed with our live fund tracking dashboard, powered by Firebase.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Team Collaboration:</strong>  Facilitate teamwork with role-based permissions for campaign management.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Engage and Connect:</strong> Build relationships with donors through in-app notifications, email updates, and social sharing.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Transparent Financial Management:</strong> Track funds, fees, and payouts with clarity.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>UK Focused, Globally Ready:</strong>  Designed for the UK with global expansion in mind.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Built on Robust Technology:</strong>  Leverages Firebase, Next.js, and Kotlin Multiplatform for a secure and efficient platform.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <ArrowRight className="text-blue-400 mt-1.5 w-5 h-5 sm:w-6 sm:h-6" />
                                <p className="text-gray-200 text-base sm:text-lg">
                                    <strong>Open Source and Community Driven:</strong>  Encourages collaboration and continuous improvement.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    )
}

export default LearnMore