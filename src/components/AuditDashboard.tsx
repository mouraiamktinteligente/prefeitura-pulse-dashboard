import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Clock, Users, Globe } from 'lucide-react';

interface AccessLog {
  id: string;
  email_usuario: string;
  data_hora_login: string;
  data_hora_logout: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

interface AuditDashboardProps {
  logs: AccessLog[];
  filteredLogs: AccessLog[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ logs, filteredLogs }) => {
  const accessesByDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    filteredLogs.forEach(log => {
      const date = new Date(log.data_hora_login).toLocaleDateString('pt-BR');
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, acessos: count }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/');
        const [dayB, monthB, yearB] = b.date.split('/');
        return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime();
      })
      .slice(-30); // Últimos 30 dias
  }, [filteredLogs]);

  const peakHours = useMemo(() => {
    const hourMap = new Map<number, number>();
    
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, 0);
    }
    
    filteredLogs.forEach(log => {
      const hour = new Date(log.data_hora_login).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({ 
        hora: `${String(hour).padStart(2, '0')}:00`, 
        acessos: count 
      }));
  }, [filteredLogs]);

  const averageSessionTime = useMemo(() => {
    const sessionsWithLogout = filteredLogs.filter(log => log.data_hora_logout);
    
    if (sessionsWithLogout.length === 0) return '0 min';
    
    const totalMinutes = sessionsWithLogout.reduce((acc, log) => {
      const loginTime = new Date(log.data_hora_login).getTime();
      const logoutTime = new Date(log.data_hora_logout!).getTime();
      const minutes = (logoutTime - loginTime) / (1000 * 60);
      return acc + minutes;
    }, 0);

    const avgMinutes = Math.round(totalMinutes / sessionsWithLogout.length);
    
    if (avgMinutes >= 60) {
      const hours = Math.floor(avgMinutes / 60);
      const mins = avgMinutes % 60;
      return `${hours}h ${mins}min`;
    }
    
    return `${avgMinutes} min`;
  }, [filteredLogs]);

  const accessesByUser = useMemo(() => {
    const userMap = new Map<string, number>();
    
    filteredLogs.forEach(log => {
      userMap.set(log.email_usuario, (userMap.get(log.email_usuario) || 0) + 1);
    });

    return Array.from(userMap.entries())
      .map(([email, count]) => ({ 
        email: email.split('@')[0], // Mostrar apenas parte antes do @
        acessos: count 
      }))
      .sort((a, b) => b.acessos - a.acessos)
      .slice(0, 10);
  }, [filteredLogs]);

  const accessesByBrowser = useMemo(() => {
    const browserMap = new Map<string, number>();
    
    filteredLogs.forEach(log => {
      const browser = log.user_agent || 'Desconhecido';
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });

    return Array.from(browserMap.entries())
      .map(([navegador, value]) => ({ navegador, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredLogs]);

  const sessionStats = useMemo(() => {
    const total = filteredLogs.length;
    const active = filteredLogs.filter(log => !log.data_hora_logout).length;
    const completed = total - active;
    const trend = total > 0 ? ((active / total) * 100).toFixed(1) : '0';

    return { total, active, completed, trend };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Sessões Totais</p>
                <p className="text-3xl font-bold text-white mt-2">{sessionStats.total}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Sessões Ativas</p>
                <p className="text-3xl font-bold text-white mt-2">{sessionStats.active}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Tempo Médio</p>
                <p className="text-3xl font-bold text-white mt-2">{averageSessionTime}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Taxa Atividade</p>
                <p className="text-3xl font-bold text-white mt-2">{sessionStats.trend}%</p>
              </div>
              <Globe className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acessos por Dia */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">📈 Acessos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accessesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="date" 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Line 
                  type="monotone" 
                  dataKey="acessos" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horários de Pico */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">⏰ Horários de Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="hora" 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  interval={1}
                />
                <YAxis 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="acessos" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acessos por Usuário */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">👥 Top 10 Usuários Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accessesByUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  type="number" 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="email" 
                  stroke="#cbd5e1"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="acessos" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acessos por Navegador */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">🌐 Distribuição por Navegador</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accessesByBrowser}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ navegador, percent }) => 
                    `${navegador.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accessesByBrowser.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
