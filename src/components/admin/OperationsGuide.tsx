"use client";

import {
    CheckCircle2,
    Send,
    Wallet,
    Rocket,
    RefreshCcw,
    UserCheck,
    FileText,
    ShieldCheck,
    MessageSquare,
    Clock
} from "lucide-react";

export default function OperationsGuide() {
    const steps = [
        {
            id: 1,
            title: "Confirm Requirements",
            icon: MessageSquare,
            color: "text-blue-500",
            bg: "bg-blue-50",
            tasks: [
                "Review client inquiry form in Messages",
                "Confirm scope of work (what is included/excluded)",
                "Confirm delivery timeline",
                "Agree on final project price"
            ]
        },
        {
            id: 2,
            title: "Send Agreement",
            icon: FileText,
            color: "text-purple-500",
            bg: "bg-purple-50",
            tasks: [
                "Go to Client Projects",
                "Generate formal agreement using Project Detail page",
                "Share agreement with client via PDF or Copy-Paste",
                "Wait for written or digital confirmation"
            ]
        },
        {
            id: 3,
            title: "Collect Advance Payment",
            icon: Wallet,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            tasks: [
                "Send invoice for 50% advance",
                "Verify payment receipt in bank/UPI",
                "Update payment status to 'Advance Paid'",
                "Record payment date for accounting"
            ]
        },
        {
            id: 4,
            title: "Project Execution",
            icon: Rocket,
            color: "text-orange-500",
            bg: "bg-orange-50",
            tasks: [
                "Complete onboarding checklist",
                "Phase 1: UI/UX Design & Approval",
                "Phase 2: Development & Integration",
                "Phase 3: Testing & Client Preview"
            ]
        },
        {
            id: 5,
            title: "Final Payment & Delivery",
            icon: ShieldCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
            tasks: [
                "Apply requested revisions",
                "Collect remaining 50% balance",
                "Mark project as 'Fully Paid'",
                "Deliver final files/credentials and close lead"
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Standard Operating Procedure</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900">First Paying Client <br /><span className="text-primary italic">Playbook.</span></h1>
                <p className="text-secondary font-bold text-sm max-w-lg mx-auto">Standardize your workflow to ensure consistent service delivery and professional client management.</p>
            </div>

            <div className="grid gap-6">
                {steps.map((step) => (
                    <div key={step.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row gap-8">
                        <div className="flex md:flex-col items-center gap-4 shrink-0">
                            <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                                <step.icon size={28} />
                            </div>
                            <div className="flex flex-col md:items-center">
                                <span className="text-[10px] font-black italic text-gray-300">Step</span>
                                <span className="text-2xl font-black text-gray-200 leading-none">0{step.id}</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <h3 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4">{step.title}</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {step.tasks.map((task, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all">
                                        <div className={`mt-1 shrink-0 ${step.color}`}>
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{task}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-all" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-primary shrink-0">
                        <UserCheck size={40} />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-black">Professional Accountability</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">By following this guide, you ensure that every client experience is documented, every payment is tracked, and every legal requirement is met. This is how you scale a digital agency.</p>
                    </div>
                    <button className="whitespace-nowrap bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                        Acknowledge & Sync
                    </button>
                </div>
            </div>
        </div>
    );
}
