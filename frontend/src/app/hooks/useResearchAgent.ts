// ============================================================
// Investryt AI — SSE Research Agent Client Hook
// ============================================================

import { useState, useCallback, useRef } from 'react';
import type {
  SSEEvent,
  ProgressEvent,
  CompleteEvent,
  ErrorEvent,
  AgentStep,
  StepStatus,
  ResearchReport,
  CompanyProfile,
  FinancialData,
  KeyMetrics,
  StockPriceEntry,
} from '../../types/index.js';

export interface ProgressLogEntry {
  step: AgentStep;
  status: StepStatus;
  message: string;
  timestamp: string;
  data?: any;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function useResearchAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AgentStep | null>(null);
  const [stepStatus, setStepStatus] = useState<StepStatus>('pending');
  const [stepMessage, setStepMessage] = useState<string>('');
  const [progressLog, setProgressLog] = useState<ProgressLogEntry[]>([]);
  
  // Results
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [priceHistory, setPriceHistory] = useState<StockPriceEntry[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  const resetState = () => {
    setError(null);
    setCurrentStep(null);
    setStepStatus('pending');
    setStepMessage('');
    setProgressLog([]);
    setReport(null);
    setProfile(null);
    setFinancials(null);
    setMetrics(null);
    setPriceHistory([]);
  };

  const runResearch = useCallback((query: string) => {
    resetState();
    setLoading(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${BACKEND_URL}/api/research?query=${encodeURIComponent(query)}`;
    console.log(`[useResearchAgent] Connecting to SSE: ${url}`);
    
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        const timestamp = new Date().toLocaleTimeString();

        if (data.type === 'progress') {
          setCurrentStep(data.step);
          setStepStatus(data.status);
          setStepMessage(data.message);
          
          setProgressLog((prev) => {
            // Check if step entry already exists to update it or append
            const existsIdx = prev.findIndex((entry) => entry.step === data.step);
            if (existsIdx >= 0) {
              const updated = [...prev];
              updated[existsIdx] = {
                step: data.step,
                status: data.status,
                message: data.message,
                timestamp,
                data: data.data || updated[existsIdx].data,
              };
              return updated;
            } else {
              return [
                ...prev,
                {
                  step: data.step,
                  status: data.status,
                  message: data.message,
                  timestamp,
                  data: data.data,
                },
              ];
            }
          });
        } 
        
        else if (data.type === 'complete') {
          setReport(data.report);
          setProfile(data.profile);
          setFinancials(data.financials);
          setMetrics(data.metrics);
          setPriceHistory(data.priceHistory);
          setLoading(false);
          setStepStatus('completed');
          setStepMessage('Research process finished successfully!');
          es.close();
        } 
        
        else if (data.type === 'error') {
          setError(data.message);
          setLoading(false);
          setStepStatus('error');
          setStepMessage(`Error: ${data.message}`);
          es.close();
        }
      } catch (err) {
        console.error('[useResearchAgent] Error parsing SSE message:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[useResearchAgent] EventSource error:', err);
      setError('Connection to research server lost or failed.');
      setLoading(false);
      setStepStatus('error');
      setStepMessage('Connection failed.');
      es.close();
    };
  }, []);

  const cancelResearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setLoading(false);
    setStepMessage('Research cancelled by user.');
    setStepStatus('pending');
  }, []);

  return {
    loading,
    error,
    currentStep,
    stepStatus,
    stepMessage,
    progressLog,
    report,
    profile,
    financials,
    metrics,
    priceHistory,
    runResearch,
    cancelResearch,
  };
}
