"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Users, Share2, MousePointerClick, RefreshCw,
  X, ChevronRight, Gift, Phone, Globe, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Entry {
  id: string;
  name: string;
  mobile: string;
  selfieUrl: string;
  uniqueLuckyNumber: string;
  referralCode: string;
  referredBy: string | null;
  language: string;
  step: number;
  isWinner: boolean;
  createdAt: string;
  referredCount: number;
  clickCount: number;
}

interface Stats {
  totalRegistrations: number;
  completedBothSteps: number;
  step1Only: number;
  totalLinkClicks: number;
  winners: number;
  langBreakdown: { language: string; cnt: number }[];
}

interface Winner {
  id: string;
  name: string;
  mobile: string;
  selfieUrl: string;
  uniqueLuckyNumber: string;
}

const LANG_FLAG: Record<string, string> = { en: "🇬🇧", ta: "🇮🇳", hi: "🇮🇳" };
const LANG_LABEL: Record<string, string> = { en: "EN", ta: "தமிழ்", hi: "हिन्दी" };

type Filter = "all" | "step1" | "step2" | "winners";

export default function SpamModule() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingWinner, setPickingWinner] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";
  const headers = { "Content-Type": "application/json", "X-Session-Id": sessionId };

  const load = useCallback(async () => {
    try {
      const [statsRes, entriesRes] = await Promise.all([
        fetch("/api/admin/lucky-draw/stats", { headers }),
        fetch("/api/admin/lucky-draw", { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries ?? []);
        const w = (data.entries ?? []).find((e: Entry) => e.isWinner);
        if (w) setWinner(w);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  async function handlePickWinner() {
    setPickingWinner(true);
    try {
      const res = await fetch("/api/admin/lucky-draw/winner", { method: "POST", headers });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not pick winner");
        return;
      }
      setWinner(data.winner);
      toast.success(`Winner selected: ${data.winner.name}! 🎉`);
      load();
    } catch {
      toast.error("Failed to pick winner");
    } finally {
      setPickingWinner(false);
    }
  }

  async function handleRevokeWinner(id: string) {
    try {
      await fetch("/api/admin/lucky-draw/winner", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ id }),
      });
      setWinner(null);
      toast.success("Winner revoked");
      load();
    } catch {
      toast.error("Failed to revoke");
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  const filtered = entries.filter((e) => {
    if (filter === "step1") return e.step === 1 && !e.isWinner;
    if (filter === "step2") return e.step === 2;
    if (filter === "winners") return e.isWinner;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Gift className="text-yellow-400 w-7 h-7" />
            Lucky Draw Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-1">Electronics giveaway campaign overview</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={process.env.NEXT_PUBLIC_LUCKY_DRAW_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-all"
          >
            <Globe className="w-4 h-4" />
            View Page
          </a>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: Users, label: "Total Entries", value: stats.totalRegistrations, color: "text-blue-400" },
            { icon: CheckCircle2, label: "Completed (Step 2)", value: stats.completedBothSteps, color: "text-green-400" },
            { icon: ChevronRight, label: "Step 1 Only", value: stats.step1Only, color: "text-yellow-400" },
            { icon: MousePointerClick, label: "Link Clicks", value: stats.totalLinkClicks, color: "text-purple-400" },
            { icon: Trophy, label: "Winners", value: stats.winners, color: "text-amber-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-white text-2xl font-black">{value}</p>
              <p className="text-white/50 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Language breakdown */}
      {stats && stats.langBreakdown.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {stats.langBreakdown.map(({ language, cnt }) => (
            <div key={language} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <span>{LANG_FLAG[language] || "🌐"}</span>
              <span className="text-white/70 text-sm">{LANG_LABEL[language] || language}</span>
              <span className="text-white font-bold text-sm">{cnt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Winner section */}
      <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border border-yellow-500/30 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-yellow-300 font-black text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Winner Selection
            </h2>
            <p className="text-yellow-300/60 text-xs mt-1">
              Only participants who completed both steps are eligible
            </p>
          </div>
          {!winner && (
            <button
              onClick={handlePickWinner}
              disabled={pickingWinner || (stats?.completedBothSteps ?? 0) === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "white" }}
            >
              {pickingWinner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
              {pickingWinner ? "Picking..." : "Pick Random Winner"}
            </button>
          )}
        </div>

        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4"
          >
            {winner.selfieUrl && (
              <img
                src={winner.selfieUrl}
                alt={winner.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-yellow-200 text-xs mb-0.5">🏆 Winner</p>
              <p className="text-white font-black text-lg truncate">{winner.name}</p>
              <p className="text-yellow-300/70 text-sm">{winner.uniqueLuckyNumber}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/91${winner.mobile}?text=${encodeURIComponent(`🎉 Congratulations ${winner.name}! You've won our Lucky Draw! Your lucky number ${winner.uniqueLuckyNumber} was selected. Please contact us to claim your prize!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-400 transition-all"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <button
                onClick={() => handleRevokeWinner(winner.id)}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-all"
              >
                Revoke
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "step1", "step2", "winners"] as Filter[]).map((f) => {
          const labels: Record<Filter, string> = {
            all: `All (${entries.length})`,
            step1: `Step 1 Only (${entries.filter(e => e.step === 1 && !e.isWinner).length})`,
            step2: `Completed (${entries.filter(e => e.step === 2).length})`,
            winners: `Winners (${entries.filter(e => e.isWinner).length})`,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Entries table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Photo</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Lucky #</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Name</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Mobile</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Lang</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Step</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Referrals</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Clicks</th>
                <th className="text-left text-white/50 text-xs font-medium px-4 py-3">Registered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-white/30 text-sm py-12">
                      No entries found
                    </td>
                  </tr>
                )}
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="px-4 py-3">
                      {entry.selfieUrl ? (
                        <img
                          src={entry.selfieUrl}
                          alt={entry.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-lg">
                          👤
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm font-bold ${entry.isWinner ? "text-yellow-300" : "text-white/80"}`}>
                        {entry.uniqueLuckyNumber}
                      </span>
                      {entry.isWinner && <span className="ml-1">🏆</span>}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{entry.name}</td>
                    <td className="px-4 py-3 text-white/60 text-sm font-mono">{entry.mobile}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-white/50">{LANG_LABEL[entry.language] || entry.language}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          entry.step === 2
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {entry.step === 2 ? "Complete" : "Step 1"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            style={{ width: `${Math.min(100, (entry.referredCount / 5) * 100)}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-xs">{entry.referredCount}/5</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">{entry.clickCount}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry detail modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedEntry.selfieUrl && (
                <img
                  src={selectedEntry.selfieUrl}
                  alt={selectedEntry.name}
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-300 font-black text-xl">{selectedEntry.uniqueLuckyNumber}</span>
                  {selectedEntry.isWinner && <span className="text-yellow-400 text-sm">🏆 Winner</span>}
                </div>

                {[
                  { label: "Name", value: selectedEntry.name },
                  { label: "Mobile", value: selectedEntry.mobile },
                  { label: "Language", value: LANG_LABEL[selectedEntry.language] || selectedEntry.language },
                  { label: "Step", value: selectedEntry.step === 2 ? "Completed ✓" : "Step 1 Only" },
                  { label: "Referrals Registered", value: `${selectedEntry.referredCount} / 5` },
                  { label: "Link Clicks", value: selectedEntry.clickCount },
                  { label: "Referral Code", value: selectedEntry.referralCode },
                  { label: "Referred By", value: selectedEntry.referredBy || "—" },
                  { label: "Registered", value: new Date(selectedEntry.createdAt).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-white/40 text-sm">{label}</span>
                    <span className="text-white text-sm font-medium text-right max-w-[60%] break-all">{String(value)}</span>
                  </div>
                ))}

                <a
                  href={`https://wa.me/91${selectedEntry.mobile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-400 transition-all mt-2"
                >
                  <Phone className="w-4 h-4" />
                  Open WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
