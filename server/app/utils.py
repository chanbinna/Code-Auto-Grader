import os
import json
import tempfile
import subprocess
import sys
import shutil
from typing import List


RUN_TIMEOUT = 3  # seconds per test


RUNNER_TEMPLATE = '''
import runpy, sys, json, traceback

submission_path = sys.argv[1]
tc_json = sys.argv[2]
entry_name = sys.argv[3] if len(sys.argv) > 3 else 'solve'
tc = json.loads(tc_json)

g = {}
try:
    # run the submission as a script and capture its globals
    g = runpy.run_path(submission_path)
    if entry_name not in g:
        print(json.dumps({"ok": False, "error": f"No {entry_name}() function found"}))
        sys.exit(2)
    fn = g[entry_name]
    inp = tc.get('input')
    # if input is a list, expand as args
    if isinstance(inp, list):
        out = fn(*inp)
    else:
        out = fn(inp)
    print(json.dumps({"ok": True, "output": out}))
except Exception:
    print(json.dumps({"ok": False, "error": traceback.format_exc()}))
    sys.exit(3)
'''


def run_submission_tests(submission_path: str, test_cases: List[dict], entry_name: str = 'solve'):
    results = {
        "passed": 0,
        "failed": 0,
        "total": len(test_cases),
        "errors": [],
        "per_test": [],
        "status": "finished",
    }

    # create a temp runner file
    tmpdir = tempfile.mkdtemp(prefix="grader_")
    try:
        runner_path = os.path.join(tmpdir, "_runner.py")
        with open(runner_path, "w") as f:
            f.write(RUNNER_TEMPLATE)

        for i, tc in enumerate(test_cases, start=1):
            try:
                tc_json = json.dumps(tc)
                proc = subprocess.run([
                    sys.executable, runner_path, submission_path, tc_json, entry_name
                ], capture_output=True, text=True, timeout=RUN_TIMEOUT)
                stdout = proc.stdout.strip()
                stderr = proc.stderr.strip()
                if proc.returncode != 0:
                    results["failed"] += 1
                    results["per_test"].append({
                        "index": i,
                        "ok": False,
                        "input": tc.get("input"),
                        "stdout": stdout,
                        "stderr": stderr,
                        "error": stderr or stdout,
                    })
                    results["errors"].append({"index": i, "error": stderr or stdout})
                    continue
                # parse stdout JSON
                try:
                    parsed = json.loads(stdout)
                except Exception:
                    results["failed"] += 1
                    results["per_test"].append({"index": i, "ok": False, "stdout": stdout, "stderr": stderr})
                    results["errors"].append({"index": i, "error": "Invalid runner output", "raw": stdout})
                    continue

                if not parsed.get("ok"):
                    results["failed"] += 1
                    results["per_test"].append({
                        "index": i,
                        "ok": False,
                        "input": tc.get("input"),
                        "error": parsed.get("error"),
                        "stdout": stdout,
                        "stderr": stderr,
                    })
                    results["errors"].append({"index": i, "error": parsed.get("error")})
                    continue

                output = parsed.get("output")
                expected = tc.get("expected")
                expected_range = tc.get("expected_range")

                # support probabilistic tests where expected_range is provided
                if expected_range is not None:
                    try:
                        lo, hi = expected_range[0], expected_range[1]
                        ok = isinstance(output, (int, float)) and (lo <= output <= hi)
                    except Exception:
                        ok = False

                    if ok:
                        results["passed"] += 1
                        results["per_test"].append({
                            "index": i,
                            "ok": True,
                            "input": tc.get("input"),
                            "output": output,
                            "expected_range": expected_range,
                        })
                    else:
                        results["failed"] += 1
                        results["per_test"].append({
                            "index": i,
                            "ok": False,
                            "input": tc.get("input"),
                            "output": output,
                            "expected_range": expected_range,
                        })
                elif expected is not None:
                    if output == expected:
                        results["passed"] += 1
                        results["per_test"].append({
                            "index": i,
                            "ok": True,
                            "input": tc.get("input"),
                            "output": output,
                            "expected": expected,
                        })
                    else:
                        results["failed"] += 1
                        results["per_test"].append({
                            "index": i,
                            "ok": False,
                            "input": tc.get("input"),
                            "output": output,
                            "expected": expected,
                        })
                else:
                    # no expected info provided in test case
                    results["failed"] += 1
                    results["per_test"].append({
                        "index": i,
                        "ok": False,
                        "input": tc.get("input"),
                        "output": output,
                        "expected": None,
                        "error": "No expected value provided in test case",
                    })
            except subprocess.TimeoutExpired:
                results["failed"] += 1
                results["errors"].append({"index": i, "error": "timeout"})
                results["per_test"].append({"index": i, "ok": False, "error": "timeout"})
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({"index": i, "error": str(e)})
                results["per_test"].append({"index": i, "ok": False, "error": str(e)})

        return results
    finally:
        try:
            shutil.rmtree(tmpdir)
        except Exception:
            pass
