import Link from "next/link";
import { Shield, MessageSquare, BarChart3, Bell, ArrowRight, Lock, Eye, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">Campus Echo</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 mesh-bg">
        {/* Background glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/20 text-sm text-indigo-300 mb-8">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Anonymous. Always Protected.</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Your Voice.{" "}
            <span className="gradient-text">Anonymous.</span>
            <br />
            Your Campus.{" "}
            <span className="gradient-text">Better.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Campus Echo is the secure, anonymous bridge between students and administration. 
            Share complaints, suggest improvements, and drive real change — without ever revealing your identity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base glow-sm">
                Start Anonymously
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 px-8 h-12 text-base">
                View Feed
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { label: "Posts Submitted", value: "2,400+" },
              { label: "Issues Resolved", value: "68%" },
              { label: "Active Students", value: "1,200+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-display font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Everything you need to be heard</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete platform designed to bridge the gap between student voices and administrative action.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                color: "from-indigo-500 to-purple-600",
                title: "Anonymous by Default",
                desc: "Your real identity is cryptographically protected. Other students and admins only see your randomly assigned alias like Echo#4821.",
              },
              {
                icon: MessageSquare,
                color: "from-blue-500 to-cyan-600",
                title: "Multiple Post Types",
                desc: "Complaints, suggestions, feedback, confessions, polls, and urgent reports — each designed for different situations.",
              },
              {
                icon: BarChart3,
                color: "from-purple-500 to-pink-600",
                title: "Real-time Analytics",
                desc: "Administration gets actionable insights with visual analytics on trending issues and resolution rates.",
              },
              {
                icon: Bell,
                color: "from-green-500 to-emerald-600",
                title: "Live Notifications",
                desc: "Get instant updates when your post status changes, when admins respond, or when announcements are made.",
              },
              {
                icon: Eye,
                color: "from-orange-500 to-red-600",
                title: "Status Tracking",
                desc: "Track every post through Pending → Under Review → In Progress → Resolved with full transparency.",
              },
              {
                icon: Zap,
                color: "from-yellow-500 to-orange-600",
                title: "Fast Resolution",
                desc: "Admin dashboard with moderation tools ensures issues don't sit idle. Real-time updates keep everyone informed.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 hover:border-white/15 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">How Campus Echo works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to make your voice heard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register Anonymously",
                desc: "Create an account with just your email. You receive a random alias like Echo#1842 — that's your only public identity.",
              },
              {
                step: "02",
                title: "Share Your Concern",
                desc: "Choose a category, describe your issue, upload evidence, and submit. Completely anonymous. Completely safe.",
              },
              {
                step: "03",
                title: "Track & Get Results",
                desc: "Administration reviews, responds, and updates the status. You get notified throughout without ever being exposed.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-8xl font-display font-bold text-white/[0.03] absolute -top-4 -left-2 select-none">
                  {item.step}
                </div>
                <div className="relative pl-4 border-l border-indigo-500/30">
                  <div className="text-indigo-400 font-mono text-sm font-bold mb-3">{item.step}</div>
                  <h3 className="font-display font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section id="privacy" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/5" />
            <div className="relative">
              <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-4xl font-display font-bold mb-6">Privacy-First Architecture</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                We built Campus Echo with anonymity at the core, not as an afterthought. 
                Your identity is protected at every layer.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                {[
                  "Real identities never shown to other students",
                  "Anonymous aliases randomly generated",
                  "No IP logging or behavioral tracking",
                  "Encrypted internal identifiers only",
                  "Admin access requires multi-level auth",
                  "Right to delete all your data",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is my identity truly anonymous?",
                a: "Yes. Your email is only used for account recovery. Publicly, you appear only as a randomly assigned alias like Echo#1842. Other students cannot trace posts back to you.",
              },
              {
                q: "Can admins see who I am?",
                a: "Admins can only see your anonymous alias. Identity revelation is only possible in extreme legal situations and requires formal institutional procedures — it is never casual or routine.",
              },
              {
                q: "What types of issues can I report?",
                a: "Anything campus-related: academic issues, faculty concerns, infrastructure problems, hostel issues, harassment, mental health support, and more.",
              },
              {
                q: "How long does it take to resolve issues?",
                a: "Administration is notified immediately. Most posts receive an initial response within 48 hours. The status tracking system keeps you updated throughout.",
              },
              {
                q: "Can I delete my posts?",
                a: "Yes. You can delete your own posts and comments at any time. Deletion removes them from public view immediately.",
              },
            ].map((faq) => (
              <div key={faq.q} className="glass-card p-6">
                <h4 className="font-semibold text-white mb-3">{faq.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to make your{" "}
            <span className="gradient-text">campus better?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of students who are already shaping their campus experience — anonymously.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-14 text-base glow-primary">
              Get Started — It&apos;s Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold">Campus Echo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 Campus Echo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
