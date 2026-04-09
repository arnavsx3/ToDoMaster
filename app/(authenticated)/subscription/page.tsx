"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface SubsData {
  isSubscribed: boolean;
  subscriptionEnds: string | null;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get("/api/subscription");
      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      const res = await axios.post("/api/subscription");
      setData({
        isSubscribed: res.data.isSubscribed,
        subscriptionEnds: res.data.subscriptionEnds,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <h1 className="text-xl font-medium mb-2">Upgrade to Pro</h1>
      <p className="text-sm text-gray-500 mb-10">
        Unlock unlimited todos with a Pro subscription.
      </p>

      {/* Plan card */}
      <div className="border rounded-xl p-6 mb-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Pro plan</span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            1 month
          </span>
        </div>

        <ul className="text-sm text-gray-500 space-y-2 mb-6">
          {[
            "Unlimited todos",
            "Priority support",
            "Early access to new features",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {f}
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-medium">$9</span>
          <span className="text-sm text-gray-400">/ month</span>
        </div>

        {data?.isSubscribed ? (
          <div className="w-full py-2 text-center text-sm rounded-lg bg-gray-50 text-gray-400 border">
            Already subscribed
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50">
            {subscribing ? "Processing..." : "Subscribe now"}
          </button>
        )}
      </div>

      {/* Current status */}
      {data?.isSubscribed && data.subscriptionEnds && (
        <p className="text-xs text-gray-400">
          Your plan renews on{" "}
          <span className="text-gray-600 font-medium">
            {new Date(data.subscriptionEnds).toLocaleDateString()}
          </span>
        </p>
      )}
    </div>
  );
}
