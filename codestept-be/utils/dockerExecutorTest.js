const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const executeInDockerTest = async () => {
  return new Promise((resolve, reject) => {
    try {
      const id = uuidv4();
      console.log(`🔹 Unique ID: ${id}`);

      const hardcodedSource = `#include <iostream>
using namespace std;
int main() {
  int x = 3;
  cout << "Hello, World! " << x << endl;
  return 0;
}`;
      console.log(`🔹 Hardcoded Source Code: ${hardcodedSource}`);

      // Properly escape the source code
      const escapedSourceCode = hardcodedSource
        .replace(/\\/g, '\\\\')           // Escape backslashes first
        .replace(/"/g, '\\"')            // Escape double quotes
        .replace(/'/g, "'\\''")          // Escape single quotes
        .replace(/\n/g, '\\n');          // Convert newlines to literal \n

      // Construct the Docker command with proper quoting
      const dockerCommand = [
        'docker run --rm gcc:latest bash -c',
        `"printf '${escapedSourceCode}' > main.cpp &&`,
        'g++ -o main main.cpp 2> compile_error.log &&',
        '[ -s compile_error.log ] && cat compile_error.log && exit 1 ||',
        './main"'
      ].join(' ');

      console.log("🚀 Docker Command:", dockerCommand);

      const process = spawn("bash", ["-c", dockerCommand], { timeout: 5000 });
      let stdoutData = "";
      let stderrData = "";

      process.stdout.on("data", (data) => {
        stdoutData += data.toString();
        console.log("🔍 stdout chunk:", data.toString());
      });

      process.stderr.on("data", (data) => {
        stderrData += data.toString();
        console.log("🔍 stderr chunk:", data.toString());
      });

      process.on("close", (code) => {
        console.log("🔍 Process closed with code:", code);
        console.log("🔍 Raw stdout:", stdoutData);
        console.log("🔍 Raw stderr:", stderrData);

        if (code !== 0) {
          return reject({ error: "Execution failed", details: stderrData || stdoutData });
        }

        const results = [{ actual: stdoutData.trim() }];
        console.log("✅ Results:", results);
        resolve({ results });
      });

      process.on("error", (err) => {
        console.error("❌ Spawn error:", err);
        reject({ error: "Spawn failed", details: err.message });
      });
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      reject({ error: "Execution failed", details: err.message });
    }
  });
};

module.exports = { executeInDockerTest };