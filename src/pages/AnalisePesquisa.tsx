
import React from 'react';
import { DocumentUpload } from '@/components/DocumentUpload';

const AnalisePesquisa = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Análise de Pesquisa
          </h1>
          <p className="text-blue-700">
            Envie documentos para análise SWOT e estratégica automatizada
          </p>
        </div>

        <DocumentUpload />
      </div>
    </div>
  );
};

export default AnalisePesquisa;
