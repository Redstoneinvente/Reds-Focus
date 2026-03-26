import { Badge } from "./types";

export const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }
];

export const BADGES: Record<string, Badge> = {
  "goals-100": {
    id: "goals-100",
    name: "Centurion",
    description: "Completed 100 daily goals",
    icon: "🎯"
  },
  "streak-7": {
    id: "streak-7",
    name: "Week Warrior",
    description: "Maintained a 7-day streak",
    icon: "🔥"
  },
  "streak-30": {
    id: "streak-30",
    name: "Monthly Master",
    description: "Maintained a 30-day streak",
    icon: "🏆"
  },
  "streak-100": {
    id: "streak-100",
    name: "Legendary Focus",
    description: "Maintained a 100-day streak",
    icon: "👑"
  }
};
