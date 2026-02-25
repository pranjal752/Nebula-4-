/**
 * Seed script — populates DB with sample problems, an admin user, and test users.
 * Run: node src/seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Problem from './models/Problem.js';
import connectDB from './config/db.js';
import { DEFAULT_CODE_TEMPLATES, DIFFICULTY_POINTS } from './config/constants.js';

// ─── 100+ Problems ────────────────────────────────────────────────────────────
const SAMPLE_PROBLEMS = [

  // ═══════════════════════════════ EASY ═══════════════════════════════════════

  {
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices* of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    inputFormat: 'First line: space-separated integers (the array)\nSecond line: target integer',
    outputFormat: 'Two space-separated integers (0-indexed positions)',
    sampleTestCases: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: '3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 6' },
    ],
    hiddenTestCases: [
      { input: '3 3\n6', output: '0 1', isHidden: true },
      { input: '1 2 3 4 5\n9', output: '3 4', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['Try using a hash map to store visited numbers.', 'For each number, check if target - num exists in the map.'],
  },
  {
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nFor this problem, you will be given the list as space-separated integers, and you should output the reversed list.`,
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
    inputFormat: 'Space-separated integers representing the linked list',
    outputFormat: 'Space-separated integers of the reversed list',
    sampleTestCases: [
      { input: '1 2 3 4 5', output: '5 4 3 2 1', explanation: '' },
      { input: '1 2', output: '2 1', explanation: '' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1', isHidden: true },
      { input: '', output: '', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['Think iteratively with three pointers: prev, curr, next.'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    inputFormat: 'A single string s',
    outputFormat: 'A single integer — the length of the longest substring without repeating characters',
    sampleTestCases: [
      { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with length 1.' },
      { input: 'pwwkew', output: '3', explanation: '"wke" has length 3.' },
    ],
    hiddenTestCases: [
      { input: '', output: '0', isHidden: true },
      { input: 'au', output: '2', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['Use the sliding window technique.', 'Maintain a set of characters in the current window.'],
  },
  {
    title: 'Merge Intervals',
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nEach line of input contains one interval.`,
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    constraints: '1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4',
    inputFormat: 'Multiple lines, each with two integers (start and end of interval)',
    outputFormat: 'Multiple lines, each with two integers (merged intervals)',
    sampleTestCases: [
      { input: '1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
      { input: '1 4\n4 5', output: '1 5', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' },
    ],
    hiddenTestCases: [
      { input: '1 4\n0 4', output: '0 4', isHidden: true },
      { input: '1 4\n2 3', output: '1 4', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
  },
  {
    title: 'Median of Two Sorted Arrays',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).`,
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
    inputFormat: 'First line: space-separated integers of nums1\nSecond line: space-separated integers of nums2',
    outputFormat: 'A decimal number (the median) with 5 decimal places',
    sampleTestCases: [
      { input: '1 3\n2', output: '2.00000', explanation: 'merged array = [1,2,3], median is 2.' },
      { input: '1 2\n3 4', output: '2.50000', explanation: 'merged = [1,2,3,4], median is (2+3)/2 = 2.5.' },
    ],
    hiddenTestCases: [
      { input: '0 0\n0 0', output: '0.00000', isHidden: true },
      { input: '\n1', output: '1.00000', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    hints: ['The brute force O(m+n) merge is too slow. Think binary search on the smaller array.'],
  },

  // ── New problems ────────────────────────────────────────────────────────────

  {
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only.',
    inputFormat: 'A single string s',
    outputFormat: '"true" if valid, "false" otherwise',
    sampleTestCases: [
      { input: '()', output: 'true', explanation: 'Simple matching pair.' },
      { input: '()[]{}', output: 'true', explanation: 'All pairs match in order.' },
      { input: '(]', output: 'false', explanation: 'Mismatched bracket types.' },
    ],
    hiddenTestCases: [
      { input: '([)]', output: 'false', isHidden: true },
      { input: '{[]}', output: 'true', isHidden: true },
      { input: '', output: 'true', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['Use a stack. Push open brackets, pop and match when you see a close bracket.'],
  },

  {
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.`,
    difficulty: 'Easy',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    inputFormat: 'Space-separated integers',
    outputFormat: 'A single integer — the maximum subarray sum',
    sampleTestCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
      { input: '1', output: '1', explanation: 'Single element.' },
      { input: '5 4 -1 7 8', output: '23', explanation: 'Entire array.' },
    ],
    hiddenTestCases: [
      { input: '-1 -2 -3', output: '-1', isHidden: true },
      { input: '0 -3 1 1', output: '2', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ["Kadane's algorithm: track current sum and reset to 0 when it goes negative."],
  },

  {
    title: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.',
    inputFormat: 'First line: space-separated sorted integers\nSecond line: target integer',
    outputFormat: 'The index of target (0-based), or -1 if not found',
    sampleTestCases: [
      { input: '-1 0 3 5 9 12\n9', output: '4', explanation: '9 exists at index 4.' },
      { input: '-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist.' },
    ],
    hiddenTestCases: [
      { input: '5\n5', output: '0', isHidden: true },
      { input: '1 3 5 7 9\n1', output: '0', isHidden: true },
      { input: '1 3 5 7 9\n9', output: '4', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['Maintain lo and hi pointers. Check the mid element each iteration.'],
  },

  {
    title: 'Coin Change',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.\n\nYou may assume that you have an infinite number of each kind of coin.`,
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
    inputFormat: 'First line: space-separated coin denominations\nSecond line: target amount',
    outputFormat: 'Minimum number of coins, or -1 if impossible',
    sampleTestCases: [
      { input: '1 5 11\n15', output: '3', explanation: '15 = 11 + 3*1 (nope) → 5+5+5 = 3 coins.' },
      { input: '2\n3', output: '-1', explanation: 'Cannot make 3 with only coin=2.' },
      { input: '1\n0', output: '0', explanation: 'Amount 0 needs 0 coins.' },
    ],
    hiddenTestCases: [
      { input: '1 2 5\n11', output: '3', isHidden: true },
      { input: '186 419 83 408\n6249', output: '20', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      'Use bottom-up DP. dp[i] = min coins to make amount i.',
      'For each amount i, try every coin c: dp[i] = min(dp[i], dp[i-c] + 1).',
    ],
  },

  {
    title: 'Number of Islands',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    constraints: 'm == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is \'0\' or \'1\'.',
    inputFormat: 'First line: m n (dimensions)\nFollowing m lines: space-separated row of the grid (0s and 1s)',
    outputFormat: 'A single integer — the number of islands',
    sampleTestCases: [
      {
        input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        output: '1',
        explanation: 'All connected land forms one island.',
      },
      {
        input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1',
        output: '3',
        explanation: 'Three separate islands.',
      },
    ],
    hiddenTestCases: [
      { input: '1 1\n1', output: '1', isHidden: true },
      { input: '1 1\n0', output: '0', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      'DFS/BFS: when you find a \'1\', increment count and flood-fill all connected land to \'0\'.',
    ],
  },

  {
    title: 'Climbing Stairs',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    constraints: '1 <= n <= 45',
    inputFormat: 'A single integer n',
    outputFormat: 'A single integer — the number of distinct ways',
    sampleTestCases: [
      { input: '2', output: '2', explanation: '1+1 or 2.' },
      { input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1', isHidden: true },
      { input: '10', output: '89', isHidden: true },
      { input: '45', output: '1836311903', isHidden: true },
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    hints: ['This is Fibonacci. f(n) = f(n-1) + f(n-2).'],
  },

  {
    title: 'Trapping Rain Water',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
    constraints: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
    inputFormat: 'Space-separated non-negative integers (heights)',
    outputFormat: 'A single integer — total units of water trapped',
    sampleTestCases: [
      {
        input: '0 1 0 2 1 0 1 3 2 1 2 1',
        output: '6',
        explanation: '6 units of rain water are trapped.',
      },
      { input: '4 2 0 3 2 5', output: '9', explanation: '9 units trapped.' },
    ],
    hiddenTestCases: [
      { input: '1 0 1', output: '1', isHidden: true },
      { input: '3 0 0 2 0 4', output: '10', isHidden: true },
      { input: '1 2 3 4 5', output: '0', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      'Two-pointer approach: maintain left_max and right_max.',
      'Water at index i = min(left_max, right_max) - height[i].',
    ],
  },

  {
    title: 'Word Search',
    description: `Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.`,
    difficulty: 'Medium',
    tags: ['Array', 'String', 'Backtracking', 'Matrix'],
    constraints: 'm == board.length\nn == board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15\nboard and word consist of only lowercase and uppercase English letters.',
    inputFormat: 'First line: m n\nNext m lines: space-separated characters of each row\nLast line: the target word',
    outputFormat: '"true" or "false"',
    sampleTestCases: [
      {
        input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED',
        output: 'true',
        explanation: 'Path: A→B→C→C→E→D',
      },
      {
        input: '3 4\nA B C E\nS F C S\nA D E E\nSEE',
        output: 'true',
        explanation: 'SEE path exists.',
      },
      {
        input: '3 4\nA B C E\nS F C S\nA D E E\nABCB',
        output: 'false',
        explanation: 'Cannot reuse cell B.',
      },
    ],
    hiddenTestCases: [
      { input: '1 1\nA\nA', output: 'true', isHidden: true },
      { input: '2 2\nA B\nC D\nABDC', output: 'false', isHidden: true },
    ],
    timeLimit: 3000,
    memoryLimit: 256,
    hints: [
      'DFS + backtracking: mark cells as visited before recursing, unmark on return.',
      'Try each cell as the starting point.',
    ],
  },

  {
    title: 'Course Schedule',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a, b]\` indicates that you must take course \`b\` first if you want to take course \`a\`.\n\nReturn \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    constraints: '1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000\nprerequisites[i].length == 2\n0 <= ai, bi < numCourses\nAll the pairs prerequisites[i] are unique.',
    inputFormat: 'First line: numCourses p (number of courses and prerequisites)\nNext p lines: two integers a b (a depends on b)',
    outputFormat: '"true" if all courses can be finished, "false" if a cycle exists',
    sampleTestCases: [
      { input: '2 1\n1 0', output: 'true', explanation: 'Take 0 then 1.' },
      { input: '2 2\n1 0\n0 1', output: 'false', explanation: 'Cycle: 0→1→0.' },
    ],
    hiddenTestCases: [
      { input: '1 0', output: 'true', isHidden: true },
      { input: '3 3\n0 1\n1 2\n2 0', output: 'false', isHidden: true },
      { input: '5 4\n1 0\n2 0\n3 1\n4 3', output: 'true', isHidden: true },
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      'Model as a directed graph. A cycle means impossible.',
      'Topological sort (Kahn\'s BFS) or DFS with 3-color visited states.',
    ],
  },
];

async function seed() {
  await connectDB();
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  await Promise.all([User.deleteMany({}), Problem.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    username: 'admin',
    email: 'admin@nebula.dev',
    password: 'Admin@1234',
    role: 'admin',
    bio: 'Platform administrator',
  });
  console.log(`✅ Admin created: admin@nebula.dev / Admin@1234`);

  // Create test users
  await User.create([
    {
      username: 'alice',
      email: 'alice@nebula.dev',
      password: 'Test@1234',
      country: 'India',
      bio: 'Competitive programmer',
    },
    {
      username: 'bob',
      email: 'bob@nebula.dev',
      password: 'Test@1234',
      country: 'USA',
      bio: 'Software engineer',
    },
  ]);
  console.log(` Test users created (alice, bob) — password: Test@1234`);

  // Create problems
  for (let i = 0; i < SAMPLE_PROBLEMS.length; i++) {
    const p = SAMPLE_PROBLEMS[i];
    const templates = {};
    Object.keys(DEFAULT_CODE_TEMPLATES).forEach((lang) => {
      templates[lang] = DEFAULT_CODE_TEMPLATES[lang];
    });

    await Problem.create({
      ...p,
      problemNumber: i + 1,
      points: DIFFICULTY_POINTS[p.difficulty],
      codeTemplates: templates,
      createdBy: admin._id,
    });
    console.log(`   📝 Problem ${i + 1}: ${p.title} [${p.difficulty}]`);
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('Admin credentials:');
  console.log('  Email:    admin@nebula.dev');
  console.log('  Password: Admin@1234');
  console.log('\nTest user credentials (alice / bob):');
  console.log('  Password: Test@1234');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
