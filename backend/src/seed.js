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

const SAMPLE_PROBLEMS = [
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
  const testUsers = await User.create([
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
  console.log(`✅ Test users created (alice, bob) — password: Test@1234`);

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
