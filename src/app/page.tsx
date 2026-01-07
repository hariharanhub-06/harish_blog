"use client";

import { ArrowRight, Code, Briefcase, Award, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const profileName = "Hari Haran Jeyaramamoorthy";
  const profileHeadline = "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro";

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 blur-[120px] opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 glass text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm border-white/50"
        >
          <Sparkles size={14} className="text-accent" />
          <span>Available for new opportunities</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black font-poppins text-gray-900 mb-8 tracking-tight leading-[1.05]"
        >
          Crafting Digital <br />
          <span className="text-primary italic relative">
            Excellence
            <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/20 -z-10 rotate-1" />
          </span>
          <span className="text-gray-900">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-secondary max-w-3xl mb-12 leading-relaxed font-medium"
        >
          Hi, I&apos;m <span className="text-gray-900 font-bold">{profileName}</span>.
          <span className="block mt-2 opacity-80">{profileHeadline}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <Link
            href="/portfolio"
            className="group bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1"
          >
            <span>Explore My Work</span>
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-lg hover:border-primary/20 hover:bg-gray-50 transition-all text-center flex items-center justify-center shadow-sm hover:shadow-lg"
          >
            Let&apos;s Talk
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Years Experience", value: "3+", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Projects Completed", value: "10+", icon: Code, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Clubs Led", value: "5+", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Colleges Partnered", value: "42", icon: User, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-white transition-all duration-500 overflow-hidden relative"
            >
              <span className="absolute -bottom-4 -right-2 text-9xl font-black text-gray-50 group-hover:text-gray-100 transition-colors -z-10">{stat.value.replace('+', '')}</span>

              <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
              <p className="text-secondary text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section Preview */}
      <section className="container mx-auto px-6 mt-12 mb-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Recent Projects</h2>
            <div className="w-24 h-2 bg-accent rounded-full"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm group overflow-hidden">
            <div className="h-80 bg-gray-50 rounded-[2.5rem] mb-8 flex items-center justify-center overflow-hidden">
              <div className="text-primary font-black text-6xl opacity-10 group-hover:scale-125 transition-transform duration-700">S.M</div>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">startupmenswear.in</h3>
              <p className="text-secondary font-medium leading-relaxed mb-8">Tech Founder; developed using Python, Firebase, and Razorpay for a seamless e-commerce experience.</p>
              <Link href="/portfolio" className="text-primary font-black flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                <span>View Details</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="container mx-auto px-6 mt-12">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-6xl font-black text-white mb-8 font-poppins relative z-10 leading-tight tracking-tight">
            Ready to Start Your Next <br /> <span className="text-accent underline decoration-8 underline-offset-8">Great Project</span>?
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-3 bg-white text-primary px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1 relative z-10"
          >
            <span>Get Started Now</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
