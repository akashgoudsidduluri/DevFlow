import React from 'react';
import { useIssue } from '../../../context/IssueContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import GlassPanel from '../../shared/GlassPanel';
import { Activity, Target, AlertCircle, PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectStats = () => {
  const { issues } = useIssue();

  if (!issues || issues.length === 0) return (
    <GlassPanel className="p-8 bg-white/40 text-center text-muted text-sm font-bold">
      No issues yet — create your first task to see analytics.
    </GlassPanel>
  );

  const total = issues.length;
  const completed = issues.filter(i => i.status === 'done').length;
  const inProgress = issues.filter(i => i.status === 'in_progress').length;
  const todo = issues.filter(i => i.status === 'todo').length;

  // Critical = high priority tasks not yet done
  const delayed = issues.filter(i => i.priority === 'high' && i.status !== 'done').length;

  const data = {
    labels: ['Completed', 'In Progress', 'To Do', 'Critical'],
    datasets: [
      {
        data: [completed, inProgress, todo, delayed],
        backgroundColor: [
          'hsl(142, 71%, 45%)',   // Green - Done
          'hsl(221, 83%, 53%)',   // Blue - In Progress
          'hsl(210, 10%, 80%)',   // Grey - To Do
          'hsl(0, 84%, 60%)',     // Red - Critical
        ],
        hoverOffset: 10,
        borderWidth: 0,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <GlassPanel className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white/40">
      
      {/* Metric Cards */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
          <div className="p-2 bg-primary/10 rounded-xl w-fit">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-widest text-muted">Total Issues</div>
             <div className="text-3xl font-black text-foreground">{total}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-3">
          <div className="p-2 bg-green-500/10 rounded-xl w-fit">
            <Target className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-widest text-muted">Velocity</div>
             <div className="text-3xl font-black text-green-600">{completed}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
          <div className="p-2 bg-red-500/10 rounded-xl w-fit">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-widest text-muted">Critical</div>
             <div className="text-3xl font-black text-red-600">{delayed}</div>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="relative w-40 h-40">
           <Doughnut data={data} options={chartOptions} />
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-foreground">
                {Math.round((completed / total) * 100)}%
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted">Progress</span>
           </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Done
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Active
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
                To Do
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Critical
            </div>
        </div>
      </div>

    </GlassPanel>
  );
};

export default ProjectStats;
