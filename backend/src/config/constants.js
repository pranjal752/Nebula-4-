// Verdict types
export const VERDICTS = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  PENDING: 'Pending',
  RUNNING: 'Running',
};

// Difficulty levels
export const DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

// Points per difficulty
export const DIFFICULTY_POINTS = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

// Supported programming languages with Judge0 language IDs
export const LANGUAGES = {
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)', extension: 'cpp', monacoId: 'cpp' },
  c: { id: 50, name: 'C (GCC 9.2.0)', extension: 'c', monacoId: 'c' },
  java: { id: 62, name: 'Java (OpenJDK 13.0.1)', extension: 'java', monacoId: 'java' },
  python3: { id: 71, name: 'Python 3 (3.8.1)', extension: 'py', monacoId: 'python' },
  javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)', extension: 'js', monacoId: 'javascript' },
  go: { id: 60, name: 'Go (1.13.5)', extension: 'go', monacoId: 'go' },
  rust: { id: 73, name: 'Rust (1.40.0)', extension: 'rs', monacoId: 'rust' },
  typescript: { id: 74, name: 'TypeScript (3.7.4)', extension: 'ts', monacoId: 'typescript' },
  csharp: { id: 51, name: 'C# (Mono 6.6.0.161)', extension: 'cs', monacoId: 'csharp' },
  ruby: { id: 72, name: 'Ruby (2.7.0)', extension: 'rb', monacoId: 'ruby' },
};

// Judge0 status IDs
export const JUDGE0_STATUS = {
  1: VERDICTS.PENDING,
  2: VERDICTS.RUNNING,
  3: VERDICTS.ACCEPTED,
  4: VERDICTS.WRONG_ANSWER,
  5: VERDICTS.TIME_LIMIT_EXCEEDED,
  6: VERDICTS.COMPILATION_ERROR,
  7: VERDICTS.RUNTIME_ERROR,
  8: VERDICTS.RUNTIME_ERROR,
  9: VERDICTS.RUNTIME_ERROR,
  10: VERDICTS.RUNTIME_ERROR,
  11: VERDICTS.RUNTIME_ERROR,
  12: VERDICTS.MEMORY_LIMIT_EXCEEDED,
  13: VERDICTS.RUNTIME_ERROR,
  14: VERDICTS.RUNTIME_ERROR,
};

// User roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Contest status
export const CONTEST_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  ENDED: 'ended',
};

// Default code templates per language
export const DEFAULT_CODE_TEMPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    
    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your code here
    }
}`,
  python3: `import sys
input = sys.stdin.readline

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line.trim()));
rl.on('close', () => {
    // Your code here
});`,
  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    _ = reader
    
    // Your code here
    fmt.Println()
}`,
  rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    
    // Your code here
}`,
  typescript: `import * as readline from 'readline';
const rl = readline.createInterface({ input: process.stdin });
const lines: string[] = [];
rl.on('line', (line: string) => lines.push(line.trim()));
rl.on('close', () => {
    // Your code here
});`,
  csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Solution {
    static void Main(string[] args) {
        // Your code here
    }
}`,
  ruby: `# Your code here
input = $stdin.read.split("\\n")
`,
};
