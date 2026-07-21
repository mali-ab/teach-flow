import { Video } from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveClasses() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Live Classes</h1>
      <p className="text-slate-500 mt-2">Join ongoing or upcoming live sessions.</p>

      <div className="mt-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Physics - Motion</h3>
              <p className="text-sm text-slate-500">Today 10:00 AM</p>
            </div>
          </div>
          <Link
            to="/meeting/demo-room"
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition"
          >
            Join Class
          </Link>
        </div>
      </div>
    </div>
  );
}

