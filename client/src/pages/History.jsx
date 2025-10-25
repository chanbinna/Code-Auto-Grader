import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ProblemCard from "../components/ProblemCard";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function History() {
  const { uuid } = useParams();
  const [history, setHistory] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    if (!uuid) return;
    axios
      .get(`${API}/api/history/${uuid}`)
      .then((r) => setHistory(r.data))
      .catch(() => setHistory([]));
    axios
      .get(`${API}/api/problems`)
      .then((r) => setProblems(r.data))
      .catch(() => setProblems([]));
  }, [uuid]);

  // group history by problem
  const byProblem = {};
  history.forEach((s) => {
    byProblem[s.problem_id] = byProblem[s.problem_id] || [];
    byProblem[s.problem_id].push(s);
  });

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>History for {uuid}</h1>
        <Link to='/' className='ios-pill'>
          Home
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {problems.map((p) => {
          const subs = byProblem[p.id] || [];
          const latest = subs[0];
          const passedCount = subs.filter(
            (s) => (s.result?.failed || 0) === 0
          ).length;
          return (
            <Link key={p.id} to={`/history/${uuid}/problem/${p.id}`}>
              <div className='ios-card p-4 rounded-xl hover:shadow-md'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f0ff] to-[#dbeeff] flex items-center justify-center'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M12 5v14'
                        stroke='#0b5ed7'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M5 12h14'
                        stroke='#0b5ed7'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold text-lg'>
                          {p.title || p.id}
                        </h3>
                        <div className='text-sm muted mt-1'>
                          {p.tests ?? "N/A"} tests • {subs.length} submissions
                        </div>
                      </div>
                      <div className='text-right'>
                        {latest ? (
                          <div>
                            <div className='font-semibold'>
                              {latest.result?.passed}/{latest.result?.total}
                            </div>
                            <div className='muted text-xs'>
                              Last:{" "}
                              {new Date(latest.created_at).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div className='muted text-sm'>No submissions</div>
                        )}
                        <div className='mt-2'>
                          {subs.length > 0 &&
                            (passedCount === subs.length ? (
                              <span className='badge badge-success'>
                                All Passed
                              </span>
                            ) : (
                              <span className='badge badge-fail'>
                                Some Failed
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
