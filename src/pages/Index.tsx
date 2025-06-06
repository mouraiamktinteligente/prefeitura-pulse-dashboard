
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { MetricsCards } from '../components/MetricsCards';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { SatisfactionThermometer } from '../components/SatisfactionThermometer';
import { EngagementChart } from '../components/EngagementChart';
import { MaliciousComments } from '../components/MaliciousComments';
import { CommentsRanking } from '../components/CommentsRanking';
import { HeatMap } from '../components/HeatMap';
import { CrisisTimeline } from '../components/CrisisTimeline';

const Index = () => {
  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would trigger data refresh in a real implementation
      console.log('Refreshing dashboard data...');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-blue-900">
      <Header isConnected={isConnected} />
      
      <main className="px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <MetricsCards />
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SentimentAnalysis />
            <SatisfactionThermometer />
          </div>
          
          {/* Center Column */}
          <div className="space-y-6">
            <EngagementChart />
            <HeatMap />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <MaliciousComments />
            <CrisisTimeline />
          </div>
        </div>
        
        {/* Comments Ranking - Full Width */}
        <CommentsRanking />
      </main>
    </div>
  );
};

export default Index;
