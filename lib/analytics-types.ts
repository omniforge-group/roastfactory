export type AnalyticsData = {
  today:     { visitors: number };
  yesterday: { visitors: number };
  week:      { visitors: number };
  prevWeek:  { visitors: number };
  month:     { visitors: number };
  prevMonth: { visitors: number };
  dailyChart: { date: string; visitors: number }[];
  newVsReturning: { new: number; returning: number };
  pages:     { path: string; views: number }[];
  referrers: { referrer: string; sessions: number }[];
  countries: { country: string; sessions: number }[];
};
