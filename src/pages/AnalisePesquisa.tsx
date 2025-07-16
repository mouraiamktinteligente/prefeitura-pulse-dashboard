
import React from 'react';
import { DocumentUpload } from '@/components/DocumentUpload';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';

const AnalisePesquisa = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Análise de Pesquisa
              </h1>
              <p className="text-muted-foreground">
                Envie documentos para análise SWOT e estratégica automatizada
              </p>
            </div>
          </div>
        </div>

        <DocumentUpload />
      </div>
    </div>
  );
};

export default AnalisePesquisa;
