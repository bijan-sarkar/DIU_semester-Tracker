import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Award, 
  Terminal, 
  Code2, 
  Cpu, 
  Server, 
  Compass, 
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Milestone {
  id: string;
  title: string;
  category: string;
  yearLevel: 'Year 1 (Level 1)' | 'Year 2 (Level 2)' | 'Year 3 (Level 3)' | 'Year 4 (Level 4)';
  school: 'Harvard' | 'MIT' | 'Stanford' | 'Global Tech / FAANG';
  description: string;
  whyItMatters: string;
  freeResources: { title: string; url: string }[];
}

const GLOBAL_MILESTONES: Milestone[] = [
  // Year 1 (Level 1)
  {
    id: 'harvard-cs50',
    title: 'Complete Harvard CS50x (Introduction to Computer Science)',
    category: 'Foundations & Problem Solving',
    yearLevel: 'Year 1 (Level 1)',
    school: 'Harvard',
    description: 'Beyond standard textbook theory, CS50 teaches rigorous memory management, low-level C pointers, arrays, data structures, and Python.',
    whyItMatters: 'Builds true computational thinking and coding discipline that sets top US university freshmen apart from standard rote learning.',
    freeResources: [
      { title: 'Harvard CS50x Official Course', url: 'https://cs50.harvard.edu/x/' },
      { title: 'CS50 EdX Free Audit', url: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science' }
    ]
  },
  {
    id: 'linux-cli-git',
    title: 'Linux CLI & Modern Git Workflow Mastery',
    category: 'Developer Tooling',
    yearLevel: 'Year 1 (Level 1)',
    school: 'MIT',
    description: 'Master terminal commands, shell scripting (Bash), SSH keys, Git branch rebasing, and professional pull-request workflows on GitHub.',
    whyItMatters: 'Global tech companies expect engineers to work inside remote Linux environments and collaborate with clean git trees from day one.',
    freeResources: [
      { title: 'The Missing Semester of Your CS Education (MIT)', url: 'https://missing.csail.mit.edu/' },
      { title: 'Pro Git Book (Free)', url: 'https://git-scm.com/book/en/v2' }
    ]
  },
  {
    id: 'memory-debugger',
    title: 'Memory Leak & Pointer Debugging with Valgrind & GDB',
    category: 'Systems Fundamentals',
    yearLevel: 'Year 1 (Level 1)',
    school: 'Harvard',
    description: 'Learn to use Valgrind to catch heap memory leaks, buffer overflows, and use GDB to inspect stack memory frames.',
    whyItMatters: 'DIU exams focus on pen-and-paper C syntax; global software engineers must know how to inspect runtime memory crashes.',
    freeResources: [
      { title: 'Valgrind Quick Start Guide', url: 'https://valgrind.org/docs/manual/quick-start.html' },
      { title: 'GDB Tutorial (Stanford)', url: 'https://web.stanford.edu/class/cs107/resources/gdb' }
    ]
  },

  // Year 2 (Level 2)
  {
    id: 'mit-6006',
    title: 'MIT 6.006: Introduction to Algorithms',
    category: 'Algorithms & Complexity',
    yearLevel: 'Year 2 (Level 2)',
    school: 'MIT',
    description: 'Deep dive into asymptotic analysis, balanced search trees (AVL/B-Trees), dynamic programming with subproblem memoization, and graph algorithms.',
    whyItMatters: 'MIT algorithms teaches mathematical proofs and invariant thinking, not just memorizing algorithm steps.',
    freeResources: [
      { title: 'MIT 6.006 Spring 2020 (OCW Course)', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' },
      { title: 'MIT 6.006 YouTube Lectures', url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP6317WaSNfmCvGym2ucw3B0U' }
    ]
  },
  {
    id: 'neetcode-150',
    title: 'NeetCode 150 & LeetCode Pattern Mastery',
    category: 'Coding Interview Prep',
    yearLevel: 'Year 2 (Level 2)',
    school: 'Global Tech / FAANG',
    description: 'Solve the top 150 algorithmic patterns: Two Pointers, Sliding Window, Monotonic Stack, Backtracking, Binary Search, Trees, and DP.',
    whyItMatters: 'Every top software company (Google, Amazon, Microsoft, Uber, Remote US startups) screens candidates using these exact patterns.',
    freeResources: [
      { title: 'NeetCode 150 Interactive Roadmap', url: 'https://neetcode.io/roadmap' },
      { title: 'Blind 75 Curated Questions', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions' }
    ]
  },
  {
    id: 'competitive-programming',
    title: 'Competitive Programming (Codeforces Div 2/3 & AtCoder)',
    category: 'Speed & Edge Cases',
    yearLevel: 'Year 2 (Level 2)',
    school: 'Global Tech / FAANG',
    description: 'Participate in live timed contests to master fast problem formulation, corner cases, integer overflow limits, and fast I/O.',
    whyItMatters: 'Builds supreme mental resilience and problem-solving speed under intense pressure.',
    freeResources: [
      { title: 'CP-Algorithms Handbook', url: 'https://cp-algorithms.com/' },
      { title: 'USACO Guide (Bronze to Gold)', url: 'https://usaco.guide/' }
    ]
  },

  // Year 3 (Level 3)
  {
    id: 'mit-os-xv6',
    title: 'MIT 6.S081: Operating Systems Engineering (xv6 Kernel)',
    category: 'Systems & Kernels',
    yearLevel: 'Year 3 (Level 3)',
    school: 'MIT',
    description: 'Write real system calls, page table handlers, trap dispatchers, and copy-on-write mechanisms in a live RISC-V kernel (xv6).',
    whyItMatters: 'DIU operating systems syllabus covers theory; MIT makes you write the kernel code yourself.',
    freeResources: [
      { title: 'MIT 6.S081 Course Home & Labs', url: 'https://pdos.csail.mit.edu/6.828/2023/' },
      { title: 'OSTEP Book (Operating Systems: Three Easy Pieces)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' }
    ]
  },
  {
    id: 'stanford-cs144',
    title: 'Stanford CS144: Computer Networks (Build a TCP Stack)',
    category: 'Networking Systems',
    yearLevel: 'Year 3 (Level 3)',
    school: 'Stanford',
    description: 'Implement an internet router, TCP receiver, sender, and retransmission timer from scratch in modern C++.',
    whyItMatters: 'Transforms abstract networking OSI layers into concrete packets, sequence numbers, and byte streams.',
    freeResources: [
      { title: 'Stanford CS144 Course Material', url: 'https://cs144.github.io/' }
    ]
  },
  {
    id: 'docker-cloud',
    title: 'Docker, Microservices & CI/CD Pipelines',
    category: 'DevOps & Cloud',
    yearLevel: 'Year 3 (Level 3)',
    school: 'Global Tech / FAANG',
    description: 'Containerize multi-service applications (backend + Postgres + Redis), create GitHub Actions CI/CD workflows, deploy to cloud.',
    whyItMatters: 'Modern software engineering is 50% writing code and 50% building reliable automated deployment pipelines.',
    freeResources: [
      { title: 'Docker Official Getting Started', url: 'https://docs.docker.com/get-started/' },
      { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }
    ]
  },

  // Year 4 (Level 4)
  {
    id: 'system-design-ddia',
    title: 'Designing Data-Intensive Applications (DDIA) & System Design',
    category: 'High-Scale Architecture',
    yearLevel: 'Year 4 (Level 4)',
    school: 'Global Tech / FAANG',
    description: 'Learn database internals (LSM-trees vs B-Trees), replication lag, partition rebalancing, caching layers, and message queues (Kafka).',
    whyItMatters: 'The bible of distributed backend engineering, universally required for Senior and Mid-level global engineering positions.',
    freeResources: [
      { title: 'System Design Primer (GitHub - 250k+ stars)', url: 'https://github.com/donnemartin/system-design-primer' },
      { title: 'Designing Data-Intensive Applications (O\'Reilly)', url: 'https://dataintensive.net/' }
    ]
  },
  {
    id: 'open-source-gsoc',
    title: 'Open Source Contribution (GSoC, Apache, Linux)',
    category: 'Global Engineering Community',
    yearLevel: 'Year 4 (Level 4)',
    school: 'Global Tech / FAANG',
    description: 'Contribute real bug fixes, documentation, or features to real-world open-source repositories with international maintainers.',
    whyItMatters: 'A public GitHub track record of merged pull requests is 10x more valuable to global recruiters than a standard university certificate.',
    freeResources: [
      { title: 'Google Summer of Code Guide', url: 'https://summerofcode.withgoogle.com/' },
      { title: 'Good First Issues Finder', url: 'https://goodfirstissue.dev/' }
    ]
  },
  {
    id: 'global-interview-star',
    title: 'Behavioral & Global Tech Interview Preparation (STAR Method)',
    category: 'Career & Communication',
    yearLevel: 'Year 4 (Level 4)',
    school: 'Global Tech / FAANG',
    description: 'Structure engineering leadership stories with Situation, Task, Action, and Result; practice mock technical interviews in English.',
    whyItMatters: 'Communication clarity and structured storytelling are the final hurdle between a local tech job and an international USD-paying career.',
    freeResources: [
      { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/' },
      { title: 'Pramp Free Peer Mock Interviews', url: 'https://www.pramp.com/' }
    ]
  }
];

export const GlobalRoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [activeLevel, setActiveLevel] = useState<string>('All');
  
  // Track completed milestones in localStorage
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('diu_global_milestones');
      return saved ? JSON.parse(saved) : ['harvard-cs50', 'linux-cli-git'];
    } catch {
      return ['harvard-cs50', 'linux-cli-git'];
    }
  });

  const toggleMilestone = (id: string) => {
    const updated = completedIds.includes(id)
      ? completedIds.filter((item) => item !== id)
      : [...completedIds, id];
    setCompletedIds(updated);
    localStorage.setItem('diu_global_milestones', JSON.stringify(updated));
  };

  const levels = ['All', 'Year 1 (Level 1)', 'Year 2 (Level 2)', 'Year 3 (Level 3)', 'Year 4 (Level 4)'];

  const filtered = activeLevel === 'All'
    ? GLOBAL_MILESTONES
    : GLOBAL_MILESTONES.filter((m) => m.yearLevel === activeLevel);

  const globalReadinessPct = Math.round((completedIds.length / GLOBAL_MILESTONES.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-emerald-950/20 shadow-glass">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Beyond DIU Curriculum • Ivy League & Global Tech Standard</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            How to Compete with <span className="text-gradient">MIT, Harvard & Global Engineers</span>
          </h1>
          <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
            While university exams test textbook theory, the top 1% of global developers build systems, master algorithmic patterns, and build open-source portfolios. Here is the curated roadmap of what to learn alongside each DIU year.
          </p>

          {/* Global Readiness Gauge */}
          <div className="mt-6 flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-mono font-black text-sm shadow-glow-emerald">
                {globalReadinessPct}%
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Global Tech Readiness</span>
                <span className="text-[11px] text-slate-400">
                  {completedIds.length} of {GLOBAL_MILESTONES.length} milestones achieved
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${globalReadinessPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setActiveLevel(lvl)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
              activeLevel === lvl
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-glow-emerald'
                : 'glass-card text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Milestones Cards */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isDone = completedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-5 sm:p-6 border transition duration-200 ${
                isDone 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Checkbox & Header */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleMilestone(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                    title={isDone ? 'Mark as Not Done' : 'Mark as Mastered'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                        item.school === 'Harvard' 
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                          : item.school === 'MIT'
                          ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30'
                          : item.school === 'Stanford'
                          ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                          : 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30'
                      }`}>
                        {item.school} Benchmark
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        {item.yearLevel} • {item.category}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isDone ? 'line-through opacity-85' : ''}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Why It Gives You an Edge: </span>
                      {item.whyItMatters}
                    </div>

                    {/* Free Resources Links */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Official Free Material:</span>
                      {item.freeResources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium transition"
                        >
                          <span>{res.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
