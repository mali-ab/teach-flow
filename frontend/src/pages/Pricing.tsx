import { useNavigate } from "react-router-dom";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import { useAuth } from "../contexts/AuthContext";
import type { SubscriptionTier } from "../contexts/AuthContext";

const freeFeatures = [
  "30 minutes max meeting duration",
  "Up to 5 participants per meeting",
  "Basic meeting controls",
  "Screen sharing",
  "Chat support",
];

const proFeatures = [
  "Unlimited meeting duration",
  "Up to 30 participants per meeting",
  "Advanced meeting controls",
  "Screen sharing & recording",
  "Priority chat support",
  "Custom meeting backgrounds",
  "Meeting analytics",
];

interface PlanCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  tier: SubscriptionTier;
  isPro?: boolean;
  currentPlan?: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
}

function PlanCard({
  title,
  price,
  description,
  features,
  tier,
  isPro = false,
  currentPlan,
  onUpgrade,
}: PlanCardProps) {
  const isCurrentPlan = currentPlan === tier;

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 p-8 shadow-lg transition-all duration-300 ${
        isPro
          ? "border-blue-500 bg-white scale-105 shadow-blue-200/40"
          : "border-slate-200 bg-white/80"
      }`}
    >
      {/* Recommended Badge */}
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          <SparklesIcon className="w-4 h-4" />
          Recommended
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="text-5xl font-extrabold text-slate-900">
          {price === "Free" ? "$0" : price}
        </span>
        {price !== "Free" && (
          <span className="text-slate-400 text-sm font-medium ml-2">/month</span>
        )}
      </div>

      {/* Features List */}
      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div
              className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                isPro ? "bg-blue-600" : "bg-slate-400"
              }`}
            >
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      {isCurrentPlan ? (
        <div className="w-full text-center py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
          Current Plan ✨
        </div>
      ) : (
        <button
          onClick={() => onUpgrade(tier)}
          className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] ${
            isPro
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {tier === "free" ? "Downgrade" : "Upgrade to Pro"}
        </button>
      )}
    </div>
  );
}

export default function Pricing() {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();

  const currentPlan: SubscriptionTier = user?.subscription || "free";

  const handleUpgrade = (tier: SubscriptionTier) => {
    updateSubscription(tier);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Start with a free plan and upgrade as you grow. No hidden fees, no
            credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {/* Free Plan */}
          <PlanCard
            title="Free"
            price="Free"
            description="Perfect for getting started"
            features={freeFeatures}
            tier="free"
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
          />

          {/* Pro Plan */}
          <PlanCard
            title="Pro"
            price="$12"
            description="For teachers and power users"
            features={proFeatures}
            tier="pro"
            isPro={true}
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Current Subscription Status */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400">
            You are currently on the{" "}
            <span className="font-bold text-slate-700 capitalize">
              {currentPlan}
            </span>{" "}
            plan.{" "}
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2 hover:underline ml-1"
            >
              Back to Dashboard
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

