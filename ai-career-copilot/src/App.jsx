import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  Mail,
  Lock,
  Home,
  User,
  Briefcase,
  Infinity as InfinityIcon,
  FileText,
  Search,
  Bell,
  Plus,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Send,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  Wand2,
  BarChart3,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Star,
  PenLine,
  Filter,
  Clock,
  Palette,
  Wifi,
  Battery,
  Signal,
  Trash2,
} from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "TechFlow",
    match: 98,
    location: "New York, NY",
    workSetting: "On-site",
    salary: "$150K–$180K",
    type: "Senior",
    why: "Your design systems and product thinking match this role perfectly.",
    missing: ["Prototyping tools depth"],
    skills: ["Figma", "Design Systems", "UI/UX"],
  },
  {
    id: 2,
    title: "Junior UX Designer",
    company: "Linear",
    match: 94,
    location: "Remote",
    workSetting: "Remote",
    salary: "$55K–$72K",
    type: "Entry Level",
    why: "Your portfolio, Figma experience, and product thinking match this role strongly.",
    missing: ["Design systems", "A/B testing"],
    skills: ["Figma", "UI/UX", "Product Design"],
  },
  {
    id: 3,
    title: "Frontend Engineer",
    company: "Stripe",
    match: 88,
    location: "San Francisco",
    workSetting: "Hybrid",
    salary: "$110K-$130K",
    type: "Mid Level",
    why: "Your React projects and API integration experience fit the core requirements.",
    missing: ["Testing Library", "TypeScript depth"],
    skills: ["React", "JavaScript", "Frontend", "TypeScript"],
  },
  {
    id: 4,
    title: "Product Design Intern",
    company: "Notion",
    match: 82,
    location: "New York",
    workSetting: "Hybrid",
    salary: "$28/hr",
    type: "Internship",
    why: "Your research, wireframing, and student product experience align well.",
    missing: ["Portfolio case study polish"],
    skills: ["Figma", "Research", "Wireframing"],
  },
];

const applications = [
  {
    company: "Linear",
    role: "Junior UX Designer",
    date: "Apr 28",
    resume: "UX Resume v2",
    status: "Applied",
  },
  {
    company: "Stripe",
    role: "Frontend Intern",
    date: "Apr 27",
    resume: "Frontend Resume v1",
    status: "Interviewing",
  },
  {
    company: "Notion",
    role: "Product Design Intern",
    date: "Apr 25",
    resume: "Design Resume v3",
    status: "Saved",
  },
];

const isResumeFile = (file) => {
  const name = file?.name?.toLowerCase?.() || "";
  return (
    name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")
  );
};

const isPdfResume = (item) => {
  const name = item?.name?.toLowerCase?.() || "";
  return item?.type === "application/pdf" || name.endsWith(".pdf");
};

const formatFileSize = (size) => {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadDate = (value) => {
  if (!value) return "just now";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const cleanPdfText = (value) =>
  String(value || "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, "-")
    .slice(0, 92);

const escapePdfText = (value) =>
  cleanPdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const createSimplePdfBlob = (title, lines = []) => {
  const safeLines = [title, "", ...lines].map((line) => escapePdfText(line));
  const contentLines = [
    "BT",
    "/F1 18 Tf",
    "50 750 Td",
    `(${safeLines[0]}) Tj`,
    "/F1 10 Tf",
    "0 -24 Td",
  ];
  safeLines.slice(2, 38).forEach((line) => {
    contentLines.push(`(${line}) Tj`, "0 -15 Td");
  });
  contentLines.push("ET");
  const content = contentLines.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
};

const buildAiGeneratedResume = (answers = []) => {
  const answerText = answers.map((item) => item.answer).join(" ");
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const lines = [
    "Chris Anderson",
    "AI-generated resume draft - created by Syncra AI",
    `Generated: ${today}`,
    "",
    "PROFILE SUMMARY",
    "Entry-level UX and frontend candidate with experience in AI product prototyping,",
    "responsive React interfaces, UI/UX planning, and user-centered design workflows.",
    "",
    "TARGET ROLE",
    answers[0]?.answer ||
      "Junior UX Designer, Frontend Developer, or Product Design Intern",
    "",
    "EDUCATION",
    answers[1]?.answer ||
      "International Business student with software project and UI/UX experience.",
    "",
    "PROJECT EXPERIENCE",
    answers[2]?.answer ||
      "Built an AI Career Copilot prototype with resume upload, chatbot, and job matching flows.",
    "",
    "SKILLS",
    answers[3]?.answer ||
      "React, JavaScript, Tailwind CSS, Figma, UI/UX Design, Prompt Engineering",
    "",
    "ACHIEVEMENTS",
    answers[4]?.answer ||
      "Created and deployed an interactive Vercel prototype for team testing.",
    "",
    "AI NOTES",
    "This draft was generated from guided user answers and optimized for ATS-friendly sections.",
  ];
  const blob = createSimplePdfBlob("AI Generated Resume", lines);
  return {
    id: `ai-resume-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "AI Generated Resume - Chris Anderson.pdf",
    size: blob.size,
    type: "application/pdf",
    uploadedAt: new Date().toISOString(),
    url: URL.createObjectURL(blob),
    source: "Syncra AI",
    summary: answerText.slice(0, 180),
  };
};

const neoOut = "";
const neoIn = "";
const ViewModeContext = React.createContext("mobile");
const ShellStripContext = React.createContext(false);
const syncraLogoPng = "https://placehold.co/400x400/a0fe08/000100?text=Syncra";

const StepPill = ({ children, accent = false }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold ${
      accent
        ? "bg-[#a0fe08] text-[#000100]"
        : "border border-[#d1d3d2] bg-[#ffffff] text-[#000100]"
    }`}
  >
    {children}
  </span>
);

const GlassIcon = ({ children, className = "" }) => (
  <div
    className={`grid h-16 w-16 place-items-center rounded-full bg-[#000100] text-white ${className}`}
  >
    {children}
  </div>
);

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#000100] px-5 py-4 text-sm font-bold text-white transition active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#d1d3d2] bg-[#ffffff] px-5 py-4 text-sm font-bold text-[#000100] transition active:bg-[#eaeceb] ${className}`}
  >
    {children}
  </button>
);

const TopNavButton = ({ children, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#000100] px-4 py-2 text-sm font-bold text-white transition active:opacity-80 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "", onClick = null }) => (
  <div
    onClick={onClick}
    className={`rounded-3xl border border-[#d1d3d2] bg-[#ffffff] p-5 ${className}`}
  >
    {children}
  </div>
);

const SoftInput = ({ icon, placeholder, type = "text", value, onChange }) => {
  const Icon = icon;
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[#d1d3d2] bg-[#ffffff] px-4 py-4 text-sm text-[#666666] focus-within:ring-2 focus-within:ring-[#a0fe08]">
      <Icon className="h-5 w-5 shrink-0 text-[#000100]" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-[#000100] outline-none placeholder:text-[#999999]"
      />
    </label>
  );
};

const PhoneShell = ({ children, forceMobile = false }) => {
  const stripShell = useContext(ShellStripContext);
  const viewMode = useContext(ViewModeContext);
  const showWebView = viewMode === "web" && !forceMobile;

  if (stripShell) return <>{children}</>;

  if (showWebView) {
    return (
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-14 sm:px-8">
        <div className="relative flex h-[760px] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-[#d1d3d2] bg-[#eaeceb]">
          <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center px-2 py-3 sm:px-4 sm:py-6">
      <div className="relative mx-auto h-[720px] w-full max-w-[390px] rounded-[2.7rem] bg-[#000100] p-[10px] ring-1 ring-[#333] sm:h-[760px]">
        <div className="pointer-events-none absolute left-1/2 top-[14px] z-30 h-6 w-32 -translate-x-1/2 rounded-full bg-[#000100]" />
        <div className="pointer-events-none absolute left-[6px] top-28 h-14 w-[3px] rounded-full bg-[#333]" />
        <div className="pointer-events-none absolute right-[6px] top-24 h-20 w-[3px] rounded-full bg-[#333]" />
        <div className="pointer-events-none absolute right-[6px] top-48 h-12 w-[3px] rounded-full bg-[#333]" />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.2rem] bg-[#eaeceb]">
          {/* Status Bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex h-14 items-start justify-between px-7 pt-[14px] text-[13px] font-bold tracking-wide text-[#000100]">
            <span>17:56</span>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Signal className="h-[14px] w-[14px]" />
              <Wifi className="h-[14px] w-[14px]" />
              <Battery className="h-[15px] w-[15px]" />
            </div>
          </div>

          <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-1.5 w-36 -translate-x-1/2 rounded-full bg-[#000100]/40" />
        </div>
      </div>
    </div>
  );
};

const Screen = ({
  children,
  nav,
  floatingNav,
  className = "",
  go = () => {},
  activeTab = "home",
}) => (
  <div className={`flex h-full min-h-0 flex-1 flex-col ${className}`}>
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className={`px-6 pt-8 ${floatingNav ? "pb-28" : "pb-5"}`}>
        {children}
      </div>
    </div>
    {nav && (
      <div className="px-6 pb-6 pt-2">
        <BottomNav go={go} activeTab={activeTab} />
      </div>
    )}
  </div>
);

function BottomNav({ go = () => {}, activeTab = "home" }) {
  const items = [
    { icon: Home, label: "Home", key: "home", target: "dashboard" },
    { icon: Briefcase, label: "Jobs", key: "jobs", target: "jobs" },
    { icon: User, label: "Profile", key: "profile", target: "profile" },
  ];
  return (
    <div className="flex w-full items-center rounded-full bg-[#000100] p-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.key;
        return (
          <div key={item.key} className="flex flex-1 justify-center">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(item.target, null, item.mode)}
              className={`flex w-full items-center justify-center rounded-full py-3 transition-all duration-300 ease-out ${
                active
                  ? "gap-1.5 bg-[#a0fe08] px-4 text-[#000100]"
                  : "gap-0 px-4 text-white/50 hover:text-white"
              }`}
            >
              <Icon
                className="h-[22px] w-[22px] shrink-0"
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`overflow-hidden whitespace-nowrap text-[13px] font-bold transition-all duration-300 ease-out ${
                  active ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {item.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

const Header = ({ title, subtitle, icon, action }) => (
  <div className="mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs font-medium text-[#666666]">{subtitle}</p>
        <h2 className="text-xl font-bold tracking-tight text-[#000100]">
          {title}
        </h2>
      </div>
    </div>
    {action}
  </div>
);

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eaeceb] px-6 text-[#000100]">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-7 grid place-items-center"
        >
          <motion.div
            className="absolute h-64 w-64 rounded-full bg-[#a0fe08]/25 blur-3xl sm:h-80 sm:w-80"
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={syncraLogoPng}
            alt="Syncra AI logo"
            className="relative z-10 h-60 w-60 object-contain drop-shadow-[0_18px_35px_rgba(0,1,0,0.18)] sm:h-72 sm:w-72"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-sm font-bold tracking-[0.28em] text-[#000100]"
        >
          SYNCING YOUR CAREER PATH
        </motion.p>

        <div className="mt-5 h-2 w-52 overflow-hidden rounded-full bg-[#d1d3d2]">
          <motion.div
            className="h-full rounded-full bg-[#a0fe08]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.1, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function LoginLoadingScreen({ go }) {
  useEffect(() => {
    const loginTimer = setTimeout(() => go("login"), 2300);
    return () => clearTimeout(loginTimer);
  }, [go]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#eaeceb] px-8 text-[#000100]">
      <div className="flex w-full flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-7 grid place-items-center"
        >
          <motion.div
            className="absolute h-56 w-56 rounded-full bg-[#a0fe08]/25 blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={syncraLogoPng}
            alt="Syncra AI logo"
            className="relative z-10 h-52 w-52 object-contain drop-shadow-[0_18px_35px_rgba(0,1,0,0.18)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-xs font-bold tracking-[0.24em] text-[#000100]"
        >
          SYNCING YOUR CAREER PATH
        </motion.p>

        <div className="mt-5 h-2 w-52 overflow-hidden rounded-full bg-[#d1d3d2]">
          <motion.div
            className="h-full rounded-full bg-[#a0fe08]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.1, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function Landing({ go }) {
  return (
    <div className="grid min-h-screen gap-10 bg-[#eaeceb] px-6 py-8 text-[#000100] lg:grid-cols-[1.05fr_.95fr] lg:px-16">
      <div className="flex flex-col justify-center">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-sm font-bold text-[#000100]">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#000100]">
            <InfinityIcon className="h-3.5 w-3.5 text-white" />
          </div>{" "}
          AI Agentic Resume Assistant
        </div>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-[#000100] md:text-7xl">
          Let AI handle your job hunting journey.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#666666]">
          Build an ATS-friendly resume, discover roles that match your goals,
          tailor every application, and approve auto-apply actions before
          anything is submitted.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => go("loginLoading")}
            className="rounded-xl bg-[#000100] px-7 py-4 font-bold text-white transition active:opacity-80"
          >
            Get Started
          </button>
          <button
            onClick={() => go("loginLoading")}
            className="rounded-xl border border-[#d1d3d2] bg-[#ffffff] px-7 py-4 font-bold text-[#000100]"
          >
            I already have an account
          </button>
        </div>
        <div className="mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          {[
            [
              FileText,
              "AI Resume Builder",
              "Turn your story into a polished resume.",
            ],
            [
              Search,
              "Smart Job Matching",
              "Rank roles by fit, goals, and missing skills.",
            ],
            [
              Send,
              "Auto Apply Assistant",
              "Prepare applications after your approval.",
            ],
          ].map(([Icon, title, copy]) => (
            <Card key={title}>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[#000100] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#000100]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">{copy}</p>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <PhoneShell forceMobile>
          <Dashboard mini />
        </PhoneShell>
      </div>
    </div>
  );
}

function Login({ go, resumesCount = 0 }) {
  const nextAfterLogin = resumesCount === 0 ? "resumeUpload" : "dashboard";

  return (
    <PhoneShell>
      <div className="relative flex h-full min-h-[610px] w-full flex-col overflow-hidden bg-[#eaeceb] px-6 py-8">
        {/* Floating Elements (Slush style) */}
        <motion.div
          initial={{ x: -40, y: -20, rotate: -20 }}
          animate={{ x: 0, y: 0, rotate: -12 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="absolute -left-8 top-12 flex h-32 w-24 items-center justify-center rounded-3xl border-[3px] border-[#000100] bg-[#a0fe08] shadow-[4px_4px_0px_#000100]"
        >
          <FileText className="h-12 w-12 text-[#000100]" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ x: 40, y: -40, rotate: 20 }}
          animate={{ x: 0, y: 0, rotate: 15 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.1 }}
          className="absolute -right-8 -top-4 flex h-32 w-32 items-center justify-center rounded-full border-[3px] border-[#000100] bg-[#ffdd00] shadow-[4px_4px_0px_#000100]"
        >
          <span className="text-6xl">🙂</span>
        </motion.div>

        <motion.div
          initial={{ x: -40, y: 40, rotate: -30 }}
          animate={{ x: 0, y: 0, rotate: 20 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="absolute -left-8 bottom-56 flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-[#000100] bg-[#ffffff] shadow-[4px_4px_0px_#000100]"
        >
          <span className="text-5xl">🚀</span>
        </motion.div>

        <motion.div
          initial={{ x: 40, y: 40, rotate: 20 }}
          animate={{ x: 0, y: 0, rotate: -10 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.3 }}
          className="absolute -right-6 bottom-48 flex h-20 w-28 items-center justify-center rounded-2xl border-[3px] border-[#000100] bg-[#000100] shadow-[4px_4px_0px_#a0fe08]"
        >
          <Briefcase className="h-10 w-10 text-[#a0fe08]" />
        </motion.div>

        {/* Header Logo */}
        <div className="relative z-10 mx-auto mt-2 text-center">
          <h2 className="text-xl font-black tracking-tighter text-[#000100] uppercase">
            RESUME AI AGENT
          </h2>
        </div>

        {/* Main Center Text */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <h1 className="text-center text-[2.25rem] leading-[0.95] tracking-tighter font-black text-[#000100]">
            LET AI AGENT
            <br />
            DO
            <br />
            THE WORK.
          </h1>
        </div>

        {/* Bottom Controls */}
        <div className="relative z-10 mt-auto flex flex-col gap-4 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => go(nextAfterLogin)}
              className="flex flex-1 items-center justify-center rounded-full bg-[#ffffff] border-[3px] border-[#000100] py-3 shadow-[4px_4px_0px_#000100] transition active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#000100]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[#000100]"
                fill="currentColor"
              >
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.545 6.477 2.545 12s4.476 10 10.001 10c8.396 0 10.249-7.85 9.426-11.761h-9.427z" />
              </svg>
            </button>
            <button
              onClick={() => go(nextAfterLogin)}
              className="flex flex-1 items-center justify-center rounded-full bg-[#000100] py-3 border-[3px] border-[#000100] shadow-[4px_4px_0px_#a0fe08] transition active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#a0fe08]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="currentColor"
              >
                <path d="M15.42 12.012c-.023-1.895 1.545-2.82 1.616-2.864-1.22-1.776-3.13-2.016-3.805-2.04-1.619-.163-3.16.953-3.987.953-.827 0-2.091-.933-3.415-.907-1.722.025-3.313.998-4.195 2.535-1.785 3.09-.462 7.665 1.282 10.187.851 1.229 1.865 2.615 3.176 2.565 1.264-.05 1.745-.815 3.277-.815 1.53 0 1.986.815 3.3.79 1.336-.025 2.22-1.258 3.064-2.48.983-1.433 1.388-2.822 1.408-2.894-.031-.013-2.704-1.037-2.721-4.03M12.872 7.39c.691-.837 1.157-2.001 1.03-3.161-1.002.04-2.203.666-2.915 1.503-.637.747-1.196 1.93-.105 3.064 1.12.087 2.28-.567 2.99-1.406" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => go(nextAfterLogin)}
            className="w-full rounded-full bg-[#a0fe08] py-3 text-[15px] font-bold text-[#000100] border-[3px] border-[#000100] shadow-[4px_4px_0px_#000100] transition active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#000100]"
          >
            Guest
          </button>
          <p className="mt-2 px-2 text-center text-[11px] leading-5 text-[#666666]">
            By continuing, you agree to our{" "}
            <span className="underline font-bold text-[#000100]">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline font-bold text-[#000100]">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}

function SignUp({ go }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    go("resumeUpload");
  };
  return (
    <PhoneShell>
      <Screen>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex h-full min-h-[610px] w-full max-w-[430px] flex-col"
        >
          <div className="flex flex-1 flex-col justify-center">
            <h1 className="text-lg font-bold text-[#000100]">
              Create your account
            </h1>
            <p className="mb-8 mt-2 text-sm text-[#666666]">
              Start building your AI-powered career profile
            </p>
            <div className="space-y-3">
              <SoftInput
                icon={User}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <SoftInput
                icon={Mail}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SoftInput
                icon={Lock}
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <SoftInput
                icon={Lock}
                placeholder="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <PrimaryButton className="mt-7" onClick={handleSubmit}>
              Create account <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
            <div className="my-6 flex items-center gap-3 text-xs text-[#666666]">
              <span className="h-px flex-1 bg-[#d1d3d2]" /> or sign up with{" "}
              <span className="h-px flex-1 bg-[#d1d3d2]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SecondaryButton onClick={() => go("resumeUpload")}>
                Google
              </SecondaryButton>
              <SecondaryButton onClick={() => go("resumeUpload")}>
                Demo Mode
              </SecondaryButton>
            </div>
          </div>
          <p className="pb-2 text-center text-sm text-[#666666]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => go("login")}
              className="font-bold text-[#000100]"
            >
              Sign in
            </button>
          </p>
        </form>
      </Screen>
    </PhoneShell>
  );
}

function ResumeUpload({
  go,
  fromDashboard = false,
  backTarget = null,
  resumes = [],
  uploadQueue = [],
  onUploadResume = () => {},
  onOpenResume = () => {},
  onDeleteResume = () => {},
  onContinueWithResume = () => {},
  onSkipForNow = () => {},
}) {
  const fileInputRef = useRef(null);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onUploadResume(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  return (
    <PhoneShell>
      <Screen>
        {/* Back / Skip header */}
        <div className="mb-4 mt-4 flex items-center justify-between">
          <TopNavButton
            onClick={() =>
              go(backTarget || (fromDashboard ? "dashboard" : "login"))
            }
          >
            <ArrowLeft className="h-4 w-4 text-[#a0fe08]" /> Back
          </TopNavButton>
        </div>

        <div
          className="flex-1 overflow-y-auto no-scrollbar pb-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-4 w-fit">
            <GlassIcon>
              <FileText className="h-8 w-8 text-white" />
            </GlassIcon>
          </div>
          <h1 className="mb-8 text-center text-xl font-bold tracking-tight text-[#000100]">
            Your Resume
          </h1>

          {/* Clean Dashboard Theme Action Squares */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-[#d1d3d2] bg-[#ffffff] p-4 shadow-sm transition active:scale-95 hover:bg-[#fafafa]"
            >
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#eaeceb] text-[#000100] transition-colors group-hover:bg-[#000100] group-hover:text-white">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-[#000100]">
                Upload PDF
              </span>
            </button>

            <button
              onClick={() => go("aiChatbot", null, "createResume")}
              className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-[#d1d3d2] bg-[#ffffff] p-4 shadow-sm transition active:scale-95 hover:bg-[#fafafa]"
            >
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#eaeceb] text-[#000100] transition-colors group-hover:bg-[#000100] group-hover:text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-[#000100]">AI Build</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Uploaded List */}
          {(uploadQueue.length > 0 || resumes.length > 0) && (
            <div className="space-y-4">
              {uploadQueue.map((item) => (
                <ResumeUploadCard key={item.id} item={item} uploading />
              ))}
              {resumes.map((resume) => (
                <ResumeUploadCard
                  key={resume.id}
                  item={resume}
                  onOpen={() => onOpenResume(resume, "resumeUpload")}
                  onDelete={() => onDeleteResume(resume.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="mt-auto shrink-0 pt-4 flex flex-col gap-3">
          <PrimaryButton
            disabled={resumes.length === 0}
            onClick={onContinueWithResume}
            className="w-full py-4 text-[15px]"
          >
            Continue
          </PrimaryButton>
          <button
            onClick={onSkipForNow}
            className="w-full py-2 text-sm font-bold text-[#666666] transition active:opacity-70"
          >
            Skip for now
          </button>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function ResumeUploadCard({ item, uploading = false, onOpen, onDelete }) {
  const progress = item.progress ?? 100;
  const isError = item.status === "error";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#d1d3d2] p-4 shadow-sm transition-all ${
        isError ? "bg-red-50 border-red-200" : "bg-[#ffffff]"
      }`}
    >
      {/* Background fill handles progress organically */}
      {uploading && !isError && (
        <div
          className="absolute bottom-0 left-0 top-0 bg-[#a0fe08]/20 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="relative z-10 flex items-center gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
            isError ? "bg-red-500 text-white" : "bg-[#000100] text-white"
          }`}
        >
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-[#000100]">
            {item.name}
          </h4>
          <p className="mt-0.5 text-xs text-[#666666]">
            {formatFileSize(item.size)}{" "}
            {isError
              ? "• Error"
              : uploading && progress < 100
              ? `• ${progress}%`
              : ""}
          </p>
        </div>

        {!uploading && !isError && item.url && (
          <button
            type="button"
            onClick={() => onOpen?.(item)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d1d3d2] bg-[#ffffff] text-[#000100] transition active:bg-[#eaeceb]"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eaeceb] text-[#666666] transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AIChatbot({
  go,
  chatMode = "setPreferences",
  fromDashboard = false,
  backTarget = null,
  hideBottomNav = false,
  onStartBackgroundResume = () => {},
  agentResumeNotice = null,
}) {
  const prefQuestions = [
    "What kind of job are you looking for? (e.g. UX Designer, Frontend Developer, Product Manager)",
    "What's your preferred location? (e.g. Remote, San Francisco, New York)",
    "Do you prefer remote, hybrid, or on-site work?",
    "What's your expected salary range?",
    "Any industry preferences? (e.g. Tech, Finance, Healthcare)",
  ];

  const createQuestions = [
    "Let's build your resume! What's your current or most recent job title?",
    "Tell me about your education — school name, degree, and graduation year.",
    "What are your top 5 skills? (e.g. React, Figma, Python, Project Management)",
    "Describe your most notable work experience or project in 1-2 sentences.",
    "Any certifications, awards, or achievements you'd like to include?",
  ];

  const helpWriteQuestions = [
    "Question 1 of 5: What target role or internship are you applying for?",
    "Question 2 of 5: Tell me about your education. Include school, major, graduation year, or relevant coursework.",
    "Question 3 of 5: What project, experience, or class work should I highlight most?",
    "Question 4 of 5: What skills, tools, or strengths should appear in your resume?",
    "Question 5 of 5: Any achievements, links, or special points you want the resume to emphasize?",
  ];

  const createResumeFlows = {
    "help me write it": [
      "Absolutely. I’ll guide you like a resume coach and turn your answers into a professional resume draft.",
      "I’ll ask 5 short questions. After your final answer, I’ll create the resume in the background so you can continue using the app.",
      "Question 1 of 5: What target role or internship are you applying for?",
    ],
    "i'll type it out": [
      "Perfect. You can type everything in your own words, and I’ll turn it into a clean resume draft.",
      "Send one message with anything you already have: target role, education, skills, projects, experience, achievements, links, or even rough notes.",
      "Don’t worry about grammar or formatting. After you send it, I’ll organize it into resume sections and create the resume in the background.",
      "Paste or type your rough resume information now.",
    ],
    "use my linkedin": [
      "Great choice. I already have access to your LinkedIn profile for this demo.",
      "Reading LinkedIn data… Found your education, project experience, skills, portfolio link, and career interests.",
      "I’m converting your LinkedIn profile into a resume format with ATS-friendly sections and stronger impact wording.",
    ],
  };

  const openChatFlows = {
    "find me jobs": [
      "Starting an agentic job search now. I’ll use your resume, preferences, and skill profile to rank opportunities.",
      "Searching demo sources: LinkedIn, Indeed, company career pages, and internship platforms…",
      "Filtering out roles that require too much experience, don’t match your location, or don’t fit your preferred work style…",
      "Search complete: I found 32 jobs. 8 are strong matches, 15 are medium matches, and 9 are low matches.",
      "Best match: Senior Product Designer at TechFlow — 98% match. You match because of Figma, product thinking, and prototype experience. Missing skills: prototyping tools depth.",
    ],
    "improve my resume": [
      "I’ll review your resume like an ATS and hiring manager at the same time.",
      "Current demo score: 78/100. Strong areas: project experience, design tools, and frontend foundation.",
      "Main improvements: add measurable impact, include missing keywords, and make your project bullets more outcome-focused.",
      "Example improvement: ‘Built a React prototype’ → ‘Designed and built a responsive AI career prototype with React, improving task flow clarity for student job seekers.’",
    ],
    "career advice": [
      "Based on your profile, I’d recommend targeting hybrid roles between UX, frontend, and AI product work.",
      "Best early-career titles for you: Junior UX Designer, Product Design Intern, Frontend Engineer Intern, and AI Product Assistant.",
      "Your strongest angle is not only coding or only design — it’s your ability to turn user problems into an interactive product prototype.",
      "Next step: polish one portfolio case study and tailor your resume separately for UX roles and frontend roles.",
    ],
    "salary insights": [
      "I’ll estimate salary expectations using the role type, location, and experience level from your profile.",
      "For entry-level UX/frontend roles in this demo market, a realistic range is around $50K–$80K depending on location and company size.",
      "For internships, focus less on salary and more on learning quality, mentorship, and whether the work can become a portfolio case study.",
      "I can also filter job results by high salary once your job search starts.",
    ],
  };

  const preferenceFlows = {
    "remote only": [
      "Got it — I’ll prioritize remote roles and remove on-site-only jobs from your match list.",
      "I’ll still keep strong hybrid roles as backup options, but mark them as lower priority.",
    ],
    "full-time": [
      "Great. I’ll focus on full-time entry-level roles and junior positions.",
      "I’ll avoid short-term contract roles unless they strongly match your profile.",
    ],
    "entry level": [
      "Understood. I’ll filter for internships, junior roles, trainee roles, and new graduate positions.",
      "I’ll reduce the score for jobs asking for more than 2 years of experience.",
    ],
    "$50k–$80k": [
      "Saved. I’ll use $50K–$80K as your preferred range when ranking job results.",
      "If a job has no salary listed, I’ll still include it but mark salary confidence as unknown.",
    ],
  };

  const isChatOpen = chatMode === "chatOpen";
  const questions =
    chatMode === "createResume" ? createQuestions : prefQuestions;
  const messagesEndRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const timersRef = useRef([]);

  const initialChatState = useMemo(() => {
    if (agentResumeNotice && chatMode === "createResume") {
      return {
        messages: [
          {
            from: "ai",
            text: `I finished creating ${
              agentResumeNotice.resumeName || "your AI-generated resume"
            } according to your answers.`,
          },
          {
            from: "ai",
            text: "I saved it in Profile → Career → Resumes. You can go there to preview the resume, delete it, or use it for job matching.",
          },
        ],
        step: questions.length + 1,
      };
    }

    if (isChatOpen) {
      return {
        messages: [
          {
            from: "ai",
            text: "Hi! I'm Syncra AI. How can I help you today? You can ask me about jobs, resumes, career advice, or anything else.",
          },
        ],
        step: 0,
      };
    }

    if (chatMode === "createResume") {
      return {
        messages: [
          { from: "user", text: "I want to create a resume" },
          {
            from: "ai",
            text: "Absolutely. I’ll guide you like a resume coach and turn your answers into a professional resume draft.",
          },
          {
            from: "ai",
            text: "I’ll ask 5 short questions. After your final answer, I’ll create the resume in the background so you can continue using the app.",
          },
          { from: "ai", text: helpWriteQuestions[0] },
        ],
        step: 0,
      };
    }

    const initial = { from: "user", text: "I want to set my preferences" };

    return {
      messages: [initial, { from: "ai", text: questions[0] }],
      step: 1,
    };
  }, [agentResumeNotice, chatMode, isChatOpen, questions]);

  const [messages, setMessages] = useState(initialChatState.messages);
  const [inputText, setInputText] = useState("");
  const [step, setStep] = useState(initialChatState.step);
  const [isTyping, setIsTyping] = useState(false);
  const [helpWriteStep, setHelpWriteStep] = useState(
    chatMode === "createResume" && !agentResumeNotice ? 0 : null
  );
  const [helpWriteAnswers, setHelpWriteAnswers] = useState([]);
  const [typeItOutActive, setTypeItOutActive] = useState(false);

  useEffect(() => {
    const scrollContainer = messagesScrollRef.current;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => timersRef.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const normalizePrompt = (text) =>
    text.trim().toLowerCase().replace(/[’']/g, "'");

  const getFlowForPrompt = (text) => {
    const key = normalizePrompt(text);
    if (chatMode === "createResume" && createResumeFlows[key])
      return createResumeFlows[key];
    if (isChatOpen && openChatFlows[key]) return openChatFlows[key];
    if (!isChatOpen && chatMode !== "createResume" && preferenceFlows[key])
      return preferenceFlows[key];

    if (
      key.includes("find me job") ||
      key.includes("find jobs") ||
      key.includes("find internships") ||
      key.includes("search jobs") ||
      key.includes("job search") ||
      key.includes("look for jobs")
    ) {
      return careerPromptFlows["find me jobs"];
    }
    if (
      (key.includes("improve") ||
        key.includes("review") ||
        key.includes("fix")) &&
      key.includes("resume")
    ) {
      return careerPromptFlows["improve my resume"];
    }
    if (key.includes("salary")) return careerPromptFlows["salary insights"];
    if (key.includes("career advice") || key.includes("career path"))
      return careerPromptFlows["career advice"];
    if (chatMode === "createResume" && key.includes("linkedin"))
      return createResumeFlows["use my linkedin"];
    if (chatMode === "createResume" && key.includes("write"))
      return createResumeFlows["help me write it"];
    return null;
  };

  const addAgentSequence = (userText, aiReplies, onComplete) => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
    setInputText("");
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setIsTyping(true);

    aiReplies.forEach((reply, index) => {
      const timer = setTimeout(() => {
        setMessages((prev) => [...prev, { from: "ai", text: reply }]);
        if (index === aiReplies.length - 1) {
          setIsTyping(false);
          onComplete?.();
        }
      }, 650 + index * 850);
      timersRef.current.push(timer);
    });
  };

  const startHelpWriteFlow = (userText) => {
    setTypeItOutActive(false);
    setHelpWriteAnswers([]);
    setHelpWriteStep(0);
    addAgentSequence(userText, createResumeFlows["help me write it"]);
  };

  const startTypeItOutFlow = (userText) => {
    setHelpWriteAnswers([]);
    setHelpWriteStep(null);
    setTypeItOutActive(true);
    addAgentSequence(userText, createResumeFlows["i'll type it out"]);
  };

  const startLinkedInFlow = (userText) => {
    setHelpWriteAnswers([]);
    setHelpWriteStep(null);
    setTypeItOutActive(false);

    const linkedInResumeAnswers = [
      {
        question: "LinkedIn target role",
        answer:
          "Junior UX Designer, Frontend Developer, and Product Design Internship roles focused on UI design, user research, frontend prototyping, and AI-powered product experiences.",
      },
      {
        question: "LinkedIn education",
        answer:
          "International Business student at Tamkang University in Taiwan, expected graduation 2027, with software project experience in UI/UX planning, React prototyping, and product design.",
      },
      {
        question: "LinkedIn projects and experience",
        answer:
          "AI Career Copilot app project: designed user flows, built a responsive React prototype, implemented resume upload, in-app PDF preview, chatbot interactions, job matching demo, and agentic background resume creation workflow.",
      },
      {
        question: "LinkedIn skills and tools",
        answer:
          "React, JavaScript, Tailwind CSS, Figma, UI/UX Design, Responsive Web Design, User Journey Mapping, Empathy Maps, Prompt Engineering, Teamwork, Presentation, and AI tool usage.",
      },
      {
        question: "LinkedIn achievements and links",
        answer:
          "Created a full interactive prototype, improved the interface with neumorphism and glassmorphism, deployed the app on Vercel for team testing, and connected business thinking with AI-driven product design.",
      },
    ];

    addAgentSequence(userText, createResumeFlows["use my linkedin"], () => {
      onStartBackgroundResume(linkedInResumeAnswers);
      setTimeout(() => go("analyzing"), 1000);
    });
  };

  const handleTypeItOutAnswer = (userText) => {
    setTypeItOutActive(false);
    const typedResumeAnswers = [
      { question: "Typed resume information", answer: userText },
      { question: "Education and background", answer: userText },
      { question: "Projects and experience", answer: userText },
      { question: "Skills and tools", answer: userText },
      { question: "Achievements and links", answer: userText },
    ];
    addAgentSequence(
      userText,
      [
        "Got it. I received your rough resume information and I’m extracting the key details now.",
        "I’m organizing it into resume sections: Summary, Education, Skills, Projects, Experience, and Achievements.",
        "Now I’m rewriting your notes into concise, ATS-friendly bullet points in the background.",
      ],
      () => {
        onStartBackgroundResume(typedResumeAnswers);
        setTimeout(() => go("analyzing"), 1000);
      }
    );
  };

  const handleHelpWriteAnswer = (userText) => {
    const currentStep = helpWriteStep ?? 0;
    const updatedAnswers = [
      ...helpWriteAnswers,
      { question: helpWriteQuestions[currentStep], answer: userText },
    ];

    if (currentStep < helpWriteQuestions.length - 1) {
      const nextStep = currentStep + 1;
      setHelpWriteAnswers(updatedAnswers);
      setHelpWriteStep(nextStep);
      addAgentSequence(userText, [
        "Great — I saved that and will translate it into resume-ready wording.",
        helpWriteQuestions[nextStep],
      ]);
      return;
    }

    setHelpWriteAnswers([]);
    setHelpWriteStep(null);
    addAgentSequence(
      userText,
      [
        "Perfect. I have enough information to create your first resume draft.",
        "I’m now writing the resume in the background: summary, education, skills, projects, and ATS-friendly bullet points.",
      ],
      () => {
        onStartBackgroundResume(updatedAnswers);
        setTimeout(() => go("analyzing"), 1000);
      }
    );
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    const userText = inputText.trim();

    if (chatMode === "createResume" && helpWriteStep !== null) {
      handleHelpWriteAnswer(userText);
      return;
    }

    if (chatMode === "createResume" && typeItOutActive) {
      handleTypeItOutAnswer(userText);
      return;
    }

    const flow = getFlowForPrompt(userText);
    if (flow) {
      if (
        chatMode === "createResume" &&
        normalizePrompt(userText) === "help me write it"
      ) {
        startHelpWriteFlow(userText);
      } else if (
        chatMode === "createResume" &&
        normalizePrompt(userText) === "i'll type it out"
      ) {
        startTypeItOutFlow(userText);
      } else if (
        chatMode === "createResume" &&
        normalizePrompt(userText) === "use my linkedin"
      ) {
        startLinkedInFlow(userText);
      } else {
        addAgentSequence(userText, flow);
      }
      return;
    }

    const newMessages = [...messages, { from: "user", text: userText }];
    setInputText("");

    if (isChatOpen) {
      const replies = [
        "I understand. I’ll treat that as new career context and use it when ranking jobs and improving your resume.",
        "That helps. I can turn this into resume wording, job search filters, or application preparation.",
        "Based on that, I’d recommend focusing on roles where your design, frontend, and AI prototype experience are visible.",
        "Would you like me to search jobs, improve your resume, or prepare a job-specific application next?",
      ];
      newMessages.push({
        from: "ai",
        text: replies[messages.length % replies.length],
      });
      setMessages(newMessages);
    } else if (step < questions.length) {
      newMessages.push({ from: "ai", text: questions[step] });
      setMessages(newMessages);
      setStep(step + 1);
    } else if (chatMode === "createResume") {
      newMessages.push({
        from: "ai",
        text: "Great — I have enough background to create a first resume draft. I’ll now organize your information into Summary, Skills, Education, Projects, and Experience sections.",
      });
      setMessages(newMessages);
      setStep(step + 1);
    } else {
      newMessages.push({
        from: "ai",
        text: "Perfect. I saved your preferences and will use them to filter job results, rank matches, and avoid roles that do not fit your goals.",
      });
      setMessages(newMessages);
      setTimeout(() => go("analyzing"), 2000);
    }
  };

  const quickReplies = isChatOpen
    ? ["Find me jobs", "Improve my resume", "Career advice", "Salary insights"]
    : chatMode === "createResume"
    ? []
    : ["Remote only", "Full-time", "Entry level", "$50K–$80K"];

  const handleQuickReply = (reply) => {
    if (isTyping) return;
    if (
      chatMode === "createResume" &&
      normalizePrompt(reply) === "help me write it"
    ) {
      startHelpWriteFlow(reply);
      return;
    }
    if (
      chatMode === "createResume" &&
      normalizePrompt(reply) === "i'll type it out"
    ) {
      startTypeItOutFlow(reply);
      return;
    }
    if (
      chatMode === "createResume" &&
      normalizePrompt(reply) === "use my linkedin"
    ) {
      startLinkedInFlow(reply);
      return;
    }
    const flow = getFlowForPrompt(reply);
    if (flow) addAgentSequence(reply, flow);
    else setInputText(reply);
  };

  const renderMessageText = (text) => (
    <>
      {String(text)
        .split("\n")
        .map((line, index, arr) => (
          <React.Fragment key={`${line}-${index}`}>
            {line}
            {index < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
    </>
  );

  return (
    <PhoneShell>
      <div
        className={`flex h-full min-h-0 flex-1 flex-col px-6 pt-8 ${
          hideBottomNav ? "pb-6" : "pb-28"
        }`}
      >
        {/* Fixed top area */}
        <div className="shrink-0">
          <div className="mb-4 mt-4 flex items-center justify-between">
            <TopNavButton
              onClick={() =>
                go(backTarget || (fromDashboard ? "dashboard" : "resumeUpload"))
              }
            >
              <ArrowLeft className="h-4 w-4 text-[#a0fe08]" /> Back
            </TopNavButton>
            {!isChatOpen && (
              <TopNavButton onClick={() => go("dashboard")}>
                Skip <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
              </TopNavButton>
            )}
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#000100] text-lg text-white">
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000100]">Syncra AI</h2>
              <p className="text-xs font-medium text-[#a0fe08]">
                Online ·{" "}
                {isChatOpen
                  ? "Chat"
                  : chatMode === "createResume"
                  ? "Building Resume"
                  : "Setting Preferences"}
              </p>
            </div>
            <div className="ml-auto">
              <StepPill>
                {chatMode === "createResume" ? "Resume" : "Preferences"}
              </StepPill>
            </div>
          </div>
        </div>

        {/* Scrollable message area */}
        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-2 pr-1"
        >
          <div className="space-y-3 pb-4">
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.from}-${i}-${msg.text.slice(0, 12)}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className={
                  msg.from === "ai"
                    ? "max-w-[85%] rounded-2xl rounded-tl-sm border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm leading-6 text-[#000100]"
                    : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#000100] p-4 text-sm leading-6 text-white"
                }
              >
                {renderMessageText(msg.text)}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-fit max-w-[75%] items-center gap-2 rounded-2xl rounded-tl-sm border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm text-[#666666]"
              >
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#000100]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#000100] [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#000100] [animation-delay:240ms]" />
                <span className="ml-1 text-xs text-[#666666]">
                  Syncra is working
                </span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed bottom composer */}
        <div className="shrink-0 border-t border-[#d1d3d2] pt-3">
          {quickReplies.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickReply(q)}
                  disabled={isTyping}
                  className="shrink-0 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] transition active:bg-[#eaeceb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-full border border-[#d1d3d2] bg-[#ffffff] p-2">
            <div className="flex items-center gap-2 rounded-full bg-transparent px-2 py-1 text-sm">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  isTyping ? "Syncra is thinking..." : "Type your answer..."
                }
                disabled={isTyping}
                className="w-full flex-1 bg-transparent text-[#000100] outline-none placeholder:text-[#999999] disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !inputText.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#000100] text-white transition active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

function Setup({ go }) {
  const fields = [
    "Desired role",
    "Industry",
    "Job type",
    "Location",
    "Salary",
    "Company culture",
    "Skills to use",
    "Skills to avoid",
  ];
  return (
    <PhoneShell>
      <Screen>
        <div className="mx-auto mb-6 w-fit">
          <GlassIcon>
            <Star className="h-9 w-9 fill-[#a0fe08] text-[#a0fe08]" />
          </GlassIcon>
        </div>
        <p className="text-xs text-[#666666]">Step 1 of 2</p>
        <h1 className="mt-2 text-xl font-bold text-[#000100]">
          AI Career Setup
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Tell Syncra AI what kind of job journey you want.
        </p>
        <div className="mt-6 grid gap-3">
          {fields.map((field) => (
            <div
              key={field}
              className={`rounded-2xl border border-[#d1d3d2] bg-[#ffffff] px-4 py-3 text-sm text-[#666666] ${neoIn} `}
            >
              {field}
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("resumeInput")}>
            Continue <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton onClick={() => go("story")}>
            Let AI help me fill this <Sparkles className="h-4 w-4" />
          </SecondaryButton>
          <TopNavButton
            onClick={() => go("resumeInput")}
            className="w-full py-3"
          >
            Skip for now <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
          </TopNavButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function ResumeInput({ go }) {
  return (
    <PhoneShell>
      <Screen>
        <div className="mx-auto mb-8 w-fit">
          <GlassIcon>
            <Star className="h-9 w-9 fill-[#a0fe08] text-[#a0fe08]" />
          </GlassIcon>
        </div>
        <p className="text-xs text-[#666666]">Step 2 of 2</p>
        <h1 className="mt-2 text-xl font-bold text-[#000100]">
          Upload your resume
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Drop your PDF and we&apos;ll match you with the right roles.
        </p>
        <button
          onClick={() => go("builder")}
          className={`mt-8 flex h-40 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#d1d3d2] bg-[#ffffff] text-[#000100] ${neoIn} `}
        >
          <div
            className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eaeceb] ${neoOut}`}
          >
            <Upload className="h-7 w-7" />
          </div>
          <span className="text-sm font-bold">Tap to upload PDF</span>
          <span className="mt-1 text-xs text-[#666666]">
            or drag & drop here
          </span>
        </button>
        <div className="mt-8 space-y-3">
          <PrimaryButton onClick={() => go("builder")}>
            Continue <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton onClick={() => go("story")}>
            Tell Your Story <InfinityIcon className="h-4 w-4" />
          </SecondaryButton>
          <TopNavButton onClick={() => go("dashboard")} className="w-full py-3">
            Skip for now <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
          </TopNavButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Story({ go }) {
  const quick = [
    "What roles fit me?",
    "Improve my resume",
    "Salary expectations",
    "Find internships",
  ];
  return (
    <PhoneShell>
      <Screen>
        <div className="mb-6 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-full border border-[#d1d3d2] bg-[#000100] text-lg ${neoOut}`}
            >
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000100]">Syncra AI</h2>
              <p className="text-xs text-[#000100]">Online · Step 1 of 6</p>
            </div>
          </div>
          <TopNavButton onClick={() => go("dashboard")}>
            Skip <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
          </TopNavButton>
        </div>
        <div className="space-y-3">
          <div
            className={`max-w-[82%] rounded-2xl rounded-tl-sm border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm leading-6 text-[#000100] ${neoOut} `}
          >
            Hi Chris, I&apos;ve reviewed your goal. Tell me what you&apos;re
            looking for and I&apos;ll tailor matches.
          </div>
          <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-[#000100] p-4 text-sm leading-6 text-white ">
            I want an entry-level UX or frontend role where I can use design and
            coding skills.
          </div>
          <div
            className={`max-w-[86%] rounded-2xl rounded-tl-sm border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm leading-6 text-[#000100] ${neoOut} `}
          >
            Great. I&apos;ll ask about your education, projects, skills,
            experience, achievements, and target role.
          </div>
        </div>
        <div className="mt-48 flex gap-2 overflow-x-auto pb-3">
          {quick.map((q) => (
            <button
              key={q}
              className={`shrink-0 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] ${neoOut}`}
            >
              {q}
            </button>
          ))}
        </div>
        <div
          className={`rounded-2xl border border-[#d1d3d2] bg-[#ffffff] p-2 ${neoIn} `}
        >
          <div className="flex items-center gap-2 rounded-xl bg-transparent px-2 py-1 text-sm text-[#666666]">
            <span className="flex-1">Ask anything...</span>
            <button className="grid h-11 w-11 place-items-center rounded-2xl bg-[#000100] text-white ">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SecondaryButton onClick={() => go("builder")}>
            Continue
          </SecondaryButton>
          <SecondaryButton onClick={() => go("dashboard")}>
            Save Later
          </SecondaryButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Builder({ go }) {
  const messages = [
    "Reading your background",
    "Writing professional bullet points",
    "Optimizing for ATS",
    "Creating a clean resume preview",
  ];
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="AI Resume Builder"
          subtitle="Syncra AI is working"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <Wand2 className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card>
          <h3 className="font-bold text-[#000100]">
            Generating your ATS-friendly resume
          </h3>
          <div className="mt-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={m}
                className="flex items-center gap-3 text-sm text-[#000100]"
              >
                <CheckCircle2
                  className={`h-5 w-5 ${
                    i < 3 ? "text-[#a0fe08]" : "text-[#a0fe08]"
                  }`}
                />
                {m}
              </div>
            ))}
          </div>
        </Card>
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-[#000100]">Resume Preview</h3>
            <StepPill>ATS ready</StepPill>
          </div>
          <div className={`space-y-2 rounded-2xl bg-[#ffffff] p-4 ${neoIn}`}>
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-2 w-44 rounded bg-slate-300" />
            <div className="mt-4 h-3 w-20 rounded bg-[#d1d3d2]" />
            <div className="h-2 w-full rounded bg-slate-300" />
            <div className="h-2 w-5/6 rounded bg-slate-300" />
            <div className="mt-4 h-3 w-24 rounded bg-[#d1d3d2]" />
            <div className="h-2 w-full rounded bg-slate-300" />
            <div className="h-2 w-4/5 rounded bg-slate-300" />
          </div>
        </Card>
        <div className="mt-5 grid gap-3">
          <PrimaryButton onClick={() => go("analysis")}>
            Analyze Resume <BarChart3 className="h-4 w-4" />
          </PrimaryButton>
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton>Improve with AI</SecondaryButton>
            <SecondaryButton>Edit Manually</SecondaryButton>
          </div>
          <SecondaryButton onClick={() => go("dashboard")}>
            Save Resume
          </SecondaryButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Analysis({ go }) {
  const items = [
    ["ATS Compatibility", 86],
    ["Skills Strength", 78],
    ["Experience Clarity", 74],
    ["Role Relevance", 80],
    ["Formatting", 92],
    ["Missing Keywords", 63],
  ];
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="Resume Analysis"
          subtitle="Score and improvement plan"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card className="text-center">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-[#000100] text-white ">
            <div>
              <div className="text-3xl font-bold">78</div>
              <div className="text-xs">/100</div>
            </div>
          </div>
          <h3 className="mt-4 font-bold text-[#000100]">Good foundation</h3>
          <p className="mt-1 text-sm text-[#666666]">
            AI found 6 improvements before job matching.
          </p>
        </Card>
        <div className="mt-4 space-y-3">
          {items.map(([name, score]) => (
            <Card key={name} className="py-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-[#000100]">{name}</span>
                <span className="text-[#000100]">{score}%</span>
              </div>
              <div
                className={`h-2 overflow-hidden rounded-full bg-[#ffffff] ${neoIn}`}
              >
                <div
                  className="h-full rounded-full bg-[#000100]"
                  style={{ width: `${score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          <PrimaryButton onClick={() => go("skill")}>
            Apply AI Improvements
          </PrimaryButton>
          <SecondaryButton onClick={() => go("skill")}>
            View Missing Skills
          </SecondaryButton>
          <button
            onClick={() => go("dashboard")}
            className="w-full py-2 text-sm text-[#666666]"
          >
            Go to Dashboard
          </button>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Skill({ go }) {
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="Skill Market Analysis"
          subtitle="Compare skills with market demand"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <Sparkles className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card>
          <h3 className="font-bold text-[#000100]">
            Should AI scan the current market?
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            I can scan demo job posts, compare common requirements with your
            resume, and create a skill gap report.
          </p>
          <PrimaryButton className="mt-4" onClick={() => {}}>
            Start scan
          </PrimaryButton>
        </Card>
        <div className="mt-4 space-y-3">
          {[
            ["Already strong", ["Figma", "React", "Research"]],
            ["Missing skills", ["TypeScript", "A/B Testing", "SQL"]],
            ["Trending skills", ["AI workflow", "Design system", "Analytics"]],
            [
              "Learning priorities",
              ["TypeScript basics", "Portfolio case study", "Testing"],
            ],
          ].map(([title, chips]) => (
            <Card key={title}>
              <h3 className="mb-3 font-bold text-[#000100]">{title}</h3>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <StepPill key={c}>{c}</StepPill>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5">
          <PrimaryButton onClick={() => go("dashboard")}>
            Go to Dashboard
          </PrimaryButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function AnalyzingScreen({ go }) {
  const [phase, setPhase] = useState(0);
  const phases = [
    "Hang tight...",
    "Reading resume...",
    "Finding matching companies...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 2200);
    const timer2 = setTimeout(() => setPhase(2), 4400);
    const timer3 = setTimeout(() => go("dashboard"), 7000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhoneShell>
      <Screen noNav>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8 grid h-28 w-28 place-items-center mx-auto">
            {/* Heartbeat filled circle */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4, 0.1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-[#a0fe08]"
            />
            {/* Center icon */}
            <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-[#000100] text-[#a0fe08]">
              <InfinityIcon className="h-10 w-10" />
            </div>
          </div>

          <div className="flex h-12 w-full items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={phase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-bold text-[#000100]"
              >
                {phases[phase]}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Dashboard({
  go = () => {},
  mini = false,
  noNav = false,
  resumes = [],
  selectedResumeId = null,
  onSelectResume = () => {},
}) {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const selectedResume =
    resumes.find((resume) => resume.id === selectedResumeId) || null;
  const activeSelectedResumeId = selectedResumeId;
  const agentUpdates = [
    {
      id: 1,
      time: "09:30",
      sub: "AM",
      title: "New Match Found!",
      desc: "We found a 98% match for a Senior Product Designer role at TechFlow.",
      active: true,
    },
    {
      id: 2,
      time: "11:00",
      sub: "AM",
      title: "Application Viewed",
      desc: "Your application for Frontend Engineer was viewed by Innovate AI.",
      active: false,
    },
    {
      id: 3,
      time: "12:20",
      sub: "PM",
      title: "Resume Tailored",
      desc: "Optimized your resume based on recent job market trends.",
      active: false,
    },
  ];

  return (
    <Screen
      nav={!mini && !noNav}
      floatingNav={noNav}
      go={go}
      activeTab="home"
      className="relative"
    >
      {/* Header with profile + notification */}
      <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pb-3 pt-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => go("profile")}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#000100] text-white"
          >
            <span className="text-sm">🪙</span>
          </button>
          <div className="flex items-center gap-0.5 text-base font-black tracking-tight text-[#000100]">
            syncra
          </div>
        </div>
        <div className="flex items-center overflow-hidden rounded-full bg-[#000100]">
          <button
            onClick={() => go("resumeUpload")}
            className="grid h-9 w-10 place-items-center text-white transition active:opacity-70"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
          <div className="h-4 w-px bg-white/20" />
          <div className="relative">
            <button className="grid h-9 w-10 place-items-center text-white transition active:opacity-70">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#a0fe08]" />
          </div>
        </div>
      </div>

      {/* AI Profile Summary */}
      <Card className="mb-6 border-none shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#000100]">
            AI Profile Summary
          </h2>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
            Target Role
          </p>
          <p className="text-base font-bold text-[#000100]">
            Senior Product Designer
          </p>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
            Work Preference
          </p>
          <p className="text-base font-bold text-[#000100]">New York, NY</p>
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
            Salary Floor
          </p>
          <p className="text-base font-bold text-[#000100]">$150,000</p>
        </div>

        <div className="mb-5 h-px w-full bg-[#eaeceb]" />

        <div className="flex flex-wrap gap-2">
          {["UX Research", "Visual Design", "System Thinking"].map((pill) => (
            <span
              key={pill}
              className="rounded-full bg-[#f4f5f4] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#666666]"
            >
              {pill.toUpperCase()}
            </span>
          ))}
        </div>
      </Card>

      {/* AI Agent Goal Input */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-[#000100]">AI Agent</h2>
        <div className="flex items-center gap-2 rounded-2xl border border-[#d1d3d2] bg-[#ffffff] p-2 shadow-sm focus-within:border-[#000100] focus-within:ring-1 focus-within:ring-[#000100]">
          <button
            onClick={() => {
              if (resumes.length === 0) {
                go("resumeUpload");
                return;
              }
              setIsResumeModalOpen(true);
            }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaeceb] text-[#000100] transition active:opacity-70"
            title={resumes.length === 0 ? "Upload Resume" : "Select Resume"}
          >
            <Plus className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedResume && (
              <div
                onClick={() => setIsResumeModalOpen(true)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#d1d3d2] bg-[#fafafa] px-2.5 py-1.5 transition active:bg-[#eaeceb]"
              >
                <FileText className="h-3.5 w-3.5 text-[#000100]" />
                <span className="max-w-[70px] truncate text-xs font-bold text-[#000100]">
                  {selectedResume.name.replace(/\.pdf$/i, "")}
                </span>
              </div>
            )}
            <input
              type="text"
              placeholder={
                selectedResume ? "Set your agent goals..." : "Ask Syncra anything..."
              }
              className="w-full min-w-0 bg-transparent text-sm text-[#000100] outline-none placeholder:text-[#999999]"
            />
          </div>

          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#000100] text-white transition active:opacity-80"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recent Updates Line Connected List */}
      <div className="mb-2">
        <h2 className="mb-5 text-lg font-bold text-[#000100]">
          Recent Updates
        </h2>
        <div className="relative">
          {/* Continuous vertical line connecting the dots */}
          <div className="absolute bottom-8 left-[65px] top-3 w-[2px] bg-[#d1d3d2]" />

          <div className="space-y-4">
            {agentUpdates.map((update) => (
              <div key={update.id} className="relative flex gap-4">
                {/* Left: Time */}
                <div className="flex w-[42px] shrink-0 flex-col items-end pt-1.5 text-right">
                  <span className="text-[13px] font-black tracking-tight text-[#000100]">
                    {update.time}
                  </span>
                  <span className="text-[10px] font-bold text-[#999999]">
                    {update.sub}
                  </span>
                </div>

                {/* Middle: Dot */}
                <div className="relative z-10 flex w-4 shrink-0 justify-center pt-2.5">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      update.active
                        ? "bg-[#a0fe08] ring-4 ring-[#a0fe08]/30 shadow-[0_0_8px_rgba(160,254,8,0.6)]"
                        : "bg-[#d1d3d2]"
                    }`}
                  />
                </div>

                {/* Right: Content */}
                <div className="flex-1 px-2 pt-1.5 pb-2">
                  <h3 className="text-sm font-bold text-[#000100]">
                    {update.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#666666]">
                    {update.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Selection Bottom Sheet Modal */}
      <AnimatePresence>
        {isResumeModalOpen && resumes.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResumeModalOpen(false)}
              className="absolute inset-0 z-[100] bg-[#000100]/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-[101] flex max-h-[75%] flex-col rounded-t-[2rem] bg-[#eaeceb] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#d1d3d2] px-6 py-5">
                <h2 className="text-lg font-bold text-[#000100]">
                  Select Resume
                </h2>
                <button
                  onClick={() => setIsResumeModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#d1d3d2] text-[#000100] transition active:opacity-70"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                <div className="space-y-3 pb-8">
                  {resumes.map((resume) => {
                    const isSelected = activeSelectedResumeId === resume.id;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => {
                          onSelectResume(resume.id);
                          setIsResumeModalOpen(false);
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#000100] bg-[#ffffff] ring-1 ring-[#000100]"
                            : "border-[#d1d3d2] bg-[#ffffff] hover:bg-[#fafafa]"
                        }`}
                      >
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                            isSelected
                              ? "bg-[#000100] text-white"
                              : "bg-[#eaeceb] text-[#000100]"
                          }`}
                        >
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-[#000100]">
                            {resume.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#666666]">
                            Uploaded {formatUploadDate(resume.uploadedAt)}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#a0fe08]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Screen>
  );
}

function JobsScreen({
  go,
  appliedJobs = [],
  savedJobs = [],
  dashboardFilter = "all",
  setDashboardFilter,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchThreshold, setMatchThreshold] = useState(50);
  const [tempMatchThreshold, setTempMatchThreshold] = useState(50);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState("skills");
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const defaultFilters = {
    workSetting: ["All"],
    experience: ["All"],
    skills: [],
    roles: [],
  };

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);

  const workSettingsOptions = ["All", "Remote", "Hybrid", "On-site"];
  const experienceOptions = [
    "All",
    "Internship",
    "Entry Level",
    "Mid Level",
    "Senior",
  ];
  const skillOptions = [
    "Figma",
    "React",
    "Design Systems",
    "TypeScript",
    "UI/UX",
    "Frontend",
    "JavaScript",
  ];
  const roleOptions = [
    "UX Designer",
    "Product Designer",
    "Frontend Engineer",
    "Data Analyst",
  ];

  const openFilter = () => {
    setTempFilters(activeFilters);
    setTempMatchThreshold(matchThreshold);
    setIsFilterOpen(true);
  };

  const closeFilter = () => setIsFilterOpen(false);

  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setMatchThreshold(tempMatchThreshold);
    closeFilter();
  };

  const clearFilters = () => {
    setTempFilters(defaultFilters);
    setTempMatchThreshold(50);
  };

  const toggleChip = (category, value) => {
    setTempFilters((prev) => {
      const current = prev[category];
      if (value === "All") return { ...prev, [category]: ["All"] };

      let newArr = current.filter((v) => v !== "All");
      if (newArr.includes(value)) {
        newArr = newArr.filter((v) => v !== value);
        if (newArr.length === 0) newArr = ["All"];
      } else {
        newArr = [...newArr, value];
      }
      return { ...prev, [category]: newArr };
    });
  };

  const toggleCheckbox = (category, value) => {
    setTempFilters((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      }
      return { ...prev, [category]: [...current, value] };
    });
  };

  const filters = [
    { key: "recent", label: "Recent", icon: Clock },
    { key: "saved", label: "Saved", icon: Bookmark },
    { key: "applied", label: "Applied", icon: CheckCircle2 },
  ];

  const jobDateLabels = {
    1: "Today May 1",
    2: "Today May 1",
    3: "Yesterday Apr 30",
    4: "Apr 29",
  };

  const filteredJobs = jobs.filter((job) => {
    // Top pill filters
    const isRecent = job.id <= 2;
    if (dashboardFilter === "saved" && !savedJobs.includes(job.id))
      return false;
    if (dashboardFilter === "applied" && !appliedJobs.includes(job.id))
      return false;
    if (dashboardFilter === "recent" && !isRecent) return false;

    // Search query
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Match threshold
    if (job.match < matchThreshold) return false;

    // Work Setting
    if (
      !activeFilters.workSetting.includes("All") &&
      !activeFilters.workSetting.includes(job.workSetting)
    ) {
      return false;
    }

    // Experience Level
    if (
      !activeFilters.experience.includes("All") &&
      !activeFilters.experience.includes(job.type)
    ) {
      return false;
    }

    // Skills
    if (
      activeFilters.skills.length > 0 &&
      !activeFilters.skills.some((s) => job.skills.includes(s))
    ) {
      return false;
    }

    // Roles
    if (
      activeFilters.roles.length > 0 &&
      !activeFilters.roles.some((r) =>
        job.title.toLowerCase().includes(r.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  const groupedFilteredJobs = filteredJobs.reduce((groups, job) => {
    const dateLabel = jobDateLabels[job.id] || "Earlier";
    const existingGroup = groups.find((group) => group.dateLabel === dateLabel);
    if (existingGroup) {
      existingGroup.items.push(job);
    } else {
      groups.push({ dateLabel, items: [job] });
    }
    return groups;
  }, []);

  const toggleSelectJob = (id) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  return (
    <Screen nav activeTab="jobs" go={go} className="relative">
      {/* Header */}
      <div className="sticky top-0 z-40 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pb-4 pt-14">
        <h1 className="text-xl font-bold tracking-tight text-[#000100]">
          Job Results
        </h1>
        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            if (isSelectionMode) setSelectedJobIds([]);
          }}
          className="text-sm font-bold text-[#000100] transition active:opacity-70"
        >
          {isSelectionMode ? "Cancel" : "Select"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#d1d3d2] bg-[#ffffff] p-2 pl-4 shadow-sm focus-within:border-[#000100] focus-within:ring-1 focus-within:ring-[#000100]">
        <Search className="h-5 w-5 text-[#999999]" />
        <input
          type="text"
          placeholder="Search roles, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-[#000100] outline-none placeholder:text-[#999999]"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={openFilter}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#d1d3d2] bg-[#000100] px-4 py-2 text-xs font-bold text-white transition active:opacity-80"
        >
          <Filter className="h-3.5 w-3.5" />
          Filter / All
        </button>
        {filters.map((f) => {
          const FIcon = f.icon;
          const active = dashboardFilter === f.key;
          const count =
            f.key === "applied"
              ? appliedJobs.length
              : f.key === "saved"
              ? savedJobs.length
              : null;
          return (
            <button
              key={f.key}
              onClick={() => setDashboardFilter(active ? "all" : f.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                active
                  ? "bg-[#000100] text-white"
                  : "border border-[#d1d3d2] bg-[#ffffff] text-[#000100]"
              }`}
            >
              <FIcon className="h-3.5 w-3.5" />
              {f.label}
              {count !== null && count > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-[#a0fe08] text-[#000100]"
                      : "bg-[#eaeceb] text-[#000100]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Job cards */}
      {filteredJobs.length === 0 ? (
        <Card className="border-none py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#000100] text-white">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-[#000100]">No jobs found</h3>
          <p className="mt-2 text-sm text-[#666666]">
            Try adjusting your filters or search terms.
          </p>
        </Card>
      ) : (
        groupedFilteredJobs.map((group) => (
          <div key={group.dateLabel} className="mb-5">
            <div className="mb-3 px-1">
              <h3 className="text-sm font-bold text-[#000100]">
                {group.dateLabel}
              </h3>
            </div>

            {group.items.map((job) => {
              const isApplied = appliedJobs.includes(job.id);
              const isSelected = selectedJobIds.includes(job.id);
              return (
                <Card
                  key={job.id}
                  className={`mb-3 cursor-pointer border p-4 shadow-sm transition hover:bg-[#fafafa] ${
                    isSelectionMode && isSelected
                      ? "border-[#000100] ring-1 ring-[#000100]"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    isSelectionMode
                      ? toggleSelectJob(job.id)
                      : go("detail", job)
                  }
                >
                  <div className="flex items-center gap-3">
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-[#000100] bg-[#000100] text-white"
                            : "border-[#d1d3d2] bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    )}
                    <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaeceb] text-sm font-bold text-[#000100]">
                          {job.company[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#000100]">
                            {job.title}
                          </h3>
                          <p className="mt-0.5 truncate text-[11px] text-[#666666]">
                            {job.company} · {job.location}
                          </p>
                        </div>
                      </div>
                      {isApplied ? (
                        <span className="shrink-0 rounded-full bg-[#000100] px-2.5 py-1 text-[10px] font-bold text-white">
                          Applied
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-[#a0fe08] px-2.5 py-1 text-[10px] font-bold text-[#000100]">
                          {job.match}%
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))
      )}

      {/* Floating Action Button for Selection Mode */}
      <AnimatePresence>
        {isSelectionMode && selectedJobIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-24 left-6 right-6 z-40"
          >
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedJobIds([]);
                go("dashboard");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#000100] px-5 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition active:opacity-80"
            >
              Execute Application ({selectedJobIds.length})
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFilter}
              className="absolute inset-0 z-[100] bg-[#000100]/40 backdrop-blur-[2px]"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-[101] flex h-[75%] flex-col rounded-t-[2rem] bg-[#eaeceb] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#d1d3d2] px-6 py-5">
                <h2 className="text-lg font-bold text-[#000100]">Filters</h2>
                <button
                  onClick={closeFilter}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#d1d3d2] text-[#000100] transition active:opacity-70"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                {/* Match Threshold */}
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-bold text-[#000100]">
                    Minimum Match
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-[#d1d3d2]">
                      <div
                        className="absolute bottom-0 left-0 top-0 bg-[#000100] transition-all"
                        style={{
                          width: `${((tempMatchThreshold || 50) - 50) * 2}%`,
                        }}
                      />
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={
                          tempMatchThreshold === "" ? 50 : tempMatchThreshold
                        }
                        onChange={(e) =>
                          setTempMatchThreshold(Number(e.target.value))
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                      />
                    </div>
                    <div className="flex items-center gap-0.5 rounded-lg border border-[#d1d3d2] bg-[#ffffff] px-2 py-1 shadow-sm focus-within:border-[#000100] focus-within:ring-1 focus-within:ring-[#000100]">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={tempMatchThreshold}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempMatchThreshold(val === "" ? "" : Number(val));
                        }}
                        onBlur={() => {
                          let val = tempMatchThreshold;
                          if (val === "" || val < 50) setTempMatchThreshold(50);
                          else if (val > 100) setTempMatchThreshold(100);
                        }}
                        placeholder="50"
                        className="w-8 bg-transparent p-0 text-center text-sm font-bold text-[#000100] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-[#999999]"
                      />
                      <span className="text-sm font-bold text-[#666666]">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Work Setting (ChoiceChip Equivalent) */}
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-bold text-[#000100]">
                    Work Setting
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {workSettingsOptions.map((ws) => {
                      const isActive = tempFilters.workSetting.includes(ws);
                      return (
                        <button
                          key={ws}
                          onClick={() => toggleChip("workSetting", ws)}
                          className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                            isActive
                              ? "border-[#000100] bg-[#000100] text-white"
                              : "border-[#d1d3d2] bg-[#ffffff] text-[#000100]"
                          }`}
                        >
                          {ws}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience Level (ChoiceChip Equivalent) */}
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-bold text-[#000100]">
                    Experience Level
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {experienceOptions.map((el) => {
                      const isActive = tempFilters.experience.includes(el);
                      return (
                        <button
                          key={el}
                          onClick={() => toggleChip("experience", el)}
                          className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                            isActive
                              ? "border-[#000100] bg-[#000100] text-white"
                              : "border-[#d1d3d2] bg-[#ffffff] text-[#000100]"
                          }`}
                        >
                          {el}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills (ExpansionTile Equivalent) */}
                <div className="mb-4 overflow-hidden rounded-2xl border border-[#d1d3d2] bg-[#ffffff]">
                  <button
                    onClick={() =>
                      setExpandedFilter(
                        expandedFilter === "skills" ? "" : "skills"
                      )
                    }
                    className="flex w-full items-center justify-between px-5 py-4 font-bold text-[#000100]"
                  >
                    Skills
                    <ChevronRight
                      className={`h-4 w-4 text-[#666666] transition-transform ${
                        expandedFilter === "skills" ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === "skills" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#d1d3d2] px-5 py-3">
                          {skillOptions.map((skill) => (
                            <label
                              key={skill}
                              className="flex cursor-pointer items-center gap-3 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={tempFilters.skills.includes(skill)}
                                onChange={() => toggleCheckbox("skills", skill)}
                                className="h-4 w-4 cursor-pointer rounded border-[#d1d3d2] text-[#000100] focus:ring-[#000100]"
                              />
                              <span className="text-sm font-medium text-[#666666]">
                                {skill}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Roles (ExpansionTile Equivalent) */}
                <div className="mb-4 overflow-hidden rounded-2xl border border-[#d1d3d2] bg-[#ffffff]">
                  <button
                    onClick={() =>
                      setExpandedFilter(
                        expandedFilter === "roles" ? "" : "roles"
                      )
                    }
                    className="flex w-full items-center justify-between px-5 py-4 font-bold text-[#000100]"
                  >
                    Roles
                    <ChevronRight
                      className={`h-4 w-4 text-[#666666] transition-transform ${
                        expandedFilter === "roles" ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === "roles" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#d1d3d2] px-5 py-3">
                          {roleOptions.map((role) => (
                            <label
                              key={role}
                              className="flex cursor-pointer items-center gap-3 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={tempFilters.roles.includes(role)}
                                onChange={() => toggleCheckbox("roles", role)}
                                className="h-4 w-4 cursor-pointer rounded border-[#d1d3d2] text-[#000100] focus:ring-[#000100]"
                              />
                              <span className="text-sm font-medium text-[#666666]">
                                {role}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center gap-4 border-t border-[#d1d3d2] bg-[#ffffff] p-5 pb-8">
                <button
                  onClick={clearFilters}
                  className="px-2 text-sm font-bold text-[#666666] transition active:opacity-70"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 rounded-xl bg-[#000100] px-5 py-4 text-center text-sm font-bold text-white transition active:opacity-80"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Screen>
  );
}

function JobSetup({ go }) {
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="AI Job Search Setup"
          subtitle="Choose resume and search sources"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <Search className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card>
          <h3 className="font-bold text-[#000100]">Search preferences</h3>
          <div className="mt-4 space-y-3 text-sm text-[#000100]">
            <div className="flex justify-between">
              <span>Role</span>
              <b>UX / Frontend</b>
            </div>
            <div className="flex justify-between">
              <span>Location</span>
              <b>Remote or Taiwan</b>
            </div>
            <div className="flex justify-between">
              <span>Resume</span>
              <b>ATS Resume v2</b>
            </div>
          </div>
        </Card>
        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Sources</h3>
          <div className="mt-3 grid gap-2">
            {[
              "LinkedIn",
              "Indeed",
              "Company career pages",
              "Internship platforms",
            ].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 text-sm text-[#000100]"
              >
                <CheckCircle2 className="h-4 w-4 text-white" />
                {s}
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("running")}>
            Start AI Job Search
          </PrimaryButton>
          <SecondaryButton>Edit Preferences</SecondaryButton>
          <SecondaryButton onClick={() => go("builder")}>
            Edit Resume First
          </SecondaryButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Running({ go }) {
  const steps = [
    "Searching platforms",
    "Checking requirements",
    "Comparing with resume",
    "Filtering by preferences",
    "Ranking best matches",
  ];
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="AI Agent Running"
          subtitle="Background job search"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <InfinityIcon className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card className="text-center">
          <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-[#000100] text-white ">
            <Sparkles className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-[#000100]">
            Searching jobs in the background
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            You can close the app. I&apos;ll notify you when the search is
            complete.
          </p>
        </Card>
        <div className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <Card key={s} className="flex items-center gap-3 py-4">
              <CheckCircle2
                className={`h-5 w-5 ${
                  i < 3 ? "text-[#a0fe08]" : "text-[#a0fe08]"
                }`}
              />
              <span className="text-sm font-medium text-[#000100]">{s}</span>
            </Card>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("complete")}>
            Notify Me When Done
          </PrimaryButton>
          <SecondaryButton onClick={() => go("results")}>
            View Live Progress
          </SecondaryButton>
          <button
            onClick={() => go("dashboard")}
            className="w-full py-2 text-sm text-[#666666]"
          >
            Cancel Search
          </button>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Complete({ go }) {
  return (
    <PhoneShell>
      <Screen>
        <div className="flex min-h-[610px] flex-col justify-center">
          <Card className="text-center">
            <div
              className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-[#eaeceb] text-white ${neoOut}`}
            >
              <Bell className="h-9 w-9" />
            </div>
            <h1 className="text-xl font-bold text-[#000100]">
              Your job search is complete.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#666666]">
              32 jobs found. 8 are strong matches. Tap to review your best
              opportunities.
            </p>
            <PrimaryButton className="mt-6" onClick={() => go("results")}>
              Review best opportunities
            </PrimaryButton>
          </Card>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function JobCard({ job, go }) {
  return (
    <Card className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaeceb] text-sm font-bold text-[#000100] ${neoIn}`}
          >
            {job.company[0]}
          </div>
          <div>
            <h3 className="font-bold text-[#000100]">{job.company}</h3>
            <p className="text-sm text-[#000100]">{job.title}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#666666]">
              <MapPin className="h-3 w-3" /> {job.location}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#a0fe08] px-3 py-1 text-xs font-bold text-[#000100]">
          {job.match}% match
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#666666]">{job.why}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StepPill>{job.type}</StepPill>
        <StepPill>{job.salary}</StepPill>
        <StepPill>Missing: {job.missing[0]}</StepPill>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => go("detail", job)}
          className="rounded-xl bg-[#000100] py-2 text-xs font-bold text-white "
        >
          Details
        </button>
        <button
          className={`rounded-xl bg-[#ffffff] py-2 text-xs font-bold text-[#000100] ${neoOut}`}
        >
          Save
        </button>
        <button
          onClick={() => go("tailor", job)}
          className={`rounded-xl bg-[#ffffff] py-2 text-xs font-bold text-[#000100] ${neoOut}`}
        >
          Apply
        </button>
      </div>
    </Card>
  );
}

function Results({ go }) {
  return (
    <PhoneShell>
      <Screen nav go={go} activeTab="jobs">
        <Header
          title="Job Results"
          subtitle="32 jobs found"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <Briefcase className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["8", "Strong"],
            ["15", "Medium"],
            ["9", "Low"],
          ].map(([n, l]) => (
            <Card key={l} className="p-3">
              <p className="font-bold text-[#000100]">{n}</p>
              <p className="text-[11px] text-[#666666]">{l}</p>
            </Card>
          ))}
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {[
            "Best Match",
            "Remote",
            "Internship",
            "Entry Level",
            "High Salary",
            "Saved",
          ].map((f) => (
            <button
              key={f}
              className={`shrink-0 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] ${neoOut}`}
            >
              {f}
            </button>
          ))}
        </div>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} go={go} />
        ))}
      </Screen>
    </PhoneShell>
  );
}

function Detail({ go, selectedJob }) {
  const job = selectedJob || jobs[0];
  return (
    <PhoneShell>
      <Screen>
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => go("jobs")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#000100] text-white transition active:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium text-[#666666]">{job.company}</p>
            <h2 className="text-xl font-bold tracking-tight text-[#000100]">
              {job.title}
            </h2>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#000100]">Match analysis</h3>
            <span className="rounded-full bg-[#a0fe08] px-3 py-1 text-xs font-bold text-[#000100]">
              {job.match}%
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#666666]">{job.why}</p>
        </Card>

        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Requirement checklist</h3>
          <div className="mt-3 space-y-3">
            {[
              "Resume includes relevant projects",
              "Location and job type match",
              "Strong design/coding keywords",
              ...job.missing.map((m) => `Needs improvement: ${m}`),
            ].map((r, i) => (
              <div
                key={r}
                className="flex items-center gap-2 text-sm text-[#000100]"
              >
                <CheckCircle2
                  className={`h-4 w-4 ${
                    i < 3 ? "text-[#a0fe08]" : "text-[#a0fe08]"
                  }`}
                />
                {r}
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">
            Recommended resume changes
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            Add role-specific keywords, strengthen project impact, and rewrite
            one bullet to show measurable results.
          </p>
        </Card>

        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("submitted", job)}>
            Execute Application
          </PrimaryButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Tailor({ go, selectedJob }) {
  const job = selectedJob || jobs[0];
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="Tailor Resume"
          subtitle={`${job.company} · ${job.title}`}
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <Wand2 className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card>
          <h3 className="font-bold text-[#000100]">Before</h3>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            Created a student app project using React and Figma.
          </p>
        </Card>
        <Card className="mt-4 bg-[#eaeceb]">
          <h3 className="font-bold text-[#000100]">After</h3>
          <p className="mt-2 text-sm leading-6 text-[#000100]">
            Designed and built a responsive AI career prototype with React,
            Figma workflows, and user-centered job matching features.
          </p>
        </Card>
        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Keywords added</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <StepPill>Responsive design</StepPill>
            <StepPill>AI workflow</StepPill>
            <StepPill>Job matching</StepPill>
          </div>
        </Card>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("review", job)}>
            Accept Changes
          </PrimaryButton>
          <SecondaryButton>Edit Changes</SecondaryButton>
          <button
            onClick={() => go("review", job)}
            className="w-full py-2 text-sm text-[#666666]"
          >
            Keep Original Resume
          </button>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Review({ go, selectedJob }) {
  const job = selectedJob || jobs[0];
  return (
    <PhoneShell>
      <Screen>
        <Header
          title="Review Application"
          subtitle="You are always in control"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <Card>
          <h3 className="font-bold text-[#000100]">{job.company}</h3>
          <p className="mt-1 text-sm text-[#666666]">
            {job.title} · {job.location}
          </p>
          <div
            className={`mt-4 rounded-2xl bg-[#eaeceb] p-3 text-sm text-[#000100] ${neoIn}`}
          >
            Review carefully before submitting. You are always in control.
          </div>
        </Card>
        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Selected resume</h3>
          <p className="mt-2 text-sm text-[#666666]">
            Job-tailored Resume v3 · ATS optimized
          </p>
        </Card>
        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Cover letter preview</h3>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            Dear hiring team, I&apos;m excited to apply because this role
            matches my UX, frontend, and AI product interests...
          </p>
        </Card>
        <Card className="mt-4">
          <h3 className="font-bold text-[#000100]">Autofill information</h3>
          <p className="mt-2 text-sm text-[#666666]">
            Name, email, portfolio link, education, work authorization.
          </p>
        </Card>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => go("submitted", job)}>
            Approve & Auto Apply
          </PrimaryButton>
          <SecondaryButton>Edit Application</SecondaryButton>
          <button
            onClick={() => go("dashboard")}
            className="w-full py-2 text-sm text-[#666666]"
          >
            Cancel
          </button>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Submitted({ go, selectedJob, onApply = () => {} }) {
  const job = selectedJob || jobs[0];
  useEffect(() => {
    onApply(job.id);
  }, [job.id, onApply]);
  return (
    <PhoneShell>
      <Screen>
        <div className="flex min-h-[610px] flex-col justify-center">
          <Card className="text-center">
            <div
              className={`mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-[#a0fe08] text-[#000100] ${neoOut}`}
            >
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-xl font-bold text-[#000100]">
              Application submitted
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#666666]">
              {job.company} · {job.title}
            </p>
            <div
              className={`mt-4 rounded-2xl bg-[#ffffff] p-4 text-left text-sm text-[#666666] ${neoIn}`}
            >
              <p>
                <b className="text-[#000100]">Resume:</b> Job-tailored Resume v3
              </p>
              <p>
                <b className="text-[#000100]">Submitted:</b> Today
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={() => go("dashboard")}>
                Back to Home
              </PrimaryButton>
              {/*<SecondaryButton onClick={() => go("dashboard")}>Browse More Jobs</SecondaryButton>*/}
            </div>
          </Card>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Tracker({ go }) {
  const statuses = ["Saved", "Applied", "Interviewing", "Rejected", "Offer"];
  return (
    <PhoneShell>
      <Screen nav go={go} activeTab="jobs">
        <Header
          title="Application Tracker"
          subtitle="Track every opportunity"
          icon={
            <GlassIcon className="h-12 w-12 rounded-2xl">
              <ClipboardList className="h-6 w-6 text-white" />
            </GlassIcon>
          }
        />
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {statuses.map((s) => (
            <button
              key={s}
              className={`shrink-0 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] ${neoOut}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {applications.map((a) => (
            <Card key={a.company}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#000100]">{a.company}</h3>
                  <p className="text-sm text-[#666666]">{a.role}</p>
                </div>
                <StepPill>{a.status}</StepPill>
              </div>
              <p className="mt-3 text-xs text-[#666666]">
                Applied {a.date} · {a.resume}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  className={`rounded-xl bg-[#ffffff] py-2 text-xs font-bold ${neoOut}`}
                >
                  Update
                </button>
                <button className="rounded-xl bg-[#000100] py-2 text-xs font-bold text-white ">
                  Interview
                </button>
                <button
                  className={`rounded-xl bg-[#ffffff] py-2 text-xs font-bold ${neoOut}`}
                >
                  Resume
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Screen>
    </PhoneShell>
  );
}

function ResumesScreen({
  go,
  resumes = [],
  uploadQueue = [],
  onUploadResume = () => {},
  onOpenResume = () => {},
  onDeleteResume = () => {},
}) {
  const fileInputRef = useRef(null);
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onUploadResume(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  return (
    <PhoneShell>
      <Screen>
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-6 flex items-center justify-between bg-transparent px-6 pb-4 pt-14 ">
          <button
            onClick={() => go("profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000100] text-[#a0fe08] transition active:opacity-80"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-[#000100]">Resumes</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#000100] text-white  transition hover:bg-[#333]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            fileInputRef.current?.click()
          }
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`mb-4 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#000100]/30 bg-[#ffffff] text-[#000100] ${neoIn}  transition hover:bg-[#eaeceb]`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Upload className="mb-2 h-7 w-7" />
          <span className="text-sm font-bold">
            Tap to upload or drag & drop
          </span>
          <span className="mt-1 text-xs text-[#666666]">PDF up to 5MB</span>
        </div>

        <div className="space-y-3">
          {uploadQueue.map((item) => (
            <ResumeUploadCard key={item.id} item={item} uploading />
          ))}
          {resumes.map((resume) => (
            <ResumeUploadCard
              key={resume.id}
              item={resume}
              onOpen={() => onOpenResume(resume, "resumes")}
              onDelete={() => onDeleteResume(resume.id)}
            />
          ))}
          {uploadQueue.length === 0 && resumes.length === 0 && (
            <Card className="text-center">
              <div
                className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#000100] text-white ${neoIn}`}
              >
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-[#000100]">No resumes yet</h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Upload a resume to use it for AI matching, tailoring, and
                applications.
              </p>
            </Card>
          )}
        </div>
      </Screen>
    </PhoneShell>
  );
}

function ResumePreviewScreen({
  go,
  resume,
  backTarget = "resumes",
  onDeleteResume = () => {},
}) {
  const canPreviewPdf = resume?.url && isPdfResume(resume);

  return (
    <PhoneShell>
      <div className="relative flex h-full w-full flex-col bg-[#eaeceb]">
        {/* Floating Action Buttons */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 pt-14">
          <button
            onClick={() => go(backTarget)}
            className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#000100] text-white shadow-lg transition active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {resume?.id && (
            <button
              type="button"
              onClick={() => {
                onDeleteResume(resume.id);
                go(backTarget);
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#ffffff] text-[#666666]  transition hover:bg-red-50 hover:text-red-500"
              aria-label="Delete resume"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Full Screen Content Area */}
        {!resume ? (
          <div className="flex flex-1 items-center justify-center p-6 pt-24">
            <Card className="w-full text-center">
              <div
                className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#000100] text-white ${neoIn}`}
              >
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-[#000100]">No resume selected</h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Go back to your resume list and choose a file to preview.
              </p>
            </Card>
          </div>
        ) : canPreviewPdf ? (
          <div className="flex-1 bg-white">
            <iframe
              title={resume.name}
              src={`${resume.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 pt-24">
            <Card className="w-full text-center">
              <div
                className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#000100] text-white ${neoIn}`}
              >
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-[#000100]">
                Preview not available
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Browser in-app preview works best for PDF files. DOC and DOCX
                files are saved in your list, but they cannot be rendered inside
                the phone screen without a document viewer service.
              </p>
            </Card>
          </div>
        )}

        {/* Floating File Name Pill at Bottom */}
        {canPreviewPdf && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 w-full max-w-[80%] -translate-x-1/2 px-4">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-[#000100]/80 px-4 py-2 backdrop-blur-md shadow-lg">
              <FileText className="h-3.5 w-3.5 text-[#a0fe08]" />
              <span className="truncate text-xs font-bold text-white">
                {resume.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}

function Profile({
  go,
  noNav = false,
  appliedCount,
  savedCount,
  jobsCount,
  resumesCount = 0,
}) {
  const accountRows = [{ icon: Settings, label: "Account Settings" }];

  const preferenceRows = [
    { icon: Bell, label: "Notifications" },
    { icon: ShieldCheck, label: "Permissions" },
    { icon: Palette, label: "Appearance" },
  ];

  const resourceRows = [{ icon: HelpCircle, label: "Contact Support" }];

  return (
    <PhoneShell>
      <Screen nav={!noNav} floatingNav={noNav} go={go} activeTab="profile">
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-6 flex items-center bg-[#eaeceb] px-6 pb-4 pt-14">
          <h1 className="text-xl font-bold tracking-tight text-[#000100]">
            Settings
          </h1>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          <div className="flex items-center gap-4 p-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#000100] text-white">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <h2 className="font-bold text-[#000100]">Chris Anderson</h2>
              <p className="text-sm text-[#666666]">@chrisanderson</p>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 text-[#666666]" />
          </div>
          <div className="h-px w-full bg-[#d1d3d2]" />
          <button className="flex w-full items-center justify-between p-4 text-sm font-bold text-[#000100] transition-colors hover:bg-[#eaeceb]">
            Edit Profile
            <ChevronRight className="h-4 w-4 text-[#666666]" />
          </button>
        </div>

        <h3 className="mb-2 ml-4 text-xs font-bold uppercase tracking-wider text-[#666666]">
          Career
        </h3>
        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          {[
            {
              onClick: () => go("resumes"),
              icon: FileText,
              label: "Resumes",
              count: resumesCount,
            },
            {
              onClick: () => go("jobs", null, null, "all"),
              icon: Briefcase,
              label: "Matches",
              count: jobsCount,
            },
            {
              onClick: () => go("jobs", null, null, "saved"),
              icon: Bookmark,
              label: "Saved Roles",
              count: savedCount,
            },
            {
              onClick: () => go("jobs", null, null, "applied"),
              icon: CheckCircle2,
              label: "Applied",
              count: appliedCount,
            },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <button
                onClick={row.onClick}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[#eaeceb]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#000100] text-white">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#000100]">
                    {row.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666666]">{row.count}</span>
                  <ChevronRight className="h-4 w-4 text-[#666666]" />
                </div>
              </button>
              {i < arr.length - 1 && (
                <div className="ml-14 h-px bg-[#d1d3d2]" />
              )}
            </div>
          ))}
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          {accountRows.map((row, i) => (
            <div key={row.label}>
              <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[#eaeceb]">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#000100] text-white">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#000100]">
                    {row.label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#666666]" />
              </button>
              {i < accountRows.length - 1 && (
                <div className="ml-14 h-px bg-[#d1d3d2]" />
              )}
            </div>
          ))}
        </div>

        <h3 className="mb-2 ml-4 text-xs font-bold uppercase tracking-wider text-[#666666]">
          Preferences
        </h3>
        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          {preferenceRows.map((row, i) => (
            <div key={row.label}>
              <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[#eaeceb]">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#000100] text-white">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#000100]">
                    {row.label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#666666]" />
              </button>
              {i < preferenceRows.length - 1 && (
                <div className="ml-14 h-px bg-[#d1d3d2]" />
              )}
            </div>
          ))}
        </div>

        <h3 className="mb-2 ml-4 text-xs font-bold uppercase tracking-wider text-[#666666]">
          Resources
        </h3>
        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          {resourceRows.map((row, i) => (
            <div key={row.label}>
              <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[#eaeceb]">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#000100] text-white">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#000100]">
                    {row.label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#666666]" />
              </button>
              {i < resourceRows.length - 1 && (
                <div className="ml-14 h-px bg-[#d1d3d2]" />
              )}
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={() => go("login")}
          whileTap={{
            scale: 0.97,
            y: 6,
            boxShadow:
              "inset 0 8px 18px rgba(127,29,29,0.45), 0 0 10px rgba(239,68,68,0.45)",
          }}
          transition={{
            type: "spring",
            stiffness: 780,
            damping: 18,
            mass: 0.45,
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-3xl border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm font-bold text-red-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_18px_rgba(239,68,68,0.65),0_0_42px_rgba(239,68,68,0.35)] active:translate-y-1 active:border-red-500 active:bg-red-500 active:text-white"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </motion.button>
      </Screen>
    </PhoneShell>
  );
}

function ViewSwitchIcon({ active, type }) {
  const className = `h-[18px] w-[18px] transition-colors duration-300 ${
    active ? "text-zinc-950" : "text-white/75"
  }`;

  if (type === "web") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="3" y="5" width="18" height="12" rx="2.2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="7" y="3" width="10" height="18" rx="2.4" />
      <path d="M10.5 17h3" />
    </svg>
  );
}

function AgentResumeNotification({ job, onClick }) {
  if (!job?.notification) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="absolute left-4 right-4 top-16 z-[80] flex items-center gap-3 rounded-3xl border border-[#d1d3d2] bg-[#ffffff] p-4 text-left"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#a0fe08] text-[#000100]">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#000100]">
          Syncra AI finished your resume
        </p>
        <p className="mt-1 truncate text-xs text-[#666666]">
          Tap to view the chatbot update and check your resume list.
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#666666]" />
    </motion.button>
  );
}

function ViewSwitchButton({ viewMode, onToggle }) {
  const isWeb = viewMode === "web";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isWeb ? "Switch to mobile view" : "Switch to website view"}
      title={isWeb ? "Switch to mobile view" : "Switch to website view"}
      className="relative h-9 w-[96px] overflow-hidden rounded-full border border-white/25 bg-zinc-950 p-[3px] shadow-[0_14px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.55)]  transition hover:-translate-y-0.5 active:translate-y-0"
    >
      <motion.span
        className="absolute left-[3px] top-[3px] z-0 h-[30px] w-[45px] rounded-full bg-white shadow-[0_7px_16px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(0,0,0,0.06)]"
        animate={{ x: isWeb ? 45 : 0 }}
        transition={{
          type: "spring",
          stiffness: 430,
          damping: 30,
          mass: 0.7,
        }}
      />

      <div className="relative z-10 grid h-full grid-cols-2 items-center">
        <motion.span
          className="grid h-full place-items-center rounded-full"
          animate={{ scale: isWeb ? 0.86 : 1 }}
          transition={{ type: "spring", stiffness: 430, damping: 28 }}
        >
          <ViewSwitchIcon active={!isWeb} type="mobile" />
        </motion.span>
        <motion.span
          className="grid h-full place-items-center rounded-full"
          animate={{ scale: isWeb ? 1 : 0.86 }}
          transition={{ type: "spring", stiffness: 430, damping: 28 }}
        >
          <ViewSwitchIcon active={isWeb} type="web" />
        </motion.span>
      </div>
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [showSplash, setShowSplash] = useState(false);
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [dashboardSelectedResumeId, setDashboardSelectedResumeId] =
    useState(null);
  const [resumePreviewBackTarget, setResumePreviewBackTarget] =
    useState("resumes");
  const [viewMode, setViewMode] = useState("mobile");
  const [chatMode, setChatMode] = useState("setPreferences");
  const [chatBackTarget, setChatBackTarget] = useState("dashboard");
  const [resumeUploadBackTarget, setResumeUploadBackTarget] = useState("login");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [hasReachedDashboard, setHasReachedDashboard] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [resumes, setResumes] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadScreenResumes, setUploadScreenResumes] = useState([]);
  const [uploadScreenQueue, setUploadScreenQueue] = useState([]);
  const [agentResumeJob, setAgentResumeJob] = useState({
    status: "idle",
    notification: false,
    resumeName: "",
  });
  const [agentResumeNotice, setAgentResumeNotice] = useState(null);
  const uploadTimers = useRef([]);
  const uploadScreenTimers = useRef([]);
  const agentResumeTimer = useRef(null);
  const resumesRef = useRef([]);
  const uploadScreenResumesRef = useRef([]);

  useEffect(() => {
    resumesRef.current = resumes;
  }, [resumes]);

  useEffect(() => {
    uploadScreenResumesRef.current = uploadScreenResumes;
  }, [uploadScreenResumes]);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2300);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer));
      uploadScreenTimers.current.forEach((timer) => clearInterval(timer));
      if (agentResumeTimer.current) clearTimeout(agentResumeTimer.current);
      resumesRef.current.forEach(
        (resume) => resume.url && URL.revokeObjectURL(resume.url)
      );
      uploadScreenResumesRef.current.forEach(
        (resume) => resume.url && URL.revokeObjectURL(resume.url)
      );
    };
  }, []);

  const handleUploadResume = (files) => {
    Array.from(files || []).forEach((file) => {
      const id = `${file.name}-${
        file.lastModified
      }-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const baseItem = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
        uploadedAt: new Date().toISOString(),
      };

      if (!isResumeFile(file) || file.size > 5 * 1024 * 1024) {
        setUploadQueue((prev) => [
          {
            ...baseItem,
            status: "error",
            progress: 0,
            error: "Please upload a PDF, DOC, or DOCX file under 5MB.",
          },
          ...prev,
        ]);
        setTimeout(
          () => setUploadQueue((prev) => prev.filter((item) => item.id !== id)),
          3500
        );
        return;
      }

      setUploadQueue((prev) => [{ ...baseItem, progress: 8 }, ...prev]);

      let progress = 8;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + Math.floor(Math.random() * 16) + 8);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress,
                  status: progress >= 100 ? "done" : "uploading",
                }
              : item
          )
        );

        if (progress >= 100) {
          clearInterval(timer);
          const resume = {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file),
          };
          setResumes((prev) => [resume, ...prev]);
          setTimeout(
            () =>
              setUploadQueue((prev) => prev.filter((item) => item.id !== id)),
            800
          );
        }
      }, 260);

      uploadTimers.current.push(timer);
    });
  };

  const handleUploadScreenResume = (files) => {
    Array.from(files || []).forEach((file) => {
      const id = `${file.name}-${
        file.lastModified
      }-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const baseItem = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
        uploadedAt: new Date().toISOString(),
      };

      if (!isResumeFile(file) || file.size > 5 * 1024 * 1024) {
        setUploadScreenQueue((prev) => [
          {
            ...baseItem,
            status: "error",
            progress: 0,
            error: "Please upload a PDF, DOC, or DOCX file under 5MB.",
          },
          ...prev,
        ]);
        setTimeout(
          () =>
            setUploadScreenQueue((prev) =>
              prev.filter((item) => item.id !== id)
            ),
          3500
        );
        return;
      }

      setUploadScreenQueue((prev) => [{ ...baseItem, progress: 8 }, ...prev]);

      let progress = 8;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + Math.floor(Math.random() * 16) + 8);
        setUploadScreenQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress,
                  status: progress >= 100 ? "done" : "uploading",
                }
              : item
          )
        );

        if (progress >= 100) {
          clearInterval(timer);
          const resume = {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file),
          };
          setUploadScreenResumes((prev) => [resume, ...prev]);
          setTimeout(
            () =>
              setUploadScreenQueue((prev) =>
                prev.filter((item) => item.id !== id)
              ),
            800
          );
        }
      }, 260);

      uploadScreenTimers.current.push(timer);
    });
  };

  const clearUploadScreenDrafts = () => {
    uploadScreenTimers.current.forEach((timer) => clearInterval(timer));
    uploadScreenTimers.current = [];
    setUploadScreenQueue([]);
    setUploadScreenResumes((prev) => {
      prev.forEach((resume) => resume.url && URL.revokeObjectURL(resume.url));
      return [];
    });
  };

  const handleContinueWithUploadScreenResume = () => {
    if (uploadScreenResumes.length === 0) return;
    uploadScreenTimers.current.forEach((timer) => clearInterval(timer));
    uploadScreenTimers.current = [];
    setUploadScreenQueue([]);
    setResumes((prev) => [...uploadScreenResumes, ...prev]);
    setUploadScreenResumes([]);
    go("aiChatbot", null, "setPreferences");
  };

  const handleSkipResumeUpload = () => {
    clearUploadScreenDrafts();
    go("dashboard");
  };

  const handleDeleteResume = (resumeId) => {
    setResumes((prev) => {
      const target = prev.find((resume) => resume.id === resumeId);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((resume) => resume.id !== resumeId);
    });
    setUploadScreenResumes((prev) => {
      const target = prev.find((resume) => resume.id === resumeId);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((resume) => resume.id !== resumeId);
    });
    setSelectedResume((prev) => (prev?.id === resumeId ? null : prev));
    setDashboardSelectedResumeId((prev) =>
      prev === resumeId ? null : prev
    );
  };

  const handleOpenResume = (resume, backTarget = "resumes") => {
    setSelectedResume(resume);
    setResumePreviewBackTarget(backTarget);
    setScreen("resumePreview");
  };

  const handleStartBackgroundResume = (answers) => {
    if (agentResumeTimer.current) clearTimeout(agentResumeTimer.current);
    const resumeName = "AI Generated Resume - Chris Anderson.pdf";
    setAgentResumeJob({ status: "running", notification: false, resumeName });

    agentResumeTimer.current = setTimeout(() => {
      const generatedResume = buildAiGeneratedResume(answers);
      setResumes((prev) => [generatedResume, ...prev]);
      setAgentResumeJob({
        status: "done",
        notification: true,
        resumeName: generatedResume.name,
      });
    }, 8800);
  };

  const handleAgentNotificationClick = () => {
    setAgentResumeJob((prev) => ({ ...prev, notification: false }));
    setAgentResumeNotice(null);
    setScreen("resumes");
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleApplyJob = (jobId) => {
    setAppliedJobs((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
  };

  const go = (next, job, mode, filterParam) => {
    const shouldKeepWindowScroll =
      next === "aiChatbot" && (mode === "chatOpen" || mode === "createResume");
    const savedScrollX =
      shouldKeepWindowScroll && typeof window !== "undefined"
        ? window.scrollX
        : 0;
    const savedScrollY =
      shouldKeepWindowScroll && typeof window !== "undefined"
        ? window.scrollY
        : 0;

    if (job) setSelectedJob(job);
    if (
      next === "resumeUpload" &&
      screen !== "resumeUpload" &&
      (screen === "dashboard" || screen === "login")
    ) {
      setResumeUploadBackTarget(screen);
    }
    if (next === "aiChatbot" && screen !== "aiChatbot") {
      setChatBackTarget(screen === "landing" ? "dashboard" : screen);
    }
    if (mode) {
      setChatMode(mode);
      setAgentResumeNotice(null);
    }
    if (filterParam) setDashboardFilter(filterParam);
    if (next === "dashboard") setHasReachedDashboard(true);
    setScreen(next);

    if (shouldKeepWindowScroll && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo(savedScrollX, savedScrollY);
        setTimeout(() => window.scrollTo(savedScrollX, savedScrollY), 0);
      });
    }
  };

  const component = useMemo(() => {
    switch (screen) {
      case "landing":
        return <Landing go={go} />;
      case "loginLoading":
        return <LoginLoadingScreen go={go} />;
      case "login":
        return <Login go={go} resumesCount={resumes.length} />;
      case "signup":
        return <SignUp go={go} />;
      case "resumeUpload":
        return (
          <ResumeUpload
            go={go}
            fromDashboard={hasReachedDashboard}
            backTarget={resumeUploadBackTarget}
            resumes={uploadScreenResumes}
            uploadQueue={uploadScreenQueue}
            onUploadResume={handleUploadScreenResume}
            onOpenResume={handleOpenResume}
            onDeleteResume={handleDeleteResume}
            onContinueWithResume={handleContinueWithUploadScreenResume}
            onSkipForNow={handleSkipResumeUpload}
          />
        );
      case "aiChatbot":
        return (
          <AIChatbot
            key={`${chatMode}-${agentResumeNotice?.timestamp || "normal"}`}
            go={go}
            chatMode={chatMode}
            fromDashboard={hasReachedDashboard}
            backTarget={chatBackTarget}
            hideBottomNav={
              chatMode === "createResume" &&
              chatBackTarget === "resumeUpload" &&
              resumeUploadBackTarget === "login"
            }
            onStartBackgroundResume={handleStartBackgroundResume}
            agentResumeNotice={agentResumeNotice}
          />
        );
      case "setup":
        return <Setup go={go} />;
      case "resumeInput":
        return <ResumeInput go={go} />;
      case "story":
        return <Story go={go} />;
      case "builder":
        return <Builder go={go} />;
      case "analysis":
        return <Analysis go={go} />;
      case "skill":
        return <Skill go={go} />;
      case "dashboard":
        return (
          <Dashboard
            go={go}
            noNav
            resumes={resumes}
            selectedResumeId={dashboardSelectedResumeId}
            onSelectResume={setDashboardSelectedResumeId}
          />
        );
      case "jobs":
        return (
          <JobsScreen
            go={go}
            appliedJobs={appliedJobs}
            savedJobs={savedJobs}
            onSaveJob={handleSaveJob}
            dashboardFilter={dashboardFilter}
            setDashboardFilter={setDashboardFilter}
          />
        );
      case "analyzing":
        return <AnalyzingScreen go={go} />;
      case "jobSetup":
        return <JobSetup go={go} />;
      case "running":
        return <Running go={go} />;
      case "complete":
        return <Complete go={go} />;
      case "results":
        return <Results go={go} />;
      case "detail":
        return <Detail go={go} selectedJob={selectedJob} />;
      case "tailor":
        return <Tailor go={go} selectedJob={selectedJob} />;
      case "review":
        return <Review go={go} selectedJob={selectedJob} />;
      case "submitted":
        return (
          <Submitted
            go={go}
            selectedJob={selectedJob}
            onApply={handleApplyJob}
          />
        );
      case "tracker":
        return <Tracker go={go} />;
      case "resumes":
        return (
          <ResumesScreen
            go={go}
            resumes={resumes}
            uploadQueue={uploadQueue}
            onUploadResume={handleUploadResume}
            onOpenResume={handleOpenResume}
            onDeleteResume={handleDeleteResume}
          />
        );
      case "resumePreview":
        return (
          <ResumePreviewScreen
            go={go}
            resume={selectedResume}
            backTarget={resumePreviewBackTarget}
            onDeleteResume={handleDeleteResume}
          />
        );
      case "profile":
        return (
          <Profile
            go={go}
            noNav
            appliedCount={appliedJobs.length}
            savedCount={savedJobs.length}
            jobsCount={jobs.length}
            resumesCount={resumes.length}
          />
        );
      default:
        return <Landing go={go} />;
    }
  }, [
    screen,
    selectedJob,
    selectedResume,
    dashboardSelectedResumeId,
    resumePreviewBackTarget,
    chatMode,
    chatBackTarget,
    resumeUploadBackTarget,
    agentResumeNotice,
    appliedJobs,
    savedJobs,
    hasReachedDashboard,
    dashboardFilter,
    resumes,
    uploadQueue,
    uploadScreenResumes,
    uploadScreenQueue,
  ]);

  const insideAppTransition = screen !== "landing";
  const hideFirstTimeCreateResumeNav =
    screen === "aiChatbot" &&
    chatMode === "createResume" &&
    chatBackTarget === "resumeUpload" &&
    resumeUploadBackTarget === "login";
  const tabbedScreens = [
    "dashboard",
    "jobs",
    "profile",
    "tracker",
    "aiChatbot",
  ];
  const isTabbed =
    tabbedScreens.includes(screen) && !hideFirstTimeCreateResumeNav;
  const activeTab =
    screen === "profile" || screen === "tracker"
      ? "profile"
      : screen === "jobs"
      ? "jobs"
      : screen === "aiChatbot"
      ? "aiChatbot"
      : "home";

  return (
    <ViewModeContext.Provider value={viewMode}>
      <main className="min-h-screen bg-[#eaeceb] font-sans">
        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
            <div className="fixed left-4 top-4 z-40 flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100]">
                AI Career Copilot Prototype · {screen}
              </div>

              {screen !== "landing" && (
                <button
                  onClick={() => {
                    setScreen("landing");
                  }}
                  className="rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] transition hover:bg-[#eaeceb]"
                >
                  ← Get Started Screen
                </button>
              )}

              {screen !== "landing" && (
                <ViewSwitchButton
                  viewMode={viewMode}
                  onToggle={() =>
                    setViewMode((mode) =>
                      mode === "mobile" ? "web" : "mobile"
                    )
                  }
                />
              )}
            </div>

            {insideAppTransition ? (
              <PhoneShell>
                <ShellStripContext.Provider value={true}>
                  <div className="relative flex h-full min-h-0 flex-1 flex-col">
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <div className="absolute inset-0 h-full min-h-0">
                        {component}
                      </div>
                    </div>
                    <AgentResumeNotification
                      job={agentResumeJob}
                      onClick={handleAgentNotificationClick}
                    />
                    {/* Persistent floating nav bar for tabbed screens */}
                    {isTabbed && (
                      <div className="absolute bottom-6 left-6 right-6 z-40">
                        <BottomNav go={go} activeTab={activeTab} />
                      </div>
                    )}
                  </div>
                </ShellStripContext.Provider>
              </PhoneShell>
            ) : (
              component
            )}
          </>
        )}

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>
      </main>
    </ViewModeContext.Provider>
  );
}
