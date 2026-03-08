import React from "react";

interface LeadTypeBadgeProps {
  leadType?: string;
  leadPrice?: number;
  showPrice?: boolean;
  size?: "sm" | "md";
}

export const LeadTypeBadge = ({ leadType, leadPrice, showPrice = true, size = "sm" }: LeadTypeBadgeProps) => {
  const config = {
    address_only: {
      label: "Door Knock",
      emoji: "🚪",
      bg: "bg-red-100",
      text: "text-red-800",
      price: 30,
    },
    partial: {
      label: "Standard",
      emoji: "📋",
      bg: "bg-amber-100",
      text: "text-amber-800",
      price: 100,
    },
    complete: {
      label: "Premium",
      emoji: "⭐",
      bg: "bg-green-100",
      text: "text-green-800",
      price: 150,
    },
  };

  const type = (leadType || "complete") as keyof typeof config;
  const c = config[type] || config.complete;
  const displayPrice = leadPrice || c.price;
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${c.bg} ${c.text} ${sizeClasses}`}>
      {c.emoji} {c.label}
      {showPrice && <span className="font-bold">${displayPrice}</span>}
    </span>
  );
};
