import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Briefcase, CheckCircle, XCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, loading }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={22} className="stroke-[2.5]" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {loading ? <Skeleton className="h-8 w-16" /> : <h3 className="text-2xl font-bold text-gray-900">{value}</h3>}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/leads?limit=5&sortBy=created_at&sortOrder=DESC')
        ]);
        setStats(statsRes.data.data);
        setRecentLeads(leadsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    return user.Roles?.some(role => role.Permissions?.some(p => p.name === requiredPermission));
  };

  const chartData = stats ? [
    { name: 'New', value: stats.newLeads, color: '#3b82f6' },
    { name: 'Contacted', value: stats.contactedLeads, color: '#f97316' },
    { name: 'Qualified', value: stats.qualifiedLeads, color: '#22c55e' },
    { name: 'Converted', value: stats.convertedLeads, color: '#a855f7' },
    { name: 'Lost', value: stats.lostLeads, color: '#ef4444' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your CRM activity and sales pipeline."
        action={
          hasPermission('lead.create') && (
            <Link to="/leads" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center">
              <PlusCircle size={18} className="mr-2" />
              Add New Lead
            </Link>
          )
        }
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Leads" value={stats?.totalLeads} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-50" loading={loading} />
        <StatCard title="New Leads" value={stats?.newLeads} icon={PlusCircle} colorClass="text-indigo-600" bgClass="bg-indigo-50" loading={loading} />
        <StatCard title="Contacted" value={stats?.contactedLeads} icon={Clock} colorClass="text-orange-600" bgClass="bg-orange-50" loading={loading} />
        <StatCard title="Qualified" value={stats?.qualifiedLeads} icon={CheckCircle} colorClass="text-green-600" bgClass="bg-green-50" loading={loading} />
        <StatCard title="Converted" value={stats?.convertedLeads} icon={Briefcase} colorClass="text-purple-600" bgClass="bg-purple-50" loading={loading} />
        <StatCard title="Lost Leads" value={stats?.lostLeads} icon={XCircle} colorClass="text-red-600" bgClass="bg-red-50" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader title="Lead Pipeline" subtitle="Distribution by status" />
          <CardContent className="flex flex-col items-center justify-center h-72">
            {loading ? (
              <div className="w-48 h-48 rounded-full border-8 border-gray-100 border-t-indigo-500 animate-spin"></div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Briefcase size={40} className="mb-2 opacity-20" />
                <p>No pipeline data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader 
            title="Recent Leads" 
            action={
              <Link to="/leads" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            }
          />
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-y border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-3">Lead</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-3 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    </tr>
                  ))
                ) : recentLeads.length > 0 ? (
                  recentLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{lead.company || '-'}</td>
                      <td className="px-6 py-3"><Badge status={lead.status}>{lead.status}</Badge></td>
                      <td className="px-6 py-3 text-sm text-gray-600">{lead.assignedUser?.name || 'Unassigned'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                      No recent leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
