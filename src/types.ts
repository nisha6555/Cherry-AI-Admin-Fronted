export type SessionState = "disconnected" | "connecting" | "idle" | "listening" | "speaking" | "error";

export type TeachingPhase = "intro" | "concept" | "example" | "doubt" | "transition";

export interface ToolCallPayload {
  id: string;
  name: string;
  args: any;
}

export interface LiveTranscription {
  text: string;
  finished: boolean;
  id?: string;
}

export type ThemeType = "cherry" | "matrix" | "cyber" | "sunset" | "slate" | "ivory";

export interface ThemeColors {
  primary: string;
  accent: string;
  glow: string;
  bgGradient: string;
  waveColors: string[];
}

export const THEME_CONFIGS: Record<ThemeType, ThemeColors> = {
  cherry: {
    primary: "#0a3641",
    accent: "#c4f500",
    glow: "rgba(196, 245, 0, 0.35)",
    bgGradient: "from-[#f7f9f6] via-[#f7f9f6] to-[#eff2ee]",
    waveColors: ["#0a3641", "#c4f500", "#124e5d", "#a8d400"],
  },
  matrix: {
    primary: "#0a3641",
    accent: "#c4f500",
    glow: "rgba(196, 245, 0, 0.35)",
    bgGradient: "from-[#f7f9f6] via-[#f7f9f6] to-[#eff2ee]",
    waveColors: ["#0a3641", "#c4f500", "#124e5d", "#a8d400"],
  },
  cyber: {
    primary: "#0a3641",
    accent: "#c4f500",
    glow: "rgba(196, 245, 0, 0.35)",
    bgGradient: "from-[#f7f9f6] via-[#f7f9f6] to-[#eff2ee]",
    waveColors: ["#0a3641", "#c4f500", "#124e5d", "#a8d400"],
  },
  sunset: {
    primary: "#0a3641",
    accent: "#c4f500",
    glow: "rgba(196, 245, 0, 0.35)",
    bgGradient: "from-[#f7f9f6] via-[#f7f9f6] to-[#eff2ee]",
    waveColors: ["#0a3641", "#c4f500", "#124e5d", "#a8d400"],
  },
  slate: {
    primary: "#0a3641",
    accent: "#c4f500",
    glow: "rgba(196, 245, 0, 0.35)",
    bgGradient: "from-[#f7f9f6] via-[#f7f9f6] to-[#eff2ee]",
    waveColors: ["#0a3641", "#c4f500", "#124e5d", "#a8d400"],
  },
  ivory: {
    primary: "#796AEF",
    accent: "#4F46E5",
    glow: "rgba(121, 106, 239, 0.25)",
    bgGradient: "from-[#fafafa] via-[#f5f5f7] to-[#ffffff]",
    waveColors: ["#796AEF", "#4F46E5", "#6366F1", "#A5B4FC"],
  },
};

// ==========================================
// Podcast Types
// ==========================================
export type PodcastLanguage = 
  | "Hinglish"
  | "Hindi"
  | "English"
  | "Tamil"
  | "Telugu"
  | "Marathi"
  | "Bengali"
  | "Gujarati"
  | "Kannada"
  | "Malayalam"
  | "Odia"
  | "Punjabi";

export type PodcastEpisodeType =
  | "rapid_viva"
  | "deep_dive"
  | "doubt_buster"
  | "exam_cram"
  | "story_mode"
  | "exam_booster"
  | "quick_revision"
  | "exam_trap";

export type PodcastAudioEngineMode = "dual_browser_tts" | "neural_cloud_audio" | "offline_cached" | "ai_studio";

export interface PodcastSegment {
  id?: string;
  speaker: "mentor" | "student" | "hostA" | "hostB" | string;
  speakerName: string;
  text: string;
  hindiText?: string;
  audioUrl?: string;
  durationMs?: number;
  intent?: string;
  [key: string]: any;
}

export interface AudioPodcastData {
  id?: string;
  title: string;
  hindiTitle?: string;
  topic?: string;
  subject?: string;
  grade?: string;
  description?: string;
  overview?: string;
  keyTakeaways?: string[];
  language?: PodcastLanguage;
  episodeType?: PodcastEpisodeType;
  durationMinutes?: number;
  durationEstimateSec?: number;
  segments: PodcastSegment[];
  hosts?: {
    mentorName?: string;
    studentName?: string;
    mentor?: any;
    student?: any;
    [key: string]: any;
  };
  audioUrl?: string;
  createdAt?: string | number;
  [key: string]: any;
}

// ==========================================
// Notice Types
// ==========================================
export type NoticePriority = "info" | "warning" | "critical" | "announcement" | "urgent";

export interface SystemNotice {
  id: string;
  title: string;
  message: string;
  priority: NoticePriority;
  active: boolean;
  isActive?: boolean;
  linkText?: string;
  linkUrl?: string;
  actionText?: string;
  actionLink?: string;
  createdAt?: number | string;
  expiresAt?: number | string;
  [key: string]: any;
}

// ==========================================
// Concept Infographic Poster Types
// ==========================================
export interface InfographicCaseStudy {
  title: string;
  scenario: string;
  formulaLatex?: string;
  explanation: string;
  examAngle?: string;
  speedFormulaLatex?: string;
  diagramType?: string;
  caseNumber?: number | string;
  observationText?: string;
  [key: string]: any;
}

export interface InfographicApplication {
  field: string;
  example: string;
  significance: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface ConceptInfographicData {
  mainTitle?: string;
  definitionPill?: string;
  header?: {
    subject: string;
    grade: string;
    chapter?: string;
    topicTag?: string;
    weightageBadge?: string;
    [key: string]: any;
  };
  metadata?: {
    title?: string;
    subjectBadge?: string;
    gradeBadge?: string;
    weightageBadge?: string;
    [key: string]: any;
  };
  conceptSection?: {
    primaryFormulaLatex?: string;
    variables?: Array<{ symbol: string; meaning: string; unit?: string }>;
    corePrinciple?: string;
    badgeText?: string;
    definition?: string;
    [key: string]: any;
  };
  observationSection?: {
    formulaLatex?: string;
    conditions?: Array<{ rawName?: string; conditionLatex?: string; outcome?: string; resultText?: string; [key: string]: any }>;
    keyInsights?: string[];
    badgeText?: string;
    subHeading?: string;
    [key: string]: any;
  };
  vectorFormSection?: {
    generalFormulaLatex?: string;
    magnitudeFormulaLatex?: string;
    derivationSteps?: string[];
    [key: string]: any;
  };
  examTrapsSection?: {
    traps: Array<{ misconception: string; correctConcept: string; trapAlert: string }>;
    [key: string]: any;
  };
  mnemonicSection?: {
    acronym: string;
    explanation: string;
    [key: string]: any;
  };
  caseStudies?: InfographicCaseStudy[];
  applications?: InfographicApplication[];
  [key: string]: any;
}

// ==========================================
// 10-Year PYQ 80/20 Analysis Types
// ==========================================
export interface PYQRepeatTopic {
  id?: string;
  topicName: string;
  chapterName: string;
  frequencyScore?: number;
  yieldTier?: "guaranteed" | "high" | "moderate";
  priorityTier?: "guaranteed" | "high" | "moderate";
  recurrenceFrequency?: string | number;
  marksWeightage?: string | number;
  yearsAppeared?: string[];
  repeatYears?: string[];
  sampleQuestions?: string[];
  examinerNotes?: string;
  masterFormulaOrTheoremLatex?: string;
  questionEvolutionSummary?: string;
  samplePYQSnippet?: string;
  dangerTraps?: string[];
  stepByStepApproach?: string[];
  [key: string]: any;
}

export interface PYQ8020AnalysisReport {
  subject: string;
  grade: string;
  board: string;
  yearsSpan: string;
  estimatedScoreCoveragePercentage: number;
  summaryExecutiveNote: string;
  guaranteedTopics: PYQRepeatTopic[];
  highYieldTopics: PYQRepeatTopic[];
  moderateYieldTopics: PYQRepeatTopic[];
  topTrapsToAvoid: Array<{
    trap: string;
    prevention: string;
    commonMarksLost: number;
    topic?: string;
    fix?: string;
    [key: string]: any;
  }>;
}

// ==========================================
// Marking Weightage Heatmap Types
// ==========================================
export interface ChapterWeightageBreakdown {
  chapterName: string;
  totalMarks: number;
  percentageWeightage: number;
  weightageTier: "tier1_critical" | "tier2_important" | "tier3_foundational";
  dominantQuestionTypes: string[];
  keyHighScoringConcepts: string[];
  unitName?: string;
  marksPercentage?: number;
  topScoringSubTopics?: string[];
  tenYearTrend?: any;
  sectionsBreakdown?: any;
  timeAllocationRecommendedMins?: number;
  [key: string]: any;
}

export interface PYQWeightageHeatmapReport {
  subject: string;
  grade: string;
  board: string;
  totalExamMarks: number;
  analyzedYearsSpan: string;
  executiveHeatmapSummary: string;
  chapterBreakdowns: ChapterWeightageBreakdown[];
  unitSummaries?: Array<{
    unitName: string;
    marks: number;
    chapters: string[];
    totalMarks?: number;
    percentageOfExam?: number;
    [key: string]: any;
  }>;
  sectionWiseDistribution: {
    sectionA_1Mark: { totalMarks: number; questionCount: number; targetTimeMinutes: number; description: string };
    sectionB_2Mark: { totalMarks: number; questionCount: number; targetTimeMinutes: number; description: string };
    sectionC_3Mark: { totalMarks: number; questionCount: number; targetTimeMinutes: number; description: string };
    sectionD_5Mark: { totalMarks: number; questionCount: number; targetTimeMinutes: number; description: string };
    sectionE_4Mark_CaseStudy: { totalMarks: number; questionCount: number; targetTimeMinutes: number; description: string };
  };
  smartExamDayTimeStrategy: {
    bufferReserveMins: number;
    readingTimeStrategy: string;
    revisionChecklist: string[];
    readingTime15MinsPlan?: any;
    sectionOrderSuggestion?: any;
    [key: string]: any;
  };
}

// ==========================================
// AI Predicted Paper Types
// ==========================================
export interface PredictedQuestionItem {
  id: string;
  questionNumber: number;
  section: "A" | "B" | "C" | "D" | "E" | string;
  marks: number;
  questionText: string;
  solutionSteps: string[];
  examinerTrapWarning?: string;
  chapterName?: string;
  likelihoodScore?: number;
  repeatYears?: string[];
  chapter?: string;
  topic?: string;
  predictionConfidence?: number | string;
  pyqReferenceYears?: string[];
  options?: string[];
  hasInternalChoice?: boolean;
  orAlternativeQuestionText?: string;
  officialMarkingScheme?: any;
  [key: string]: any;
}

export interface AIPredictedPaperReport {
  paperCode: string;
  subject: string;
  grade: string;
  board: string;
  academicYear: string;
  totalMarks: number;
  totalTimeMinutes: number;
  generalInstructions: string[];
  highProbabilityScoreTips: string[];
  sectionsSummary?: {
    sectionA: { questionCount: number; totalMarks: number };
    sectionB: { questionCount: number; totalMarks: number };
    sectionC: { questionCount: number; totalMarks: number };
    sectionD: { questionCount: number; totalMarks: number };
    sectionE: { questionCount: number; totalMarks: number };
  };
  questions: PredictedQuestionItem[];
}
