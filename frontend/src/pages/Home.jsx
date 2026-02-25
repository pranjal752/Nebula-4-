import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Code2, Trophy, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white/70 pb-2">
          Master the Art of Coding
        </h1>
        <p className="text-xl text-textMuted max-w-2xl mx-auto">
          Join thousands of developers on Nebula to practice, compete, and improve your algorithmic skills.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/problems">
            <Button size="lg" className="rounded-full px-8 font-bold text-black border-none">Start Solving</Button>
          </Link>
          <Link to="/contests">
            <Button variant="outline" size="lg" className="rounded-full px-8">View Contests</Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
        <FeatureCard 
          icon={Code2} 
          title="Diverse Problem Set" 
          description="Hundreds of problems ranging from easy to hard, covering all major data structures and algorithms."
        />
        <FeatureCard 
          icon={Trophy} 
          title="Competitive Contests" 
          description="Participate in weekly contests to test your skills against the best programmers worldwide."
        />
        <FeatureCard 
          icon={Zap} 
          title="Instant Feedback" 
          description="Get real-time verdicts on your submissions with detailed execution metrics."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/30 transition-colors"
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-textMuted">{description}</p>
    </motion.div>
  );
}
