import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Code2, Trophy, Zap, Users, BarChart3, Shield, BookOpen, Target, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export function Home() {
  return (
    <div className="flex flex-col items-center -mx-4">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full flex flex-col items-center justify-center py-24 md:py-32 px-4 overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative text-center space-y-6 max-w-4xl z-10"
        >
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block text-xs font-bold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5"
          >
            The Ultimate Coding Arena
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white/70 pb-2 leading-[1.1]"
          >
            Master the Art of Coding
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of developers on Hash4 Arena to practice, compete, and sharpen your algorithmic skills with real-time feedback.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link to="/problems">
              <Button size="lg" className="rounded-full px-8 font-bold text-black border-none shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Start Solving <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/contests">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Contests
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 bg-surface/80 backdrop-blur-sm border border-white/5 rounded-2xl px-8 py-6 max-w-3xl w-full"
        >
          <StatItem value="500+" label="Problems" />
          <StatItem value="10K+" label="Users" />
          <StatItem value="50+" label="Contests" />
          <StatItem value="99.9%" label="Uptime" />
        </motion.div>
      </section>

      {/* ─── What We Do Section ─── */}
      <section className="w-full py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary/70">What We Do</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Everything You Need to Level Up
            </h2>
            <p className="text-textMuted mt-4 max-w-2xl mx-auto text-lg">
              Hash4 Arena is a complete platform for competitive programming — from daily practice to live contests and rankings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Code2}
              title="Diverse Problem Set"
              description="Hundreds of curated problems from easy to hard, covering arrays, trees, graphs, DP, and more."
              delay={0}
            />
            <FeatureCard
              icon={Trophy}
              title="Competitive Contests"
              description="Participate in weekly rated contests to test your skills and climb the global rankings."
              delay={1}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Feedback"
              description="Get real-time verdicts on your submissions with detailed execution time and memory metrics."
              delay={2}
            />
            <FeatureCard
              icon={BarChart3}
              title="Progress Tracking"
              description="Visualize your growth with detailed stats, submission history, and difficulty breakdowns."
              delay={3}
            />
            <FeatureCard
              icon={Shield}
              title="Secure Judge"
              description="Sandboxed code execution ensuring fair evaluation with support for multiple languages."
              delay={4}
            />
            <FeatureCard
              icon={Users}
              title="Global Community"
              description="Compete with programmers worldwide and see where you stand on the live leaderboard."
              delay={5}
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="w-full py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary/70">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Three Steps to Greatness
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard step={1} icon={BookOpen} title="Pick a Problem" description="Browse our problem library filtered by difficulty, topic, or contest. Find exactly what matches your level." />
            <StepCard step={2} icon={Target} title="Code & Submit" description="Write your solution in our built-in editor with syntax highlighting and submit against hidden test cases." />
            <StepCard step={3} icon={Rocket} title="Climb the Ranks" description="Earn points for accepted solutions, compete in contests, and track your progress on the global leaderboard." />
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us Section ─── */}
      <section className="w-full py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Why Hash4 Arena</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 text-white leading-tight">
                Built by Developers,<br />for Developers
              </h2>
              <p className="text-textMuted mt-4 leading-relaxed">
                We believe that deliberate practice with quality problems is the fastest path to CS mastery. Our platform is designed to remove friction and keep you focused on what matters — writing great code.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Multi-language support (C++, Java, Python, JS)',
                  'Real-time contest leaderboards',
                  'Detailed submission analytics',
                  'Clean, distraction-free editor',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text/90">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 font-bold text-black border-none">
                    Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full" />
              <div className="relative bg-surface border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-xs text-textMuted mb-4">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/60" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <span className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono">solution.cpp</span>
                </div>
                <pre className="font-mono text-sm text-text/70 leading-relaxed overflow-hidden">
{`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    cout << a[n/2] << endl;
    return 0;
}`}
                </pre>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Accepted
                  </span>
                  <span className="text-xs text-textMuted ml-auto font-mono">12ms · 2.1MB</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="w-full py-20 px-4 border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white/70">
            Ready to Start?
          </h2>
          <p className="text-textMuted mt-4 text-lg">
            Create your free account and solve your first problem in under a minute.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/register">
              <Button size="lg" className="rounded-full px-10 font-bold text-black border-none shadow-lg shadow-primary/20">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/problems">
              <Button variant="outline" size="lg" className="rounded-full px-10">
                Browse Problems
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-black text-white">{value}</p>
      <p className="text-xs text-textMuted mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={fadeUp}
      custom={delay}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/30 transition-all duration-300"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
      <p className="text-textMuted text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ step, icon: Icon, title, description }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={fadeUp}
      custom={step}
      className="relative text-center p-8"
    >
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center text-xs font-bold text-primary -mt-2">
        {step}
      </div>
      <h3 className="text-lg font-bold text-white mb-2 mt-2">{title}</h3>
      <p className="text-textMuted text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
