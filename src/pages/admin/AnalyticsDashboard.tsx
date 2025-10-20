import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, TimeScale, ChartOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import './AnalyticsDashboard.css';

// --- BỔ SUNG IMPORTS ---
import { FaMagic } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

// --- GIẢI PHÁP: Ép kiểu icon ---
const IconMagic = FaMagic as React.ElementType;

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, TimeScale
);

interface UserStats {
  newUsers: number;
  deletedUsers: number;
}

const AnalyticsDashboard = () => {
  const [topMacros, setTopMacros] = useState<any[]>([]);
  const [leastUsedMacros, setLeastUsedMacros] = useState<any[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<any[]>([]);
  const [usageOverTime, setUsageOverTime] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [timePeriod, setTimePeriod] = useState('month');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetch(`/api/analytics/top-macros?period=${timePeriod}`).then(res => res.json()).then(setTopMacros);
    fetch('/api/analytics/least-used-macros').then(res => res.json()).then(setLeastUsedMacros);
    fetch('/api/analytics/category-usage').then(res => res.json()).then(setCategoryUsage);
    fetch('/api/analytics/usage-over-time').then(res => res.json()).then(setUsageOverTime);
    fetch('/api/analytics/user-stats').then(res => res.json()).then(setUserStats);
  }, [timePeriod]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis('');
    try {
      const res = await fetch('/api/ai/analyze-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topMacros,
          leastUsedMacros,
          categoryUsage,
          usageOverTime,
          userStats
        })
      });

      if (!res.ok) {
        throw new Error('Yêu cầu phân tích thất bại');
      }

      const data = await res.json();
      setAnalysis(data.analysis);

    } catch (error) {
      console.error(error);
      setAnalysis('Đã xảy ra lỗi khi cố gắng phân tích dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const usageOverTimeChartData = {
    labels: usageOverTime.map(u => u.date),
    datasets: [{
      label: 'Số lượt sao chép',
      data: usageOverTime.map(u => u.count),
      fill: true,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
      tension: 0.3
    }],
  };
  
  const usageOverTimeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'dd/MM/yyyy', displayFormats: { day: 'dd/MM' } },
        title: { display: true, text: 'Ngày (30 ngày gần nhất)' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Số lượt sử dụng' },
        ticks: { precision: 0 }
      }
    }
  };

  const categoryChartData = {
    labels: categoryUsage.map(c => c.name),
    datasets: [{
      label: 'Số lượt sử dụng',
      data: categoryUsage.map(c => c.count),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };
  
  const categoryChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Bảng điều khiển phân tích</h1>
        <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="ai-analyze-btn">
          {/* --- SỬA LỖI: Sử dụng icon đã được ép kiểu --- */}
          <IconMagic style={{ marginRight: '8px' }} />
          {isAnalyzing ? 'Đang phân tích...' : 'Phân tích với Gemini'}
        </button>
      </div>
      
      <div className="analytics-grid">
        <div className="stat-card card">
          <h3>Thành viên trong tháng</h3>
          <div className="stat-item">
            <span className="stat-number">{userStats?.newUsers ?? '...'}</span>
            <span className="stat-label">Thành viên mới</span>
          </div>
          <small>*Số liệu tính cho tháng hiện tại.</small>
        </div>

        <div className="list-container card">
          <h3>
            Top 10 Macro
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="month">Tháng này</option>
              <option value="week">Tuần này</option>
            </select>
          </h3>
          <ol>
            {topMacros.map(macro => (
              <li key={macro._id}>
                <span>{macro.title}</span>
                <span className="count-badge">{macro.count}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="list-container card">
          <h3>Macro ít sử dụng</h3>
          <ol>
            {leastUsedMacros.map(macro => (
              <li key={macro._id}>
                <span>{macro.title}</span>
                <span className="count-badge secondary">{macro.useCount}</span>
              </li>
            ))}
          </ol>
        </div>
        
        <div className="chart-container card full-width">
          <h3>Lượt sử dụng trong 30 ngày qua</h3>
          <div>
            <Line data={usageOverTimeChartData} options={usageOverTimeChartOptions}/>
          </div>
        </div>

        <div className="chart-container card full-width">
          <h3>Thống kê sử dụng theo Danh mục</h3>
          <div>
            <Bar data={categoryChartData} options={categoryChartOptions} />
          </div>
        </div>
        
        {(isAnalyzing || analysis) && (
          <div className="card full-width insights-container">
            <h2>
              PHÂN TÍCH & ĐỀ XUẤT TỪ AI
            </h2>
            {isAnalyzing ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="insights-content">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;