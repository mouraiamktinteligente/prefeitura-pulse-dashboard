
import React, { useState, useEffect } from 'react';
import { MetricsCards } from '@/components/MetricsCards';
import { SentimentAnalysis } from '@/components/SentimentAnalysis';
import { EngagementChart } from '@/components/EngagementChart';
import { CommentsRanking } from '@/components/CommentsRanking';
import { HeatMap } from '@/components/HeatMap';
import { SatisfactionThermometer } from '@/components/SatisfactionThermometer';
import { CrisisTimeline } from '@/components/CrisisTimeline';
import { MaliciousComments } from '@/components/MaliciousComments';

const Index = () => {
  const [isConnected, setIsConnected] = useState(true);

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Metrics Cards - Span full width on mobile, 2 cols on large screens */}
          <div className="lg:col-span-2 xl:col-span-3">
            <MetricsCards />
          </div>

          {/* Sentiment Analysis */}
          <div className="lg:col-span-1">
            <SentimentAnalysis />
          </div>

          {/* Engagement Chart */}
          <div className="lg:col-span-1">
            <EngagementChart />
          </div>

          {/* Comments Ranking */}
          <div className="lg:col-span-2 xl:col-span-1">
            <CommentsRanking />
          </div>

          {/* Heat Map */}
          <div className="lg:col-span-1">
            <HeatMap />
          </div>

          {/* Satisfaction Thermometer */}
          <div className="lg:col-span-1">
            <SatisfactionThermometer />
          </div>

          {/* Crisis Timeline */}
          <div className="lg:col-span-2 xl:col-span-1">
            <CrisisTimeline />
          </div>

          {/* Malicious Comments - Span remaining space */}
          <div className="lg:col-span-2 xl:col-span-3">
            <MaliciousComments />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
