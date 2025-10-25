import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function QuickSubmit() {
  const [uuid, setUuid] = useState("your-uuid");
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/api/problems`)
      .then((r) => setProblems(r.data))
      .catch(() => setProblems([]));
  }, []);

  function goSubmit(pid) {
    if (!uuid) return alert("Please enter your UUID");
    navigate(`/submit/${uuid}/${pid}`);
  }

  return (
    <div className='max-w-xl mx-auto space-y-4'>
      <h1 className='text-2xl font-semibold'>Quick Submit</h1>
      <p className='text-sm text-gray-600'>
        Enter your student UUID and pick a problem to submit.
      </p>
      <div>
        <label className='block text-sm text-gray-700'>Student UUID</label>
        <input
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          className='mt-1 p-3 rounded-lg border w-full'
        />
      </div>

      <div>
        <h2 className='font-medium'>Problems</h2>
        <div className='grid grid-cols-1 gap-3 mt-3'>
          {problems.map((p) => (
            <div
              key={p.id}
              className='ios-card p-3 rounded-xl flex items-center justify-between'
            >
              <div>
                <div className='font-medium'>{p.title}</div>
                <div className='text-sm text-gray-500'>
                  Tests: {p.tests ?? "n/a"}
                </div>
              </div>
              <div>
                <button onClick={() => goSubmit(p.id)} className='ios-button'>
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
