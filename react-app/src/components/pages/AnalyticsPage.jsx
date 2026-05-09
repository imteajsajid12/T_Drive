import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBox } from '../ui/ChartBox';
import { StatCard } from '../ui/StatCard';
import { Ic } from '../../icons';
import { chartData } from '../../data';

export const AnalyticsPage = ({ isDark }) => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
    <div className="flex items-center justify-between">
      <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Analytics Overview</h1>
      <select className={`px-4 py-2 rounded-xl text-sm font-semibold outline-none ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
        <option>This Year</option>
      </select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Traffic" val="1.2M" sub="+12.5%" isDark={isDark} color="blue" ic={Ic.TrendUp} />
      <StatCard title="Bandwidth" val="8.4 TB" sub="+5.2%" isDark={isDark} color="purple" ic={Ic.HardDrive} />
      <StatCard title="Active Users" val="45.2K" sub="+18.1%" isDark={isDark} color="pink" ic={Ic.Users} />
      <StatCard title="Storage Used" val="450 GB" sub="-2.4%" isDark={isDark} color="orange" ic={Ic.HardDrive} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartBox label="Traffic Overview" isDark={isDark}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke={isDark ? '#4B5563' : '#9CA3AF'} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={isDark ? '#4B5563' : '#9CA3AF'} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Area type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
      <div>
        <ChartBox label="Top Locations" isDark={isDark}>
          <div className="space-y-4">
            {[
              { c: 'United States', v: 45, val: '540K' },
              { c: 'United Kingdom', v: 25, val: '300K' },
              { c: 'Germany', v: 15, val: '180K' },
              { c: 'Australia', v: 10, val: '120K' },
              { c: 'Others', v: 5, val: '60K' }
            ].map((l, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{l.c}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{l.val}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${l.v}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-blue-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </ChartBox>
      </div>
    </div>
  </div>
);
