import axios from 'axios';
import { LANGUAGES, JUDGE0_STATUS, VERDICTS } from '../config/constants.js';

// Free public Judge0 CE instance — no API key required
const JUDGE0_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';

const judge0Headers = {
  'content-type': 'application/json',
};

/**
 * Submit a single code + stdin to Judge0 and return a token
 */
export const submitToJudge0 = async ({ code, languageKey, stdin, timeLimit, memoryLimit }) => {
  const lang = LANGUAGES[languageKey];
  if (!lang) throw new Error(`Unsupported language: ${languageKey}`);

  const payload = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: lang.id,
    stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
    cpu_time_limit: (timeLimit / 1000).toFixed(1), // seconds
    memory_limit: memoryLimit * 1024, // KB
    base64_encoded: true,
  };

  const response = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false&fields=token`,
    payload,
    { headers: judge0Headers, timeout: 15000 }
  );

  return response.data.token;
};

/**
 * Poll Judge0 for submission result by token
 */
export const getJudge0Result = async (token) => {
  const response = await axios.get(
    `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
    { headers: judge0Headers, timeout: 10000 }
  );
  return response.data;
};

/**
 * Batch submit multiple test cases and poll for results
 */
export const runAllTestCases = async ({
  code,
  languageKey,
  testCases,
  timeLimit = 2000,
  memoryLimit = 256,
}) => {
  const tokens = [];

  // Submit all test cases
  for (const tc of testCases) {
    const token = await submitToJudge0({
      code,
      languageKey,
      stdin: tc.input,
      timeLimit,
      memoryLimit,
    });
    tokens.push(token);
  }

  // Poll for all results
  const results = await pollResults(tokens, testCases);
  return results;
};

/**
 * Poll until all submissions are done
 */
const pollResults = async (tokens, testCases, maxAttempts = 20, interval = 1500) => {
  const results = new Array(tokens.length).fill(null);
  const pending = new Set(tokens.map((_, i) => i));

  for (let attempt = 0; attempt < maxAttempts && pending.size > 0; attempt++) {
    await sleep(interval);

    for (const idx of [...pending]) {
      const raw = await getJudge0Result(tokens[idx]);
      const statusId = raw.status?.id;

      // Still running or in queue
      if (statusId === 1 || statusId === 2) continue;

      const tc = testCases[idx];
      const stdout = raw.stdout ? Buffer.from(raw.stdout, 'base64').toString().trim() : '';
      // tc.output === null means custom-input run — skip output comparison
      const expectedOutput = tc.output == null ? null : (tc.output || '').trim();
      const stderr = raw.stderr ? Buffer.from(raw.stderr, 'base64').toString().trim() : '';
      const compileOutput = raw.compile_output
        ? Buffer.from(raw.compile_output, 'base64').toString().trim()
        : '';

      let verdict;
      if (statusId === 3) {
        if (expectedOutput === null) {
          verdict = 'Executed'; // custom input — no comparison
        } else {
          verdict = stdout === expectedOutput ? VERDICTS.ACCEPTED : VERDICTS.WRONG_ANSWER;
        }
      } else {
        verdict = JUDGE0_STATUS[statusId] || VERDICTS.RUNTIME_ERROR;
      }

      results[idx] = {
        testCaseIndex: idx,
        input: tc.input,
        expectedOutput: expectedOutput ?? '',
        actualOutput: stdout,
        verdict,
        runtime: parseFloat(raw.time || '0') * 1000, // ms
        memory: raw.memory || 0, // KB
        stderr: stderr || compileOutput,
        isHidden: tc.isHidden || false,
      };

      pending.delete(idx);
    }
  }

  // Any remaining pending = TLE or judge error
  for (const idx of pending) {
    results[idx] = {
      testCaseIndex: idx,
      input: testCases[idx].input,
      expectedOutput: (testCases[idx].output || '').trim(),
      actualOutput: '',
      verdict: VERDICTS.TIME_LIMIT_EXCEEDED,
      runtime: 0,
      memory: 0,
      stderr: 'Execution timed out or judge unavailable.',
      isHidden: testCases[idx].isHidden || false,
    };
  }

  return results;
};

/**
 * Derive overall verdict from per-test-case results
 */
export const deriveVerdict = (results) => {
  const priority = [
    VERDICTS.COMPILATION_ERROR,
    VERDICTS.RUNTIME_ERROR,
    VERDICTS.TIME_LIMIT_EXCEEDED,
    VERDICTS.MEMORY_LIMIT_EXCEEDED,
    VERDICTS.WRONG_ANSWER,
    VERDICTS.ACCEPTED,
  ];

  for (const v of priority) {
    if (results.some((r) => r.verdict === v)) return v;
  }
  return VERDICTS.RUNTIME_ERROR;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
