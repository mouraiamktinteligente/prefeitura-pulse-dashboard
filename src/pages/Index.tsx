
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
    <div className="min-h-screen bg-slate-900">
      <Header isConnected={isConnected} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
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
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">@carlos_oliveira</span>
                  <span className="text-xs text-blue-400 bg-blue-600 px-2 py-1 rounded">Instagram</span>
                  <span className="text-xs text-red-400 bg-red-900 px-2 py-1 rounded">alta</span>
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-3 italic">"Imposto alto e serviço ruim!"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">6h atrás</span>
                <div className="flex space-x-2">
                  <button className="text-xs text-blue-400 hover:underline px-2 py-1 border border-blue-600 rounded">👥 Equipe</button>
                  <button className="text-xs text-blue-400 hover:underline px-2 py-1 border border-blue-600 rounded">💬 Responder</button>
                  <button className="text-xs text-blue-400 hover:underline px-2 py-1 border border-blue-600 rounded">👁️ Ocultar</button>
                </div>
              </div>
            </div>
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
