import React from 'react';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  Frown, 
  Meh,
  ShieldAlert
} from 'lucide-react';
import { ReviewsResponse } from '@/lib/scraper/brightDataReviews';

interface ReviewsAnalysisProps {
  reviewsData: ReviewsResponse | null;
  isLoading: boolean;
}

export default function ReviewsAnalysis({ reviewsData, isLoading }: ReviewsAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] space-y-4">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Analyzing Reviews Intelligence</p>
          <p className="text-[11px] text-slate-500 mt-1">Scraping competitor feedback via Bright Data Scraping Browser...</p>
        </div>
      </div>
    );
  }

  if (!reviewsData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] text-slate-500 text-center space-y-3">
        <MessageSquare className="w-8 h-8 text-slate-600" />
        <div>
          <h4 className="text-sm font-bold text-slate-350">Reviews Intelligence Standby</h4>
          <p className="text-[11px] text-slate-400 mt-1">Run an analysis to analyze competitor rating score and buyer sentiment reviews.</p>
        </div>
      </div>
    );
  }

  const { averageRating, reviews, sentimentBreakdown, isMockData } = reviewsData;

  // Find reviews with ratings <= 3 to highlight competitor gaps/weaknesses
  const negativeReviews = reviews.filter((r) => r.rating <= 3);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Competitor Review Intelligence
          </h3>
          <p className="text-[11px] text-slate-500">
            Analyzing customer sentiment for top competing product
          </p>
        </div>
        
        {isMockData && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            Simulated
          </span>
        )}
      </div>

      {/* Rating & Sentiment Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
        
        {/* Average Rating Block */}
        <div className="flex flex-col items-center justify-center text-center space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Competitor Rating</span>
          <span className="text-3xl font-extrabold text-white font-mono">{averageRating.toFixed(1)}</span>
          <div className="flex text-amber-400 gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                className={`w-3.5 h-3.5 ${
                  idx < Math.round(averageRating) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-750'
                }`} 
              />
            ))}
          </div>
          <span className="text-[9px] text-slate-400 mt-1">Based on scraped feedback</span>
        </div>

        {/* Sentiment Progress Bars */}
        <div className="col-span-2 flex flex-col justify-center space-y-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Sentiment Distribution</span>
          
          {/* Positive */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" /> Positivo
              </span>
              <span className="font-mono text-slate-400 font-bold">{sentimentBreakdown.positive}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${sentimentBreakdown.positive}%` }}
              ></div>
            </div>
          </div>

          {/* Neutral */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Meh className="w-3.5 h-3.5" /> Neutro
              </span>
              <span className="font-mono text-slate-400 font-bold">{sentimentBreakdown.neutral}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="h-full bg-slate-500 rounded-full transition-all duration-500" 
                style={{ width: `${sentimentBreakdown.neutral}%` }}
              ></div>
            </div>
          </div>

          {/* Negative */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Frown className="w-3.5 h-3.5" /> Negativo
              </span>
              <span className="font-mono text-slate-400 font-bold">{sentimentBreakdown.negative}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${sentimentBreakdown.negative}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* Identified Gaps/Complaints Section */}
      {negativeReviews.length > 0 && (
        <div className="p-3 bg-rose-950/15 border border-rose-500/20 rounded-lg space-y-1.5 text-left">
          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Detected Competitor Vulnerabilities (Attack Vectors)
          </h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            These are actual complaints from buyers purchasing from this competitor. StrategyAgent can formulate recommendations to exploit these deficiencies.
          </p>
          <div className="space-y-1 pt-1.5">
            {negativeReviews.map((rev, idx) => (
              <div key={idx} className="bg-slate-950/30 p-2 rounded border border-slate-900 text-[10px] text-slate-350">
                <span className="text-rose-400 font-bold font-mono">[{rev.rating}★] {rev.title}</span>: "{rev.comment}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Extracted Customer Feedback</h4>
        
        <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg text-left hover:border-slate-800 transition"
            >
              <div className="flex justify-between items-center">
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star 
                      key={sIdx} 
                      className={`w-3 h-3 ${sIdx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`} 
                    />
                  ))}
                </div>
                {rev.date && <span className="text-[9px] text-slate-500 font-mono">{rev.date}</span>}
              </div>
              <h5 className="text-xs font-bold text-slate-200 mt-1.5">{rev.title}</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
