import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { analyzeResume, getAiFeedback, type AiFeedback, type AiFeedbackResult } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { Candidate } from "../types/resumeTypes";

interface Props {
  visible: boolean;
  onHide: () => void;
  candidate: Candidate | null;
}

const MatchBadge = ({ pct }: { pct: number }) => {
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
  const bg   = pct >= 70 ? "#dcfce7" : pct >= 40 ? "#fef3c7" : "#fee2e2";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", background: bg,
        border: `3px solid ${color}`, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color }}>
          {pct >= 70 ? "Strong Match" : pct >= 40 ? "Partial Match" : "Weak Match"}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>Overall resume fit</div>
      </div>
    </div>
  );
};

const Section = ({ title, items, color }: { title: string; items: string[]; color?: string }) => {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: color ?? "#374151", marginBottom: 6 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 3 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const SkillChips = ({ title, skills, chipColor }: { title: string; skills: string[]; chipColor: string }) => {
  if (!skills?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {skills.map((s, i) => (
          <Tag key={i} value={s} style={{ background: chipColor, color: "#fff", fontSize: 12 }} />
        ))}
      </div>
    </div>
  );
};

const ResumeAnalysisDialog: React.FC<Props> = ({ visible, onHide, candidate }) => {
  const { accessToken } = useAuth();
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !candidate) return;
    setFeedback(null);
    setGeneratedAt(null);
    setError(null);
    loadExisting();
  }, [visible, candidate]);

  const loadExisting = async () => {
    if (!candidate || !accessToken) return;
    setLoading(true);
    try {
      const result: AiFeedbackResult | null = await getAiFeedback(accessToken, candidate.candidateId);
      if (result?.feedback) {
        setFeedback(result.feedback);
        setGeneratedAt(result.generatedAt);
      }
    } catch {
      // no previous analysis — that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyse = async () => {
    if (!candidate || !accessToken) return;
    setAnalysing(true);
    setError(null);
    try {
      const result = await analyzeResume(accessToken, candidate.candidateId);
      setFeedback(result);
      setGeneratedAt(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  };

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#9ca3af" }}>
        {formattedDate ? `Last analysed: ${formattedDate}` : "Not yet analysed"}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button label="Close" severity="secondary" size="small" onClick={onHide} />
        <Button
          label={analysing ? "Analysing…" : feedback ? "Re-analyse" : "Analyse Resume"}
          icon={analysing ? undefined : "pi pi-sparkles"}
          severity="success"
          size="small"
          loading={analysing}
          onClick={handleAnalyse}
          disabled={analysing}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`AI Resume Analysis — ${candidate?.candidateName ?? ""}`}
      footer={footer}
      style={{ width: "640px", maxHeight: "90vh" }}
      modal
    >
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <ProgressSpinner style={{ width: 40, height: 40 }} />
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, padding: "12px 16px", color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !feedback && !error && (
        <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#6b7280" }}>
          <i className="pi pi-sparkles" style={{ fontSize: 32, marginBottom: 12, display: "block", color: "#9ca3af" }} />
          <div style={{ fontSize: 14 }}>Click <strong>Analyse Resume</strong> to compare this candidate against the linked job profile.</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Requires a PDF resume and a linked job profile.</div>
        </div>
      )}

      {!loading && feedback && (
        <div style={{ padding: "4px 0" }}>
          <MatchBadge pct={feedback.match_percentage} />

          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {feedback.summary}
          </div>

          <SkillChips title="Matched Skills" skills={feedback.matched_skills} chipColor="#16a34a" />
          <SkillChips title="Missing Skills" skills={feedback.missing_skills} chipColor="#dc2626" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Section title="Strengths" items={feedback.strengths} color="#15803d" />
            <Section title="Weaknesses" items={feedback.weaknesses} color="#b45309" />
          </div>

          <Section title="Suggestions" items={feedback.suggestions} />
        </div>
      )}
    </Dialog>
  );
};

export default ResumeAnalysisDialog;
