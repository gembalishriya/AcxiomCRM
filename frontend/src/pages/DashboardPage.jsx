import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { dashboardApi } from '../services/api';

Chart.register(...registerables);

const defaultSummary = {
  totalCustomers: 0,
  totalLeads: 0,
  openLeads: 0,
  totalOpps: 0,
  openOpps: 0,
  wonOpps: 0,
  lostOpps: 0,
  pendingFollowUps: 0,
  totalPipelineValue: 0
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(defaultSummary);

  useEffect(() => {
    dashboardApi
      .summary()
      .then((response) => setSummary({ ...defaultSummary, ...(response.data?.data || {}) }))
      .catch(() => setSummary(defaultSummary));

    const leadCanvas = document.getElementById('leadChart');
    const pipelineCanvas = document.getElementById('pipelineChart');
    const salesCanvas = document.getElementById('salesChart');

    if (!leadCanvas || !pipelineCanvas || !salesCanvas) {
      return undefined;
    }

    const leadChart = new Chart(leadCanvas, {
      type: 'doughnut',
      data: {
        labels: ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'],
        datasets: [{ data: [44, 61, 78, 22, 38], backgroundColor: ['#22c1c3', '#60a5fa', '#34d399', '#fb7185', '#f59e0b'] }]
      }
    });

    const pipelineChart = new Chart(pipelineCanvas, {
      type: 'bar',
      data: {
        labels: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
        datasets: [{ data: [28, 41, 33, 18, 11], backgroundColor: '#22c1c3' }]
      }
    });

    const salesChart = new Chart(salesCanvas, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{ data: [148, 176, 204, 189, 237, 286], borderColor: '#22c1c3', backgroundColor: 'rgba(34,193,195,0.16)' }]
      }
    });

    return () => {
      leadChart.destroy();
      pipelineChart.destroy();
      salesChart.destroy();
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Dashboard</h1>
        <p>Monitor customers, leads, and opportunity pipeline activity from one React interface.</p>
      </section>

      <section className="metrics-grid">
        <div className="metric-card"><div className="muted">Total Customers</div><div className="metric-value">{summary.totalCustomers}</div></div>
        <div className="metric-card"><div className="muted">Total Leads</div><div className="metric-value">{summary.totalLeads}</div></div>
        <div className="metric-card"><div className="muted">Open Opportunities</div><div className="metric-value">{summary.openOpps}</div></div>
        <div className="metric-card"><div className="muted">Pipeline Value</div><div className="metric-value">${Number(summary.totalPipelineValue || 0).toLocaleString()}</div></div>
      </section>

      <section className="grid-2">
        <div className="panel-box"><canvas id="leadChart" /></div>
        <div className="panel-box"><canvas id="pipelineChart" /></div>
      </section>

      <section className="grid-2">
        <div className="panel-box"><canvas id="salesChart" /></div>
        <div className="panel-box">
          <h3>Today at a glance</h3>
          <p>Pending follow-ups: {summary.pendingFollowUps}</p>
          <p>Won opportunities: {summary.wonOpps}</p>
          <p>Lost opportunities: {summary.lostOpps}</p>
          <p>Open leads: {summary.openLeads}</p>
        </div>
      </section>
    </div>
  );
}
