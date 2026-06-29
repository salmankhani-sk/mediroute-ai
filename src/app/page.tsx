import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
          Find the Right Doctor,{' '}
          <span className="text-primary-600">Fast</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered healthcare platform for Peshawar. Describe your symptoms,
          find specialists, book appointments, chat with our AI, and locate the nearest hospital — all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/symptoms"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
          >
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Check Symptoms Now
          </Link>
          <Link
            href="/hospitals"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find Hospitals
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          icon={
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          }
          title="AI Symptom Checker"
          description="Describe your symptoms and our Groq-powered AI analyzes them to recommend the right specialist and urgency level."
        />
        <FeatureCard
          icon={
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
          title="Nearest Hospitals"
          description="Find Peshawar hospitals near you — LRH, KTH, HMC, RMI and more. Distance calculated with GPS and mapped on OpenStreetMap."
        />
        <FeatureCard
          icon={
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          }
          title="MediBot AI Chat"
          description="Chat with our AI medical assistant for health tips, general questions, and guidance on which doctor to visit."
        />
      </section>

      {/* Stats */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value="5+" label="Partner Hospitals" />
          <StatItem value="50+" label="Verified Doctors" />
          <StatItem value="20+" label="Departments" />
          <StatItem value="24/7" label="AI Available" />
        </div>
      </section>

      {/* How It Works */}
      <section className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <StepItem number={1} title="Describe Symptoms" description="Enter your symptoms in plain English or Roman Urdu" />
          <StepItem number={2} title="AI Analysis" description="Our AI analyzes and recommends the right specialist" />
          <StepItem number={3} title="Find Hospital" description="See the nearest Peshawar hospitals on the map" />
          <StepItem number={4} title="Book Appointment" description="Select a doctor and book your appointment" />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary-600">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
