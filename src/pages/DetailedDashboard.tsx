
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Header } from '../components/Header';
import { MetricsCards } from '../components/MetricsCards';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { SatisfactionThermometer } from '../components/SatisfactionThermometer';
import { EngagementChart } from '../components/EngagementChart';
import { MaliciousComments } from '../components/MaliciousComments';
import { CommentsRanking } from '../components/CommentsRanking';
import { CrisisTimeline } from '../components/CrisisTimeline';
import { InstagramLatestPost } from '../components/InstagramLatestPost';
import { useClients } from '@/hooks/useClients';
import { useClientMetrics } from '@/hooks/useClientMetrics';

const DetailedDashboard = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  const navigate = useNavigate();
  
  const selectedClient = clients.find(client => client.id === clientId);
  const { metrics, loading: metricsLoading } = useClientMetrics(selectedClient?.instagram_prefeitura || undefined);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would trigger data refresh in a real implementation
      console.log('Refreshing dashboard data...');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return null;
    try {
      return format(new Date(lastActivity), "dd/MM/yyyy - HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const handleGerarAnalise = () => {
    if (clientId) {
      navigate(`/gestao-clientes/${clientId}`);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900">
      <Header isConnected={true} clientName={selectedClient?.nome_completo} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Última análise info */}
        {metrics.lastActivity && (
          <div className="text-center">
            <p className="text-blue-300 text-sm">
              Última análise: {formatLastActivity(metrics.lastActivity)}
            </p>
          </div>
        )}
        {/* Metrics Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-blue-700 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-blue-600 rounded mb-2"></div>
                <div className="h-8 bg-blue-600 rounded mb-2"></div>
                <div className="h-3 bg-blue-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <MetricsCards 
            totalComments={metrics.totalComments}
            positiveComments={metrics.positiveComments}
            negativeComments={metrics.negativeComments}
            neutralComments={metrics.neutralComments}
          />
        )}
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SentimentAnalysis onGerarAnalise={handleGerarAnalise} />
            <SatisfactionThermometer />
          </div>
          
          {/* Center Column */}
          <div className="space-y-6">
            <EngagementChart profile={selectedClient?.instagram_prefeitura} />
            <InstagramLatestPost profile={selectedClient?.instagram_prefeitura} />
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

export default DetailedDashboard;
