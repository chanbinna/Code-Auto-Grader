import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import SubmissionResult from "../components/SubmissionResult";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function SubmissionDetail() {
  const { uuid, problemId, submissionId } = useParams();
  const [problem, setProblem] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!uuid || !problemId || !submissionId) return;
    // fetch problem
    axios
      .get(`${API}/api/problems/${problemId}`)
      .then((r) => setProblem(r.data))
      .catch(() => setProblem(null));
    // fetch history and find submission
    axios
      .get(`${API}/api/history/${uuid}`)
      .then((r) => {
        const s = (r.data || []).find(
          (x) => String(x.id) === String(submissionId)
        );
        setSubmission(s || null);
        if (s && s.filename) {
          // fetch file content
          axios
            .get(
              `${API}/api/submission_file/${uuid}/${problemId}/${s.filename}`
            )
            .then((fr) => {
              setCode(fr.data);
            })
            .catch(() => setCode("Could not load file"));
        }
      })
      .catch(() => setSubmission(null));
  }, [uuid, problemId, submissionId]);

  if (!submission)
    return (
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold'>Submission</h1>
          <Link
            to={`/history/${uuid}/problem/${problemId}`}
            className='ios-pill'
          >
            Back
          </Link>
        </div>
        <div className='muted'>Submission not found.</div>
      </div>
    );

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div>
        {problem && (
          <div className='ios-card p-4 rounded-xl'>
            <h2 className='text-xl font-semibold'>{problem.title}</h2>
            <div className='muted text-sm mb-3'>
              Difficulty: {problem.difficulty ?? "N/A"}
            </div>
            <p className='text-sm mb-3'>{problem.description}</p>
            <div className='mb-3'>
              <h4 className='font-medium'>Examples</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-2'>
                {problem.examples &&
                  problem.examples.map((ex, i) => (
                    <div key={i} className='p-3 rounded-lg border bg-white'>
                      <div className='muted text-xs'>Input</div>
                      <div className='mono-code'>
                        {JSON.stringify(ex.input)}
                      </div>
                      <div className='muted text-xs mt-2'>Output</div>
                      <div className='font-medium'>
                        {JSON.stringify(ex.output)}
                      </div>
                      {ex.explanation && (
                        <div className='muted text-xs mt-1'>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className='font-medium'>
                Test cases (hidden values shown for practice)
              </h4>
              <div className='muted text-sm mt-2'>
                These are the inputs and expected outputs we checked against.
              </div>
              <pre className='detail-pre mt-2'>
                {JSON.stringify(problem.test_cases, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className='ios-card p-4 rounded-xl space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Submission #{submission.id}</h3>
              <div className='muted text-sm'>
                {new Date(submission.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              {(submission.result?.failed || 0) === 0 ? (
                <span className='badge badge-success'>Passed</span>
              ) : (
                <span className='badge badge-fail'>Failed</span>
              )}
            </div>
          </div>

          <div>
            <h4 className='font-medium'>Submitted Code</h4>
            <pre
              className='detail-pre mt-2'
              style={{ maxHeight: 320, overflow: "auto" }}
            >
              {code}
            </pre>
          </div>
        </div>

        <div className='mt-4'>
          <SubmissionResult result={submission.result} />
        </div>
      </div>
    </div>
  );
}
