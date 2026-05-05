import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Lock, Eye, Footprints, Heart, Moon } from "lucide-react";

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[#030304] text-white selection:bg-primary/20 selection:text-primary relative overflow-hidden py-16 px-6 font-sans">
      {/* Background Grids & Ambient Glows */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-fade pointer-events-none opacity-[0.25]" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation & Header */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary dark:text-[#FDBA74] bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            <ShieldCheck size={12} /> Google Verified Security
          </div>
        </div>

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight mb-4 leading-none">
            Privacy <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-[#94A3B8] font-mono text-xs uppercase tracking-widest">
            Last Updated: May 25, 2026
          </p>
        </motion.div>

        {/* Policy Contents */}
        <div className="space-y-12">
          {/* Card 1: Core Commitment */}
          <section className="p-8 rounded-3xl bg-[#0F1115]/80 border border-white/5 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-heading font-extrabold mb-3">Our Commitment to Your Privacy</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">
                  Vokey Fitness AI values the security of your health and fitness data. This Privacy Policy outlines our procedures regarding the collection, synchronization, and secure storage of health telemetry fetched from your Google Fit accounts. We promise to never sell, lease, or distribute your fitness parameters under any circumstances.
                </p>
              </div>
            </div>
          </section>

          {/* Card 2: Google Fit Scopes */}
          <section className="p-8 rounded-3xl bg-[#0F1115]/80 border border-white/5 backdrop-blur-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-[#FFD600]/10 border border-[#FFD600]/20 text-[#FFD600] shrink-0">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="text-xl font-heading font-extrabold mb-2">Information Collected & Google Fit Scopes</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">
                  Vokey Fitness AI utilizes restricted Google Fit cloud APIs to fetch and synchronize specific fitness telemetry required for your daily workout analytics. We request user consent explicitly for the following scopes:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Scope 1 */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2.5 text-green-500 font-bold mb-2">
                  <Footprints size={16} />
                  <span className="font-heading text-xs uppercase tracking-wider">Step Count</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Reads com.google.step_count.delta to calculate steps taken, active minutes, and estimated walking distance for consistency progress.
                </p>
              </div>

              {/* Scope 2 */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2.5 text-primary font-bold mb-2">
                  <Heart size={16} />
                  <span className="font-heading text-xs uppercase tracking-wider">Heart Rate</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Queries com.google.heart_rate.bpm to record your daily heart rate beats per minute (bpm) average during exercises and recovery periods.
                </p>
              </div>

              {/* Scope 3 */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2.5 text-purple-500 font-bold mb-2">
                  <Moon size={16} />
                  <span className="font-heading text-xs uppercase tracking-wider">Sleep Segment</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Pulls com.google.sleep.segment records to display your nightly sleep duration in hours, assisting your AI coach in recovery splits.
                </p>
              </div>
            </div>
          </section>

          {/* Card 3: Data Usage & Retention */}
          <section className="p-8 rounded-3xl bg-[#0F1115]/80 border border-white/5 backdrop-blur-xl space-y-6">
            <h3 className="text-xl font-heading font-extrabold">Data Storage & Control</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              * **Secure Storage**: All health logs are stored securely inside our encrypted MongoDB database. Security logs and parameter injections are locked under specialized security middlewares.
              * **Data Revocation**: Users maintain absolute control. You can manually sever the connection immediately by clicking "Disconnect" on your Dashboard. Additionally, you can revoke access at any time directly through your Google Account Settings &rarr; Linked Apps portal.
              * **Account Deletion**: Deleting your account instantly and permanently wipes all your stored user credentials, profiles, routines, and telemetry records from our systems forever.
            </p>
          </section>

          {/* Card 4: Contact */}
          <section className="p-8 rounded-3xl bg-[#0F1115]/80 border border-white/5 backdrop-blur-xl text-center space-y-4">
            <h3 className="text-xl font-heading font-extrabold">Questions or Feedback?</h3>
            <p className="text-[#94A3B8] text-sm max-w-lg mx-auto leading-relaxed">
              If you have any questions, compliance concerns, or data requests regarding this Privacy Policy, please contact our support team at:
            </p>
            <a href="mailto:ramsreeram29@gmail.com" className="inline-block font-mono text-sm font-bold text-primary hover:underline">
              ramsreeram29@gmail.com
            </a>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
          <p>© 2026 Vokey Fitness AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
