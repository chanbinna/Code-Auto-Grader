import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SubmissionResult from "../components/SubmissionResult";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Submit() {
  const { uuid, problemId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const dropRef = useRef();
  const [fileText, setFileText] = useState("");

  useEffect(() => {
    if (!problemId) return;
    axios
      .get(`${API}/api/problems/${problemId}`)
      .then((r) => setProblem(r.data))
      .catch((e) => setError("Could not load problem"));
  }, [problemId]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDragOver = (e) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-blue-200");
    };
    const onDragLeave = () => {
      el.classList.remove("ring-2", "ring-blue-200");
    };
    const onDrop = (e) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-blue-200");
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setFile(f);
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [dropRef.current]);

  // read file content when file changes
  useEffect(() => {
    if (!file) {
      setFileText("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileText(String(ev.target.result));
    };
    reader.onerror = () => setFileText("Could not read file");
    reader.readAsText(file);
  }, [file]);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!file) return alert("Please select or drop a .py file");
    if (!uuid || !problemId)
      return alert(
        "Missing uuid or problemId. Use Quick Submit to pick problem."
      );
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(
        `${API}/api/submit/${uuid}/${problemId}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>
            Submit to {problemId || "a problem"}
          </h1>
          <div className='muted text-sm'>
            Student UUID: <strong>{uuid || "not provided"}</strong>
          </div>
        </div>
        <div>
          <button onClick={() => navigate("/submit")} className='ios-pill'>
            Back
          </button>
        </div>
      </div>

      {error && <div className='text-red-600'>{error}</div>}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Left: Problem details */}
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
                  Test cases (visible for practice)
                </h4>
                <div className='muted text-sm mt-2'>
                  These are the inputs and expected outputs we will check
                  against.
                </div>
                <pre className='detail-pre mt-2'>
                  {JSON.stringify(problem.test_cases, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right: Upload + result */}
        <div>
          <div className='ios-card p-4 rounded-xl space-y-4'>
            <div
              ref={dropRef}
              className='p-6 border-2 border-dashed rounded-lg text-center cursor-pointer'
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {file ? (
                <div>
                  <div className='font-medium'>Selected file:</div>
                  <div className='muted'>
                    {file.name} • {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div className='muted'>
                  Drag & drop your .py file here, or click to choose a file
                </div>
              )}
              <input
                id='fileInput'
                type='file'
                accept='.py'
                className='hidden'
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={submit}
                disabled={loading}
                className='ios-button'
              >
                {loading ? "Running..." : "Run & Submit"}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setFileText("");
                  setResult(null);
                }}
                className='ios-pill'
              >
                Clear
              </button>
            </div>

            {/* Preview box for submitted code */}
            <div>
              <h4 className='font-medium'>Code preview</h4>
              <div className='mt-2'>
                {fileText ? (
                  <pre
                    className='detail-pre'
                    style={{ maxHeight: 240, overflow: "auto" }}
                  >
                    {fileText}
                  </pre>
                ) : (
                  <div className='muted'>
                    No file selected yet — code preview will appear here after
                    selecting a file.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result under upload in right column */}
          {result && (
            <div className='mt-4'>
              <SubmissionResult result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
