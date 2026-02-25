import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Loader2, Play, Send, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { Card } from '../components/Card';

export function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await api.get(`/problems/${slug}`);
        const problemData = data.data?.problem || data.problem || data;
        setProblem(problemData);
        if (problemData.codeTemplates && problemData.codeTemplates[language]) {
            setCode(problemData.codeTemplates[language]);
        }
      } catch (error) {
        toast.error('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  const handleRun = async () => {
    if (!user) {
        toast.error("Please login to run code");
        return;
    }
    setSubmitting(true);
    setTimeout(() => {
        setOutput("Program compiled successfully.\nOutput: [1, 2, 3]");
        setSubmitting(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!user) {
        toast.error("Please login to submit");
        return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/submissions', {
        problemSlug: slug,
        code,
        language,
      });
      toast.success('Submitted successfully!');
      setOutput(data); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-64px)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!problem) return <div className="text-center py-20 text-textMuted">Problem not found</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] -my-8 -mx-4 overflow-hidden">
      {/* Left Panel: Description */}
      <div className="w-1/2 flex flex-col border-r border-border bg-background h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">{problem.title}</h1>
            <span className={clsx(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                problem.difficulty === 'Easy' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                problem.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
                {problem.difficulty}
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-textMuted text-sm leading-relaxed mb-8">
             <div dangerouslySetInnerHTML={{ __html: problem.description }} />
          </div>

          <div className="space-y-6 pb-10">
            <div>
               <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Input Format</h3>
               <div className="bg-surface border border-white/5 p-4 rounded-lg font-mono text-sm text-textMuted">
                 {problem.inputFormat}
               </div>
            </div>
            <div>
               <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Output Format</h3>
               <div className="bg-surface border border-white/5 p-4 rounded-lg font-mono text-sm text-textMuted">
                 {problem.outputFormat}
               </div>
            </div>
            <div>
               <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Constraints</h3>
               <div className="bg-surface border border-white/5 p-4 rounded-lg font-mono text-sm text-textMuted whitespace-pre-wrap">
                 {problem.constraints}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Editor */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e] h-full border-l border-white/5 relative">
        <div className="h-12 flex-none border-b border-white/5 bg-[#1e1e1e] flex items-center justify-between px-4 z-10">
             <div className="flex items-center gap-4">
                 <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-xs font-medium text-textMuted focus:outline-none cursor-pointer hover:text-white uppercase tracking-wider"
                 >
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                 </select>
             </div>
             <div className="flex items-center gap-3">
                 <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-3 text-xs font-medium hover:bg-white/5 text-textMuted hover:text-white" 
                    onClick={handleRun}
                    disabled={submitting}
                 >
                    <Play className="h-3 w-3 mr-1.5" /> Run
                 </Button>
                 <Button 
                    size="sm" 
                    className="h-8 px-4 text-xs font-bold bg-green-600 hover:bg-green-500 text-white border-0 shadow-lg shadow-green-900/20 transition-all active:scale-95" 
                    onClick={handleSubmit} 
                    disabled={submitting}
                 >
                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3 mr-1.5" /> Submit</>}
                 </Button>
             </div>
        </div>
        
        <div className="flex-1 w-full h-full relative">
            <Editor
                height="100%"
                width="100%"
                language={language === "cpp" ? "cpp" : language === "python" ? "python" : "javascript"}
                value={code}
                theme="vs-dark"
                onChange={(val) => setCode(val)}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Menlo', 'Monaco', monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                }}
            />
        </div>

        {output && (
            <div className="absolute bottom-0 left-0 right-0 h-1/3 border-t border-white/10 bg-[#0d0d0d] flex flex-col z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#141414]">
                    <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Console Output</span>
                    <button className="text-textMuted hover:text-white p-1 hover:bg-white/10 rounded" onClick={() => setOutput(null)}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-text/90">
                    <pre className="whitespace-pre-wrap">{typeof output === 'string' ? output : JSON.stringify(output, null, 2)}</pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
