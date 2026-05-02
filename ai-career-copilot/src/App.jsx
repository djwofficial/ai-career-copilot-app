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
  AlertCircle,
} from "lucide-react";

// --- LOCAL VSCODE IMAGES ---
// Put your actual .jpg/.png files in the `public` folder of your VSCode project.
const PROFILE_IMG_URL = "/profile.jpg";
const LOGO_IMG_URL = "/logo.png";

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
    agentStatus: "drafted",
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
    agentStatus: "drafted",
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
    agentStatus: "matched",
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
    agentStatus: "matched",
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

// Standardized Back Button Layout
const BackButton = ({ onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1 -ml-1 flex shrink-0 items-center justify-center transition active:opacity-60 ${className}`}
    aria-label="Go back"
  >
    <ChevronLeft
      className="h-[28px] w-[28px] text-[#000100]"
      strokeWidth={2.5}
    />
  </button>
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

const PhoneShell = ({ children, forceMobile = false, theme = "light" }) => {
  const stripShell = useContext(ShellStripContext);
  const viewMode = useContext(ViewModeContext);
  const showWebView = viewMode === "web" && !forceMobile;
  const isDark = theme === "dark";
  const statusColor = isDark ? "text-white" : "text-[#000100]";

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
          <div
            className={`pointer-events-none absolute left-0 right-0 top-0 z-50 flex h-14 items-start justify-between px-7 pt-[14px] text-[13px] font-bold tracking-wide ${statusColor}`}
          >
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
          <div
            className={`pointer-events-none absolute bottom-2 left-1/2 z-30 h-1.5 w-36 -translate-x-1/2 rounded-full ${
              isDark ? "bg-white/40" : "bg-[#000100]/40"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

const Screen = ({
  children,
  nav,
  floatingNav,
  floatingBottom,
  className = "",
  go = () => {},
  activeTab = "home",
}) => {
  let pbClass = "pb-5";
  if (floatingBottom && floatingNav) pbClass = "pb-[180px]";
  else if (floatingBottom) pbClass = "pb-28";
  else if (floatingNav) pbClass = "pb-28";

  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col relative ${className}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className={`px-6 pt-8 ${pbClass}`}>{children}</div>
      </div>
      {floatingBottom}
      {nav && (
        <div className="px-6 pb-6 pt-2">
          <BottomNav go={go} activeTab={activeTab} />
        </div>
      )}
    </div>
  );
};

// --- Custom Modern Line-Art Icons for BottomNav ---

const HomeIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {active ? (
      <path
        d="M10.4 3.4a2.5 2.5 0 0 1 3.2 0l6.1 5c.5.4.8 1 .8 1.6v8.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5V10c0-.6.3-1.2.8-1.6l6.1-5Z"
        fill="currentColor"
      />
    ) : (
      <path
        d="M11.1 4.1a1.5 1.5 0 0 1 1.8 0l6.1 5c.3.2.5.6.5 1v8.4a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V10.1c0-.4.2-.8.5-1l6.1-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const BriefcaseIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {active ? (
      <>
        <rect x="3.5" y="8" width="17" height="11" rx="3" fill="currentColor" />
        <path
          d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <rect
          x="3.5"
          y="8"
          width="17"
          height="11"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

const UserIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {active ? (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <circle cx="12" cy="9.5" r="2.75" fill="#ffffff" />
        <path
          d="M6.5 17.5c1-2.5 3-4 5.5-4s4.5 1.5 5.5 4"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ) : (
      <>
        <circle
          cx="12"
          cy="12"
          r="9.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="9.5"
          r="2.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6.5 17.5c1-2.5 3-4 5.5-4s4.5 1.5 5.5 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </>
    )}
  </svg>
);

function BottomNav({ go = () => {}, activeTab = "home" }) {
  const items = [
    { id: "home", target: "dashboard", label: "Home", CustomIcon: HomeIcon },
    { id: "jobs", target: "jobs", label: "Jobs", CustomIcon: BriefcaseIcon },
    {
      id: "profile",
      target: "profile",
      label: "Profile",
      CustomIcon: UserIcon,
    },
  ];

  return (
    <div className="flex h-[68px] w-full items-center rounded-[34px] bg-[#1c1c1e] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      {items.map((item) => {
        const active = activeTab === item.id;
        const Icon = item.CustomIcon;
        return (
          <div key={item.id} className="flex flex-1 justify-center relative">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(item.target, null, item.mode)}
              className={`relative flex h-[52px] items-center justify-center rounded-full transition-colors duration-300 ${
                active
                  ? "text-[#000100] px-5"
                  : "text-[#8e8e93] hover:text-white w-[52px]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[#a0fe08] shadow-[0_0_12px_rgba(160,254,8,0.4)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center">
                <Icon active={active} />
                <span
                  className={`overflow-hidden whitespace-nowrap text-[13.5px] font-bold tracking-wide transition-all duration-300 ease-out ${
                    active
                      ? "max-w-[80px] opacity-100 ml-2.5"
                      : "max-w-0 opacity-0 ml-0"
                  }`}
                >
                  {item.label}
                </span>
              </div>
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

function OSHome({ go }) {
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotif(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const launchApp = (target) => {
    go("splash", null, null, null, target);
  };

  return (
    <PhoneShell theme="dark">
      <div className="relative flex h-full flex-col bg-gradient-to-br from-[#0f172a] via-[#3b0764] to-[#000000] px-5 pb-4 pt-16">
        <AnimatePresence>
          {showNotif && (
            <motion.button
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => launchApp("morningBrief")}
              className="absolute left-3 right-3 top-14 z-50 flex flex-col gap-2 rounded-[24px] bg-[#ffffff]/90 p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform active:scale-[0.98]"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-5 w-5 place-items-center rounded-md bg-[#000100]">
                    <Star className="h-3 w-3 text-[#a0fe08]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#000100]/60">
                    Syncra
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#000100]/40">
                  now
                </span>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#000100]">
                  Agent Update: New Drafts
                </h4>
                <p className="mt-0.5 text-[13.5px] leading-[1.3] text-[#000100]/80">
                  I reviewed 142 new roles overnight and prepared 2 application
                  drafts for TechFlow and Linear. Tap to review.
                </p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-8">
          <button
            onClick={() => launchApp("landing")}
            className="flex flex-col items-center gap-1.5 transition active:opacity-60"
          >
            <div className="grid h-[62px] w-[62px] place-items-center rounded-[18px] bg-[#000100] shadow-lg">
              <Star className="h-8 w-8 text-[#a0fe08]" />
            </div>
            <span className="text-[11px] font-medium text-white shadow-sm">
              Syncra
            </span>
          </button>

          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 opacity-60"
            >
              <div className="h-[62px] w-[62px] rounded-[18px] bg-white/20" />
              <span className="text-[11px] font-medium text-white">App</span>
            </div>
          ))}
        </div>

        <div className="mt-auto mb-1 flex h-[86px] items-center justify-between rounded-[32px] bg-white/20 px-4 backdrop-blur-2xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[60px] w-[60px] rounded-[16px] bg-white/30"
            />
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

function SplashScreen({ go, target = "landing" }) {
  useEffect(() => {
    const timer = setTimeout(() => go(target), 2300);
    return () => clearTimeout(timer);
  }, [go, target]);

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
            src={LOGO_IMG_URL}
            alt="Syncra AI logo"
            className="relative z-10 h-60 w-60 object-contain drop-shadow-[0_18px_35px_rgba(0,1,0,0.18)] sm:h-72 sm:w-72"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = syncraLogoPng;
            }}
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
            src={LOGO_IMG_URL}
            alt="Syncra AI logo"
            className="relative z-10 h-52 w-52 object-contain drop-shadow-[0_18px_35px_rgba(0,1,0,0.18)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = syncraLogoPng;
            }}
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

function Login({ go }) {
  const nextAfterLogin = "dashboard";

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
            Continue as Guest
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
    go("dashboard");
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
              <SecondaryButton onClick={() => go("dashboard")}>
                Google
              </SecondaryButton>
              <SecondaryButton onClick={() => go("dashboard")}>
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

function MorningBrief({ go, userName }) {
  return (
    <PhoneShell theme="dark">
      <div className="flex h-full flex-col justify-center bg-[#000100] px-8 text-left text-white relative overflow-hidden">
        {/* Background ambient glow pushed to the right side */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-20 h-[400px] w-[400px] rounded-full bg-[#a0fe08]/20 blur-[100px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-start"
        >
          <h2 className="text-[40px] font-bold leading-[1.1] tracking-tight text-white">
            Good morning,
            <br />
            {userName}.
          </h2>

          <div className="mt-12">
            <p className="text-[17px] font-medium text-white/60">
              While you were away, I scanned
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                type: "spring",
                bounce: 0.4,
              }}
              className="my-1 text-[100px] leading-[1.05] font-black text-[#a0fe08] tracking-tighter"
            >
              142
            </motion.div>

            <p className="text-[17px] font-medium leading-relaxed text-white/60 max-w-[280px]">
              new roles. <span className="text-white">2</span> perfectly matched
              your Senior Designer goal. I've tailored your resume and prepared
              application drafts.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          className="absolute bottom-10 right-8 z-10"
        >
          <button
            onClick={() => go("dashboard")}
            className="grid h-16 w-16 place-items-center rounded-full bg-[#a0fe08] text-[#000100] shadow-[0_8px_30px_rgba(160,254,8,0.25)] transition active:scale-90 hover:scale-105"
          >
            <ChevronRight className="h-7 w-7 ml-0.5" strokeWidth={3} />
          </button>
        </motion.div>
      </div>
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
  resumes = [],
  onUploadResume = () => {},
  uploadQueue = [],
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

  const careerPromptFlows = {
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
            text: "Hi, Syncra AI, can I help you find new jobs or update your resume today?",
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
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [attachedContext, setAttachedContext] = useState(null);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onUploadResume(files);
    setIsAttachModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    if (isChatOpen && careerPromptFlows[key]) return careerPromptFlows[key];
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

  const isResumeOrCareerShortcutPrompt = (text) => {
    const key = normalizePrompt(text);
    return Boolean(
      createResumeFlows[key] ||
        careerPromptFlows[key] ||
        key.includes("linkedin") ||
        key.includes("find me job") ||
        key.includes("find jobs") ||
        key.includes("find internships") ||
        key.includes("search jobs") ||
        key.includes("job search") ||
        key.includes("look for jobs") ||
        ((key.includes("improve") ||
          key.includes("review") ||
          key.includes("fix")) &&
          key.includes("resume")) ||
        key.includes("salary") ||
        key.includes("career advice") ||
        key.includes("career path")
    );
  };

  const resetCreateResumeSubFlows = () => {
    setHelpWriteAnswers([]);
    setHelpWriteStep(null);
    setTypeItOutActive(false);
  };

  const runPromptFlow = (userText, flow) => {
    const key = normalizePrompt(userText);
    if (chatMode === "createResume" && key === "help me write it") {
      startHelpWriteFlow(userText);
    } else if (chatMode === "createResume" && key === "i'll type it out") {
      startTypeItOutFlow(userText);
    } else if (chatMode === "createResume" && key === "use my linkedin") {
      startLinkedInFlow(userText);
    } else {
      addAgentSequence(userText, flow);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    const userText = inputText.trim();
    const flow = getFlowForPrompt(userText);

    if (
      chatMode === "createResume" &&
      flow &&
      (helpWriteStep !== null || typeItOutActive) &&
      isResumeOrCareerShortcutPrompt(userText)
    ) {
      resetCreateResumeSubFlows();
      runPromptFlow(userText, flow);
      return;
    }

    if (chatMode === "createResume" && helpWriteStep !== null) {
      handleHelpWriteAnswer(userText);
      return;
    }

    if (chatMode === "createResume" && typeItOutActive) {
      handleTypeItOutAnswer(userText);
      return;
    }

    if (flow) {
      runPromptFlow(userText, flow);
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
    ? [
        "I'll type it out",
        "Use my LinkedIn",
        "Find me jobs",
        "Improve my resume",
        "Career advice",
        "Salary insights",
      ]
    : ["Remote only", "Full-time", "Entry level", "$50K–$80K"];

  const handleQuickReply = (reply) => {
    if (isTyping) return;
    const flow = getFlowForPrompt(reply);
    if (flow) {
      if (
        chatMode === "createResume" &&
        isResumeOrCareerShortcutPrompt(reply)
      ) {
        resetCreateResumeSubFlows();
      }
      runPromptFlow(reply, flow);
    } else {
      setInputText(reply);
    }
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
      <div className="flex h-full min-h-0 flex-1 flex-col bg-[#eaeceb] pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="shrink-0 mb-5 flex min-h-[88px] items-center justify-between relative z-10 bg-[#eaeceb] px-6 pt-[52px] pb-3"
        >
          <BackButton
            onClick={() =>
              go(backTarget || (fromDashboard ? "dashboard" : "login"))
            }
          />

          <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/60 backdrop-blur-md px-4 py-2 shadow-sm">
            {isTyping ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#a0fe08] shadow-[0_0_8px_rgba(160,254,8,0.8)]" />
            ) : (
              <div className="grid h-4 w-4 place-items-center rounded-full bg-[#000100]">
                <Star className="h-2.5 w-2.5 text-[#a0fe08]" />
              </div>
            )}
            <span className="text-xs font-bold text-[#000100]">
              {isTyping ? "Syncra is drafting..." : "Syncra AI 2.5 Pro"}
            </span>
          </div>

          {!isChatOpen ? (
            <button
              onClick={() => go("dashboard")}
              className="flex h-9 items-center gap-1.5 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 text-xs font-bold text-[#000100] shadow-sm transition active:opacity-70"
            >
              Skip <ArrowRight className="h-3.5 w-3.5 text-[#000100]" />
            </button>
          ) : (
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/40 bg-white/60 text-[#000100] shadow-sm backdrop-blur-md transition active:scale-95">
              <Settings className="h-5 w-5" />
            </button>
          )}
        </motion.div>

        {isChatOpen &&
        messages.length === 1 &&
        !isTyping &&
        messages[0].from === "ai" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center pb-12"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px rgba(160,254,8,0)",
                  "0 0 50px rgba(160,254,8,0.25)",
                  "0 0 0px rgba(160,254,8,0)",
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative mb-8 grid h-32 w-32 place-items-center rounded-full bg-[#000100] shadow-xl"
            >
              <div className="absolute inset-1.5 rounded-full border border-white/10 bg-gradient-to-tr from-white/10 to-transparent" />
              <Star className="relative z-10 h-10 w-10 text-[#a0fe08]" />
              <Sparkles className="absolute right-6 top-6 h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-[22px] font-bold leading-snug tracking-tight text-[#000100]">
              {messages[0].text}
            </h2>
          </motion.div>
        ) : (
          <div
            ref={messagesScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 py-4"
          >
            <div className="flex flex-col pb-4">
              {messages.map((msg, i) => {
                const isAI = msg.from === "ai";
                const isNextSame = messages[i + 1]?.from === msg.from;
                const isPrevSame = messages[i - 1]?.from === msg.from;

                return (
                  <motion.div
                    key={`${msg.from}-${i}-${msg.text.slice(0, 12)}`}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex w-full ${
                      isAI ? "justify-start" : "justify-end"
                    } ${isNextSame ? "mb-1.5" : "mb-5"}`}
                  >
                    {isAI && (
                      <div className="mr-2.5 flex w-7 shrink-0 flex-col justify-end pb-0.5">
                        {!isNextSame && (
                          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#000100] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                            <Star className="h-3.5 w-3.5 text-[#a0fe08]" />
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] px-4 py-3 text-[14.5px] leading-[1.55] shadow-sm ${
                        isAI
                          ? `border border-white/60 bg-[#ffffff] text-[#000100] ${
                              isPrevSame && isNextSame
                                ? "rounded-[20px] rounded-l-sm"
                                : isPrevSame
                                ? "rounded-[22px] rounded-tl-sm rounded-bl-[4px]"
                                : isNextSame
                                ? "rounded-[22px] rounded-bl-sm"
                                : "rounded-[22px] rounded-bl-[4px]"
                            }`
                          : `bg-[#000100] text-white ${
                              isPrevSame && isNextSame
                                ? "rounded-[20px] rounded-r-sm"
                                : isPrevSame
                                ? "rounded-[22px] rounded-tr-sm rounded-br-[4px]"
                                : isNextSame
                                ? "rounded-[22px] rounded-br-sm"
                                : "rounded-[22px] rounded-br-[4px]"
                            }`
                      }`}
                    >
                      {renderMessageText(msg.text)}
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-5 flex w-full justify-start"
                >
                  <div className="mr-2.5 flex w-7 shrink-0 flex-col justify-end pb-0.5">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#000100] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                      <Star className="h-3.5 w-3.5 text-[#a0fe08]" />
                    </div>
                  </div>

                  <div className="flex h-[44px] items-center gap-1.5 rounded-[22px] rounded-bl-[4px] border border-white/60 bg-[#ffffff] px-4 shadow-sm">
                    <motion.span
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "easeInOut",
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#000100]"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "easeInOut",
                        delay: 0.2,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#000100]"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "easeInOut",
                        delay: 0.4,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#000100]"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="relative z-20 shrink-0 bg-gradient-to-t from-[#eaeceb] via-[#eaeceb] to-transparent px-4 sm:px-6 pb-0 pt-2">
          {uploadQueue.length > 0 && (
            <div className="mb-2 flex flex-col gap-2">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d1d3d2] bg-[#ffffff] px-3 py-1.5 text-xs font-bold text-[#000100] shadow-sm"
                >
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#000100] border-t-transparent" />
                  Uploading {item.name}...
                </div>
              ))}
            </div>
          )}

          {attachedContext && (
            <div className="mb-2 px-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#000100] bg-[#ffffff] px-3 py-1.5 text-xs font-bold text-[#000100] shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                <span className="max-w-[150px] truncate">
                  {attachedContext.name}
                </span>
                <button
                  onClick={() => setAttachedContext(null)}
                  className="ml-1 rounded-full p-0.5 transition hover:bg-[#eaeceb]"
                >
                  <Plus className="h-3.5 w-3.5 rotate-45" />
                </button>
              </div>
            </div>
          )}

          {quickReplies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-3 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar"
            >
              {quickReplies.map((q) => {
                let Icon = null;
                const lowerQ = q.toLowerCase();
                if (lowerQ.includes("jobs") || lowerQ.includes("search"))
                  Icon = Search;
                else if (
                  lowerQ.includes("resume") ||
                  lowerQ.includes("linkedin")
                )
                  Icon = FileText;
                else if (lowerQ.includes("advice")) Icon = Sparkles;
                else if (lowerQ.includes("salary") || lowerQ.includes("market"))
                  Icon = BarChart3;
                else if (lowerQ.includes("type")) Icon = PenLine;
                else Icon = InfinityIcon;

                return (
                  <button
                    key={q}
                    onClick={() => handleQuickReply(q)}
                    disabled={isTyping}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#d1d3d2] bg-white/60 px-4 py-2.5 text-xs font-bold text-[#000100] shadow-sm backdrop-blur-md transition active:bg-[#eaeceb] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {q}
                  </button>
                );
              })}
            </motion.div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] focus-within:border-[#000100] focus-within:ring-1 focus-within:ring-[#000100]">
              <button
                onClick={() => setIsAttachModalOpen(true)}
                disabled={isTyping}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaeceb] text-[#000100] transition active:opacity-70 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isTyping
                      ? "Syncra is thinking..."
                      : "Ask Syncra anything..."
                  }
                  disabled={isTyping}
                  className="w-full min-w-0 bg-transparent px-1 text-sm font-medium text-[#000100] outline-none placeholder:text-[#999999] disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isTyping || !inputText.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#000100] text-white transition active:scale-95 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isAttachModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAttachModalOpen(false)}
                  className="absolute inset-0 z-[100] bg-[#000100]/40 backdrop-blur-[2px]"
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 320 }}
                  className="absolute bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[2rem] bg-[#eaeceb] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-8"
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-[#d1d3d2] px-6 py-5">
                    <h2 className="text-lg font-bold text-[#000100]">
                      Add Attachment
                    </h2>
                    <button
                      onClick={() => setIsAttachModalOpen(false)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#d1d3d2] text-[#000100] transition active:opacity-70"
                    >
                      <Plus className="h-5 w-5 rotate-45" />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-4 rounded-2xl bg-[#ffffff] border border-[#d1d3d2] p-4 transition active:bg-[#fafafa]"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eaeceb] text-[#000100]">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-sm font-bold text-[#000100]">
                          Upload Resume
                        </h3>
                        <p className="text-xs text-[#666666] mt-0.5">
                          PDF, DOC up to 5MB
                        </p>
                      </div>
                    </button>

                    {resumes.length > 0 && (
                      <button
                        onClick={() => {
                          setAttachedContext(resumes[0]);
                          setIsAttachModalOpen(false);
                        }}
                        className="flex items-center gap-4 rounded-2xl bg-[#ffffff] border border-[#d1d3d2] p-4 transition active:bg-[#fafafa]"
                      >
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eaeceb] text-[#000100]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="text-sm font-bold text-[#000100]">
                            Use Existing Resume
                          </h3>
                          <p className="text-xs text-[#666666] mt-0.5">
                            {resumes[0].name}
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("landing")} />
        </div>
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
          <PrimaryButton onClick={() => go("dashboard")}>
            Continue <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton onClick={() => go("story")}>
            Let AI help me fill this <Sparkles className="h-4 w-4" />
          </SecondaryButton>
          <TopNavButton onClick={() => go("dashboard")} className="w-full py-3">
            Skip for now <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
          </TopNavButton>
        </div>
      </Screen>
    </PhoneShell>
  );
}

function Story({ go, userName }) {
  const quick = [
    "What roles fit me?",
    "Improve my resume",
    "Salary expectations",
    "Find internships",
  ];
  return (
    <PhoneShell>
      <Screen>
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("dashboard")} />
          <TopNavButton onClick={() => go("dashboard")}>
            Skip <ArrowRight className="h-4 w-4 text-[#a0fe08]" />
          </TopNavButton>
        </div>
        <div className="mb-6 flex items-center justify-between">
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
        </div>
        <div className="space-y-3">
          <div
            className={`max-w-[82%] rounded-2xl rounded-tl-sm border border-[#d1d3d2] bg-[#ffffff] p-4 text-sm leading-6 text-[#000100] ${neoOut} `}
          >
            Hi {userName}, I&apos;ve reviewed your goal. Tell me what
            you&apos;re looking for and I&apos;ll tailor matches.
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("dashboard")} />
        </div>
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("dashboard")} />
        </div>
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("analysis")} />
        </div>
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
  isChatTransition = false,
  onStartChatTransition = () => {},
  onUploadResume = () => {},
  uploadQueue = [],
  userName = "User",
}) {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [actionResolved, setActionResolved] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onUploadResume(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedResume =
    resumes.find((resume) => resume.id === selectedResumeId) || null;
  const activeSelectedResumeId = selectedResumeId;
  const agentUpdates = [
    {
      id: 1,
      time: "09:30",
      sub: "AM",
      title: "Prepared 2 new drafts",
      desc: "Based on overnight matches, I prepared applications for TechFlow and Linear.",
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

  const floatingAiInput = (
    <motion.div
      initial={false}
      animate={{
        bottom: isChatTransition ? "24px" : "112px",
        left: isChatTransition ? "16px" : "24px",
        right: isChatTransition ? "16px" : "24px",
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute z-50"
    >
      <div className="flex items-center gap-2 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] focus-within:border-[#000100] focus-within:ring-1 focus-within:ring-[#000100]">
        <button
          onClick={() => {
            if (resumes.length === 0) {
              fileInputRef.current?.click();
              return;
            }
            setIsResumeModalOpen(true);
          }}
          disabled={isChatTransition}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaeceb] text-[#000100] transition active:opacity-70 disabled:opacity-50"
          title={resumes.length === 0 ? "Upload Resume" : "Select Resume"}
        >
          <Plus className="h-5 w-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {selectedResume && !isChatTransition && (
            <div
              onClick={() => setIsResumeModalOpen(true)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#d1d3d2] bg-[#fafafa] px-2.5 py-1.5 transition active:bg-[#eaeceb]"
            >
              <FileText className="h-3.5 w-3.5 text-[#000100]" />
              <span className="max-w-[70px] truncate text-xs font-bold text-[#000100]">
                {selectedResume.name.replace(/\.pdf$/i, "")}
              </span>
            </div>
          )}
          <input
            type="text"
            readOnly
            onClick={onStartChatTransition}
            placeholder={
              selectedResume && !isChatTransition
                ? "Set your agent goals..."
                : "Ask Syncra anything..."
            }
            className="w-full min-w-0 cursor-pointer bg-transparent px-1 text-sm font-medium text-[#000100] outline-none placeholder:text-[#999999]"
          />
        </div>

        <button
          onClick={onStartChatTransition}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#000100] text-white transition active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <Screen
      nav={!mini && !noNav}
      floatingNav={noNav}
      floatingBottom={!mini ? floatingAiInput : null}
      go={go}
      activeTab="home"
      className="relative"
    >
      <motion.div
        animate={{
          opacity: isChatTransition ? 0 : 1,
          y: isChatTransition ? -30 : 0,
          filter: isChatTransition ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        {/* Header with profile */}
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => go("profile")}
              className="h-11 w-11 overflow-hidden rounded-full bg-[#000100] shadow-sm transition active:opacity-80"
            >
              <img
                src={PROFILE_IMG_URL}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${userName}&background=000100&color=a0fe08`;
                }}
              />
            </button>
            <div className="text-xl font-black tracking-tight text-[#000100]">
              {userName}
            </div>
          </div>
        </div>

        {/* Agent Action Required */}
        <AnimatePresence>
          {!actionResolved && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-3xl bg-[#000100] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <div className="mb-3 flex items-center gap-2 text-[#fbbf24]">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-[#fbbf24]/20">
                    <AlertCircle className="h-3.5 w-3.5 text-[#fbbf24]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#fbbf24]">
                    Action Required
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Missing Portfolio Link
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/70">
                  Notion requires a portfolio link to complete the Product
                  Design Intern application draft.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 focus-within:bg-white/20 transition-colors">
                  <input
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    placeholder="Paste Figma or website link..."
                    className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
                  />
                  <button
                    onClick={() => setActionResolved(true)}
                    disabled={!portfolioLink}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-[#a0fe08] text-[#000100] disabled:bg-white/20 disabled:text-white/40 disabled:opacity-100 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Recent Updates Line Connected List */}
        <div className="mb-4">
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
      </motion.div>

      {/* Resume Selection Bottom Sheet Modal */}
      <AnimatePresence>
        {isResumeModalOpen && (
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
                  <button
                    onClick={() => {
                      setIsResumeModalOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-[#000100]/30 bg-[#ffffff] p-4 text-left transition-all hover:bg-[#fafafa]"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eaeceb] text-[#000100]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-[#000100]">
                        Upload New Resume
                      </h3>
                      <p className="mt-0.5 text-xs text-[#666666]">
                        PDF, DOC up to 5MB
                      </p>
                    </div>
                  </button>

                  {resumes.map((resume) => {
                    const isSelected = activeSelectedResumeId === resume.id;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => {
                          onSelectResume(isSelected ? null : resume.id);
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
  onSaveJob = () => {},
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
      <div className="sticky top-0 z-40 -mx-6 -mt-8 mb-5 flex h-[88px] items-end justify-between bg-[#eaeceb] px-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#000100] mb-0.5">
          Job Results
        </h1>
        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            if (isSelectionMode) setSelectedJobIds([]);
          }}
          className="text-sm font-bold text-[#000100] transition active:opacity-70 mb-1"
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
              const isSaved = savedJobs.includes(job.id);
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
                      <div className="flex shrink-0 items-center gap-2">
                        {isApplied ? (
                          <span className="rounded-full bg-[#000100] px-2.5 py-1 text-[10px] font-bold text-white">
                            Applied
                          </span>
                        ) : job.agentStatus === "drafted" ? (
                          <span className="flex items-center gap-1 rounded-full bg-[#000100] px-2.5 py-1 text-[10px] font-bold text-[#a0fe08]">
                            <Sparkles className="h-3 w-3" /> Drafted
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#a0fe08] px-2.5 py-1 text-[10px] font-bold text-[#000100]">
                            {job.match}% match
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSaveJob(job.id);
                          }}
                          className={`grid h-8 w-8 place-items-center rounded-full transition active:opacity-70 ${
                            isSaved
                              ? "bg-[#000100] text-[#a0fe08]"
                              : "bg-[#eaeceb] text-[#666666] hover:bg-[#000100] hover:text-white"
                          }`}
                          aria-label={isSaved ? "Unsave job" : "Save job"}
                        >
                          <Bookmark
                            className="h-4 w-4"
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
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

function Detail({ go, selectedJob }) {
  const job = selectedJob || jobs[0];
  return (
    <PhoneShell>
      <Screen>
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center gap-2 bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("jobs")} />
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] leading-none mb-1">
              {job.company}
            </p>
            <h2 className="text-lg font-bold tracking-tight text-[#000100] leading-none">
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("detail", job)} />
        </div>
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton onClick={() => go("tailor", job)} />
        </div>
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
            </div>
          </Card>
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
        {/* Standardized Header */}
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-5 flex items-center justify-between bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <div className="flex items-center gap-2">
            <BackButton onClick={() => go("profile")} />
            <h1 className="text-xl font-bold text-[#000100]">Resumes</h1>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#000100] text-white transition hover:bg-[#333]"
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
        {/* Floating Standardized Header over PDF */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-[#eaeceb]/90 to-transparent px-6 pt-[52px] pb-3 min-h-[88px]">
          <BackButton
            onClick={() => go(backTarget)}
            className="pointer-events-auto drop-shadow-md"
          />

          {resume?.id && (
            <button
              type="button"
              onClick={() => {
                onDeleteResume(resume.id);
                go(backTarget);
              }}
              className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-[#ffffff] text-[#666666] shadow-sm transition hover:bg-red-50 hover:text-red-500"
              aria-label="Delete resume"
            >
              <Trash2 className="h-5 w-5" />
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
              className="h-full w-full border-0 bg-white pt-14"
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
  userName = "User",
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
        <div className="sticky top-0 z-50 -mx-6 -mt-8 mb-6 flex items-center gap-2 bg-[#eaeceb] px-6 pt-[52px] pb-3 min-h-[88px]">
          <h1 className="text-2xl font-bold tracking-tight text-[#000100]">
            Settings
          </h1>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-[#d1d3d2] bg-[#ffffff]">
          <div className="flex items-center gap-4 p-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-[#eaeceb]">
              <img
                src={PROFILE_IMG_URL}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${userName}&background=000100&color=a0fe08`;
                }}
              />
            </div>
            <div>
              <h2 className="font-bold text-[#000100]">{userName}</h2>
              <p className="text-sm text-[#666666]">UX Designer</p>
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
  const [userName, setUserName] = useState("Daryn");
  const [screen, setScreen] = useState("osHome");
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
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [hasReachedDashboard, setHasReachedDashboard] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [resumes, setResumes] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [agentResumeJob, setAgentResumeJob] = useState({
    status: "idle",
    notification: false,
    resumeName: "",
  });
  const [agentResumeNotice, setAgentResumeNotice] = useState(null);
  const [isChatTransition, setIsChatTransition] = useState(false);
  const [splashNext, setSplashNext] = useState("landing");

  const uploadTimers = useRef([]);
  const agentResumeTimer = useRef(null);
  const resumesRef = useRef([]);

  useEffect(() => {
    resumesRef.current = resumes;
  }, [resumes]);

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer));
      if (agentResumeTimer.current) clearTimeout(agentResumeTimer.current);
      resumesRef.current.forEach(
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

  const handleDeleteResume = (resumeId) => {
    setResumes((prev) => {
      const target = prev.find((resume) => resume.id === resumeId);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((resume) => resume.id !== resumeId);
    });
    setSelectedResume((prev) => (prev?.id === resumeId ? null : prev));
    setDashboardSelectedResumeId((prev) => (prev === resumeId ? null : prev));
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

  const go = (next, job, mode, filterParam, splashTargetStr) => {
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
    if (next === "aiChatbot" && screen !== "aiChatbot") {
      setChatBackTarget(screen === "landing" ? "dashboard" : screen);
    }
    if (mode) {
      setChatMode(mode);
      setAgentResumeNotice(null);
    }
    if (filterParam) setDashboardFilter(filterParam);
    if (next === "dashboard") setHasReachedDashboard(true);
    if (splashTargetStr) setSplashNext(splashTargetStr);

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
      case "osHome":
        return <OSHome go={go} />;
      case "splash":
        return <SplashScreen go={go} target={splashNext} />;
      case "landing":
        return <Landing go={go} />;
      case "loginLoading":
        return <LoginLoadingScreen go={go} />;
      case "login":
        return <Login go={go} resumesCount={resumes.length} />;
      case "signup":
        return <SignUp go={go} />;
      case "morningBrief":
        return <MorningBrief go={go} userName={userName} />;
      case "aiChatbot":
        return (
          <AIChatbot
            key={`${chatMode}-${agentResumeNotice?.timestamp || "normal"}`}
            go={go}
            chatMode={chatMode}
            fromDashboard={hasReachedDashboard}
            backTarget={chatBackTarget}
            hideBottomNav={
              chatMode === "createResume" && chatBackTarget === "login"
            }
            onStartBackgroundResume={handleStartBackgroundResume}
            agentResumeNotice={agentResumeNotice}
            resumes={resumes}
            onUploadResume={handleUploadResume}
            uploadQueue={uploadQueue}
          />
        );
      case "setup":
        return <Setup go={go} />;
      case "story":
        return <Story go={go} userName={userName} />;
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
            isChatTransition={isChatTransition}
            onStartChatTransition={() => {
              setIsChatTransition(true);
              setTimeout(() => {
                go("aiChatbot", null, "chatOpen");
                setIsChatTransition(false); // Reset immediately after navigation finishes
              }, 350);
            }}
            onUploadResume={handleUploadResume}
            uploadQueue={uploadQueue}
            userName={userName}
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
            userName={userName}
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
    agentResumeNotice,
    appliedJobs,
    savedJobs,
    hasReachedDashboard,
    dashboardFilter,
    resumes,
    uploadQueue,
    isChatTransition,
    splashNext,
    userName,
  ]);

  const insideAppTransition =
    screen !== "landing" &&
    screen !== "osHome" &&
    screen !== "splash" &&
    screen !== "loginLoading" &&
    screen !== "login" &&
    screen !== "signup" &&
    screen !== "morningBrief";

  const hideFirstTimeCreateResumeNav =
    screen === "aiChatbot" &&
    chatMode === "createResume" &&
    chatBackTarget === "login";

  const tabbedScreens = ["dashboard", "jobs", "profile"];

  const isTabbed =
    tabbedScreens.includes(screen) && !hideFirstTimeCreateResumeNav;

  const activeTab =
    screen === "profile" ? "profile" : screen === "jobs" ? "jobs" : "home";

  return (
    <ViewModeContext.Provider value={viewMode}>
      <main className="min-h-screen bg-[#eaeceb] font-sans">
        <>
          <div className="fixed left-4 top-4 z-40 flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100]">
              AI Career Copilot Prototype · {screen}
            </div>

            {screen !== "osHome" && (
              <button
                onClick={() => {
                  setScreen("osHome");
                }}
                className="rounded-full border border-[#d1d3d2] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#000100] transition hover:bg-[#eaeceb]"
              >
                ← Return to OS
              </button>
            )}

            {screen !== "osHome" && (
              <ViewSwitchButton
                viewMode={viewMode}
                onToggle={() =>
                  setViewMode((mode) => (mode === "mobile" ? "web" : "mobile"))
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
                  <AnimatePresence>
                    {isTabbed && !isChatTransition && (
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute bottom-6 left-6 right-6 z-40"
                      >
                        <BottomNav go={go} activeTab={activeTab} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ShellStripContext.Provider>
            </PhoneShell>
          ) : (
            component
          )}
        </>

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>
      </main>
    </ViewModeContext.Provider>
  );
}
