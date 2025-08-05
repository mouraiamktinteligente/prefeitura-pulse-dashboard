import React, { useState } from 'react';
import { MarketingCampanhaForm } from '@/components/MarketingCampanhaForm';
import { MarketingCampanhasList } from '@/components/MarketingCampanhasList';
import { MarketingImagensGrid } from '@/components/MarketingImagensGrid';
import { useMarketingCampanhas } from '@/hooks/useMarketingCampanhas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Marketing = () => {
  const [campanhaExpandida, setCampanhaExpandida] = useState<string | null>(null);
  const { campanhas } = useMarketingCampanhas();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Marketing Digital
            </h1>
            <p className="text-muted-foreground">
              Crie campanhas e gerencie conteúdo visual automatizado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de criação */}
          <div className="lg:col-span-1">
            <MarketingCampanhaForm />
            
            <div className="mt-6">
              <MarketingCampanhasList />
            </div>
          </div>

          {/* Área de visualização das imagens */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Imagens Geradas</CardTitle>
              </CardHeader>
              <CardContent>
                {!campanhaExpandida ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">
                      Selecione uma campanha para ver as imagens geradas:
                    </p>
                    
                    {campanhas?.map((campanha) => (
                      <Card key={campanha.id} className="cursor-pointer hover:bg-accent" onClick={() => setCampanhaExpandida(campanha.id)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{campanha.cadastro_clientes?.nome_completo}</h4>
                              <p className="text-sm text-muted-foreground">
                                {campanha.tipo_solicitacao === 'analise' ? '📊 Análise' : '✍️ Descrição'} • 
                                {campanha.tipo_postagem === 'feed' ? ' 📱 Feed' : 
                                 campanha.tipo_postagem === 'story' ? ' 📖 Story' : ' 📱📖 Ambos'}
                              </p>
                            </div>
                            <Badge className={
                              campanha.status_campanha === 'enviada' ? 'bg-blue-500' :
                              campanha.status_campanha === 'processando' ? 'bg-yellow-500' :
                              campanha.status_campanha === 'concluida' ? 'bg-green-500' : 'bg-red-500'
                            }>
                              {campanha.status_campanha}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {campanhas?.find(c => c.id === campanhaExpandida)?.cadastro_clientes?.nome_completo}
                      </h3>
                      <Button 
                        variant="outline" 
                        onClick={() => setCampanhaExpandida(null)}
                      >
                        ← Voltar
                      </Button>
                    </div>
                    
                    <MarketingImagensGrid campanhaId={campanhaExpandida} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;