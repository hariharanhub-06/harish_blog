import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-lg">
                {payload.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-gray-900">
                            {entry.name}: ₹{entry.value?.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface AnalyticsTabProps {
    analytics: any;
}

export default function AnalyticsTab({ analytics }: AnalyticsTabProps) {
    if (!analytics) return null;

    return (
        <div className="lg:col-span-12 space-y-8">
            {/* Cash Flow Patterns Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="mb-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        📊 Cash Flow Patterns
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mt-2">Understand when and how your money moves</p>
                </div>

                {/* Behavioral Insights */}
                {analytics.cashFlowPatterns?.insights?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        {analytics.cashFlowPatterns.insights.map((insight: any, idx: number) => (
                            <div key={idx} className={`p-6 rounded-2xl border-2 ${insight.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                                insight.severity === 'success' ? 'bg-emerald-50 border-emerald-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}>
                                <div className="text-3xl mb-3">{insight.icon}</div>
                                <p className="text-sm font-black text-gray-900 leading-relaxed">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Weekly Spending Pattern */}
                <div className="mb-10">
                    <h4 className="text-lg font-black uppercase tracking-tight mb-6">Weekly Spending Pattern</h4>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries((analytics.cashFlowPatterns?.weeklyPattern || {}) as Record<string, number>).map(([week, amount], idx) => {
                            const values = Object.values(analytics.cashFlowPatterns?.weeklyPattern || {}) as number[];
                            const max = values.length > 0 ? Math.max(...values) : 0;
                            const percentage = max > 0 ? (amount / max) * 100 : 0;
                            return (
                                <div key={week} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Week {idx + 1}
                                        </span>
                                        <span className="text-sm font-black text-gray-900">₹{amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-32 bg-gray-50 rounded-2xl overflow-hidden flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${percentage}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            className={`w-full rounded-t-2xl ${percentage > 75 ? 'bg-red-400' :
                                                percentage > 50 ? 'bg-orange-400' :
                                                    'bg-emerald-400'
                                                }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Cash Flow Calendar Heatmap */}
                <div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-6">Daily Cash Flow</h4>
                    <div className="grid grid-cols-7 gap-3">
                        {(analytics.cashFlowPatterns?.dailyFlow || []).slice(0, 28).map((day: any) => {
                            const isPositive = day.net > 0;
                            const magnitude = Math.abs(day.net);
                            const maxMagnitude = Math.max(...analytics.cashFlowPatterns.dailyFlow.map((d: any) => Math.abs(d.net)));
                            const intensity = maxMagnitude > 0 ? (magnitude / maxMagnitude) : 0;

                            return (
                                <div
                                    key={day.day}
                                    className="aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all hover:scale-110 cursor-pointer"
                                    style={{
                                        backgroundColor: isPositive
                                            ? `rgba(16, 185, 129, ${intensity * 0.5 + 0.1})`
                                            : magnitude > 0
                                                ? `rgba(239, 68, 68, ${intensity * 0.5 + 0.1})`
                                                : '#f9fafb',
                                        borderColor: isPositive
                                            ? `rgba(16, 185, 129, ${intensity * 0.5 + 0.3})`
                                            : magnitude > 0
                                                ? `rgba(239, 68, 68, ${intensity * 0.5 + 0.3})`
                                                : '#e5e7eb'
                                    }}
                                >
                                    <span className="text-xs font-black text-gray-900">{day.day}</span>
                                    {magnitude > 0 && (
                                        <span className="text-[8px] font-bold text-gray-600">₹{Math.round(magnitude / 1000)}k</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-200" />
                            <span className="text-xs font-bold text-gray-600">Positive Flow</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-200" />
                            <span className="text-xs font-bold text-gray-600">Negative Flow</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Velocity Dashboard */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="mb-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        💨 Financial Velocity
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mt-2">Track how fast money moves through your accounts</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Money Lifespan</p>
                        <p className="text-3xl font-black text-blue-900">{analytics.velocity?.moneyLifespan || 0} <span className="text-lg">days</span></p>
                        <p className="text-[10px] font-bold text-blue-600 mt-2">How long your income lasts</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200">
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Daily Burn Rate</p>
                        <p className="text-3xl font-black text-orange-900">₹{analytics.velocity?.dailyBurnRate || 0}<span className="text-lg">/day</span></p>
                        <p className="text-[10px] font-bold text-orange-600 mt-2">Average daily spending</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-200">
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Cash Runway</p>
                        <p className="text-3xl font-black text-emerald-900">{analytics.velocity?.cashRunway || 0} <span className="text-lg">days</span></p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-2">Days until depletion</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
                        <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Turnover Rate</p>
                        <p className="text-3xl font-black text-purple-900">{analytics.velocity?.turnoverRate || 0}<span className="text-lg">x</span></p>
                        <p className="text-[10px] font-bold text-purple-600 mt-2">Money cycles per month</p>
                    </div>
                </div>

                {/* Balance Depletion Chart */}
                <div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-6">Balance Depletion Over Time</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.velocity?.depletionCurve || []}>
                                <defs>
                                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }}
                                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, style: { fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' } }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }}
                                    label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' } }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#balanceGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
