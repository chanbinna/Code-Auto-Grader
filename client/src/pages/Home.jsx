import React, { useEffect, useState } from "react";
import axios from "axios";
import ProblemCard from "../components/ProblemCard";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Home() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/problems`)
      .then((r) => setProblems(r.data))
      .catch(() => setProblems([]));
  }, []);

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Problems</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {problems.map((p) => (
          <ProblemCard key={p.id} problem={p} />
        ))}
      </div>
    </div>
  );
}
