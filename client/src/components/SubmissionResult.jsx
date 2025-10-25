import React from "react";

function pretty(v) {
  try {
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

export default function SubmissionResult({ result }) {
  if (result.error)
    return (
      <div className='text-red-600'>Error: {JSON.stringify(result.error)}</div>
    );

  const { passed, failed, total, errors, per_test } = result;

  return (
    <div className='ios-card p-4 rounded-xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-semibold'>Submission Results</h3>
          <div className='muted text-sm'>
            Detailed test output and diagnostics
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='badge badge-success'>✅ {passed} passed</div>
          <div className='badge badge-fail'>❌ {failed} failed</div>
          <div className='muted'>Total: {total}</div>
        </div>
      </div>

      <div className='mt-4'>
        <div className='space-y-3'>
          {per_test &&
            per_test.map((t) => (
              <div
                key={t.index}
                className={`p-3 rounded-lg border ${t.ok ? "border-green-100 bg-green-50" : "border-red-100 bg-red-50"}`}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='font-medium'>
                      Test {t.index} — {t.ok ? "Passed" : "Failed"}
                    </div>
                    <div className='muted text-sm'>
                      Input:{" "}
                      <code className='mono-code'>{pretty(t.input)}</code>
                    </div>
                  </div>
                  <div className='text-sm'>
                    {t.ok ? (
                      <span className='badge badge-success'>Passed</span>
                    ) : (
                      <span className='badge badge-fail'>Failed</span>
                    )}
                  </div>
                </div>
                <div className='mt-3 grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div>
                    <div className='muted text-sm'>Output</div>
                    <div className='detail-pre mt-1'>
                      {"output" in t ? pretty(t.output) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className='muted text-sm'>Expected</div>
                    <div className='detail-pre mt-1'>
                      {"expected" in t ? pretty(t.expected) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className='muted text-sm'>Stdout / Stderr</div>
                    <div className='detail-pre mt-1'>
                      {t.stdout || t.stderr
                        ? `STDOUT:\n${t.stdout || ""}\n\nSTDERR:\n${t.stderr || ""}`
                        : "—"}
                    </div>
                  </div>
                </div>
                {t.error && (
                  <div className='mt-3 text-sm text-red-700'>
                    <strong>Error:</strong>
                    <pre className='detail-pre mt-1'>{String(t.error)}</pre>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
