const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const runTestCaseInDocker = (sourceCode, input) => {
  return new Promise((resolve, reject) => {
    const escapedSourceCode = sourceCode
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/'/g, "'\\''")
      .replace(/\n/g, "\\n");

    const escapedInput = input.replace(/'/g, "'\\''");

    const dockerCommand = [
      'docker run --rm gcc:latest bash -c',
      `"printf '${escapedSourceCode}' > main.cpp &&`,
      'g++ -o main main.cpp 2> compile_error.log &&',
      'if [ -s compile_error.log ]; then cat compile_error.log; exit 1; fi &&',
      `echo '${escapedInput}' | ./main 2> runtime_error.log &&`,
      'if [ -s runtime_error.log ]; then cat runtime_error.log; exit 1; fi"'
    ].join(" ");

    const process = spawn("bash", ["-c", dockerCommand], { timeout: 5000 });

    let stdoutData = "";
    let stderrData = "";

    process.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        return resolve({ error: true, output: stderrData.trim() || "Unknown error" });
      }
      resolve({ error: false, output: stdoutData.trim() });
    });

    process.on("error", (err) => {
      reject({ error: true, output: err.message });
    });
  });
};

const executeInDocker = async (sourceCode, testCases = []) => {
  const id = uuidv4();
  console.log(`🔹 Unique ID: ${id}`);

  const results = [];

  for (const [index, tc] of testCases.entries()) {
    const input = typeof tc.input === "string" ? tc.input :
                  Array.isArray(tc.input) ? tc.input.join(",") : "";

    const expectedAscii = typeof tc.expectedOutput === "string"
      ? tc.expectedOutput.split("").map(c => c.charCodeAt(0))
      : Array.isArray(tc.expectedOutput) ? tc.expectedOutput : [];

    console.log(`🚀 Running test case ${index + 1}`);
    const result = await runTestCaseInDocker(sourceCode, input);

    if (result.error) {
      results.push({
        input,
        expected: expectedAscii.join(","),
        actual: "",
        status: "error",
        details: result.output
      });
      continue;
    }

    const outputAscii = result.output.split("").map(c => c.charCodeAt(0));
    const actualStr = outputAscii.join(",");
    const expectedStr = expectedAscii.join(",");

    results.push({
      input,
      expected: expectedStr,
      actual: actualStr,
      status: actualStr === expectedStr ? "passed" : "failed",
      details: actualStr === expectedStr ? "" : "Output does not match expected"
    });
  }

  // No test cases? Just compile and run once
  if (testCases.length === 0) {
    const result = await runTestCaseInDocker(sourceCode, "");
    if (result.error) {
      return { results: [{ status: "error", details: result.output }] };
    } else {
      return { results: [{ status: "completed", actual: result.output, details: "" }] };
    }
  }

  return { results };
};

module.exports = { executeInDocker };
