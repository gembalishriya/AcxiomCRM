import React, { useEffect, useState } from 'react';
import { reportApi } from '../services/api';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    reportApi.audit().then((response) => setLogs(response.data.data)).catch(() => setLogs([]));
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Audit Logs</h1>
        <p>Security and business event history captured by the backend.</p>
      </section>
      <section className="panel-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Action</th><th>Entity</th><th>User</th><th>Date</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.action}</td>
                  <td>{log.entityName}</td>
                  <td>{log.userId?.fullName || log.userId?.email || 'System'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
