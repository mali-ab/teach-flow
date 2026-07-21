import { FileText } from "lucide-react";

export default function Assignments() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
      <p className="text-slate-500 mt-2">Track your pending and completed assignments.</p>

      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <FileText className="w-8 h-8" />
          <span className="text-lg">No assignments yet.</span>
        </div>
      </div>
    </div>
  );
}

