import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function ProblemHistory() {
  const { uuid, problemId } = useParams();
  const [subs, setSubs] = useState([]);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (!uuid || !problemId) return;
    // fetch history and filter by problem
    axios
      .get(`${API}/api/history/${uuid}`)
      .then((r) => {
        const filtered = (r.data || []).filter(
          (s) => s.problem_id === problemId
        );
        setSubs(filtered);
      })
      .catch(() => setSubs([]));

    // fetch problem metadata
    axios
      .get(`${API}/api/problems/${problemId}`)
      .then((r) => setProblem(r.data))
      .catch(() => setProblem(null));
  }, [uuid, problemId]);

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>
          Submissions for {problem ? problem.title : problemId}
        </h1>
        <Link to={`/history/${uuid}`} className='ios-pill'>
          Back
        </Link>
      </div>

      {subs.length === 0 ? (
        <div className='muted'>No submissions for this problem yet.</div>
      ) : (
        <div className='space-y-3'>
          {subs.map((s) => (
            <Link
              key={s.id}
              to={`/history/${uuid}/problem/${problemId}/submission/${s.id}`}
            >
              <div className='ios-card p-3 rounded-xl hover:shadow-md mb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Submission #{s.id}</div>
                    <div className='muted text-sm'>
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>
                      {s.result?.passed}/{s.result?.total}
                    </div>
                    <div className='muted text-xs'>passed</div>
                    <div className='mt-2'>
                      {(s.result?.failed || 0) === 0 ? (
                        <span className='badge badge-success'>Passed</span>
                      ) : (
                        <span className='badge badge-fail'>Failed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
