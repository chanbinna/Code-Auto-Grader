import React from "react";

export default function HistoryTable({ rows }) {
  if (!rows || rows.length === 0)
    return <div className='muted'>No submissions yet.</div>;
  return (
    <div className='history-list'>
      {rows.map((r) => (
        <div key={r.id} className='ios-card p-3 rounded-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='font-medium'>{r.problem_id}</div>
              <div className='muted text-sm'>
                Submission #{r.id} • {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
            <div className='text-sm flex items-center gap-2'>
              <div className='text-right'>
                <div className='font-semibold'>
                  {r.result?.passed}/{r.result?.total}
                </div>
                <div className='muted text-xs'>passed</div>
              </div>
              <div>
                {(r.result?.failed || 0) === 0 ? (
                  <span className='badge badge-success'>Passed</span>
                ) : (
                  <span className='badge badge-fail'>Failed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
