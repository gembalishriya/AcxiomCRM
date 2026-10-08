import React, { useEffect, useState } from 'react';
import { reportApi } from '../services/api';

export default function ReportsPage() {
  const [pipeline, setPipeline] = useState({ stageWise: [], ownerWise: [] });
  const [conversion, setConversion] = useState({ converted: 0, notConverted: 0, byStatus: [] });

  useEffect(() => {
    reportApi.pipeline().then((response) => setPipeline(response.data.data)).catch(() => setPipeline({ stageWise: [], ownerWise: [] }));
    reportApi.conversions().then((response) => setConversion(response.data.data)).catch(() => setConversion({ converted: 0, notConverted: 0, byStatus: [] }));
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Reports</h1>
        <p>Customer, lead, follow-up, opportunity, pipeline, user activity, and audit report summaries.</p>
      </section>
      <section className="grid-2">
        <div className="panel-box">
          <h3>Pipeline by Stage</h3>
          {pipeline.stageWise.map((row) => <p key={row._id}>{row._id}: {row.amount}</p>)}
        </div>
        <div className="panel-box">
          <h3>Pipeline by Owner</h3>
          {pipeline.ownerWise.map((row) => <p key={String(row._id)}>{String(row._id)}: {row.amount}</p>)}
        </div>
      </section>

      <section className="grid-2">
        <div className="panel-box">
          <h3>Conversion Report</h3>
          <p>Converted leads: {conversion.converted}</p>
          <p>Not converted: {conversion.notConverted}</p>
        </div>
        <div className="panel-box">
          <h3>Lead Status Breakdown</h3>
          {conversion.byStatus.map((row) => <p key={row._id}>{row._id}: {row.count}</p>)}
        </div>
      </section>
    </div>
  );
}
