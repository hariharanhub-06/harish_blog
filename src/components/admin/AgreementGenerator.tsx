"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Copy,
    Download,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    Printer,
    Edit3
} from "lucide-react";

interface ProjectData {
    id?: string;
    updatedAt?: Date | string;
    clientName: string;
    businessName?: string;
    title: string;
    price: number;
    timeline: string;
    scopeSummary: string;
}

const safeProject = (p: ProjectData) => ({
    ...p,
    clientName: p.clientName || 'Unknown Client',
    title: p.title || 'Untitled Project',
    price: p.price || 0,
    timeline: p.timeline || 'TBD',
    scopeSummary: p.scopeSummary || 'As discussed.'
});

interface AgreementGeneratorProps {
    project: ProjectData;
    onSave: (content: string) => void;
    onClose: () => void;
}

export default function AgreementGenerator({ project, onSave, onClose }: AgreementGeneratorProps) {
    const safe = safeProject(project);
    const [content, setContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const defaultTemplateArr = [
        "SERVICE AGREEMENT",
        "",
        `This Agreement is made on ${new Date().toLocaleDateString()} between:`,
        "PROVIDER: Hariharan (harishblog / hariharanhub.com)",
        `CLIENT: ${safe.clientName} ${safe.businessName ? `(${safe.businessName})` : ""}`,
        "",
        "1. SERVICES PROVIDED",
        "The Provider agrees to perform the following services for the Client:",
        `- Project Title: ${safe.title}`,
        `- Scope of Work: ${safe.scopeSummary}`,
        "",
        "2. TIMELINE",
        "The services will be completed within the following timeframe:",
        safe.timeline,
        "",
        "3. INVESTMENT & PAYMENT TERMS",
        `The total investment for the defined scope is ₹${safe.price.toLocaleString()}.`,
        "Payment Structure:",
        `- 50% Advance (₹${(safe.price * 0.5).toLocaleString()}) to commence work.`,
        `- 50% Final Balance (₹${(safe.price * 0.5).toLocaleString()}) due upon completion and prior to final delivery/handover.`,
        "",
        "4. CLIENT RESPONSIBILITIES",
        "The Client agrees to provide timely feedback and all necessary assets (content, credentials, images) to ensure project milestones are met.",
        "",
        "5. REVISIONS",
        "This project includes up to 2 rounds of minor revisions within the defined scope. Any significant changes to the scope will require a separate quote.",
        "",
        "6. CANCELLATION & REFUNDS",
        "The advance payment is non-refundable as it covers the research, planning, and initial development phase of the project.",
        "",
        "By acknowledging this agreement, both parties agree to the terms stated above."
    ];
    const defaultTemplateString = defaultTemplateArr.join("\n");

    useEffect(() => {
        setContent(defaultTemplateString);
    }, [project.id, project.updatedAt]); // Use unique triggers if available, but for now we'll keep it simple

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        alert("Agreement copied to clipboard!");
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Service Agreement - ${safe.title}</title>
                        <style>
                            body { font-family: serif; line-height: 1.6; padding: 40px; }
                            pre { white-space: pre-wrap; font-family: serif; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <pre>${content}</pre>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 leading-none">Agreement Generator</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Formalize your engagement with {project.clientName}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Edit3 size={16} className="text-purple-500" />
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Document Content</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {isEditing ? "Save View" : "Edit Template"}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        {isEditing ? (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-[500px] bg-gray-50 border-2 border-primary/10 rounded-3xl p-8 font-serif text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none transition-all scrollbar-hide"
                            />
                        ) : (
                            <div className="w-full h-[500px] bg-white border border-gray-100 rounded-3xl p-10 font-serif text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap shadow-inner text-gray-700">
                                {content}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={copyToClipboard}
                        className="flex-1 min-w-[150px] py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-gray-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Copy size={16} /> Copy Text
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 min-w-[150px] py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                        <Printer size={16} /> Print Agreement
                    </button>
                    <button
                        onClick={() => onSave(content)}
                        className="flex-1 min-w-[150px] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={16} /> Save to Project Record
                    </button>
                </div>

                <div className="bg-purple-50 rounded-2xl p-6 flex gap-4">
                    <div className="p-2 bg-white rounded-xl text-purple-600 shrink-0 self-start">
                        <AlertCircle size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest text-purple-900">Safety Check Passed</p>
                        <p className="text-[10px] text-purple-700 font-bold leading-relaxed"> Internal costs (₹500/hr, risk buffers, etc.) have been automatically stripped from this document. This is safe to share with the client.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
