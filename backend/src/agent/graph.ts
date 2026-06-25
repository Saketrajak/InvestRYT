// ============================================================
// Investryt AI — LangGraph Agent Graph Assembly
// ============================================================

import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import {
  resolveCompanyNode,
  companyProfileNode,
  financialDataNode,
  marketDataNode,
  webResearchNode,
  newsSentimentNode,
  analysisNode,
  reportGenerationNode,
} from './nodes/index.js';

// Conditional routing: if an error is present in the state, route directly to END
function routeAfterStep(state: any) {
  if (state.error) {
    return END;
  }
  return 'continue';
}

const builder = new StateGraph(AgentState)
  .addNode('resolveCompany', resolveCompanyNode)
  .addNode('companyProfile', companyProfileNode)
  .addNode('financialData', financialDataNode)
  .addNode('marketData', marketDataNode)
  .addNode('webResearch', webResearchNode)
  .addNode('newsSentiment', newsSentimentNode)
  .addNode('analysis', analysisNode)
  .addNode('reportGeneration', reportGenerationNode)

  // Start with resolving the company
  .addEdge(START, 'resolveCompany')

  // We can use simple conditional transitions or linear edges since the nodes check state.error
  .addEdge('resolveCompany', 'companyProfile')
  .addEdge('companyProfile', 'financialData')
  .addEdge('financialData', 'marketData')
  .addEdge('marketData', 'webResearch')
  .addEdge('webResearch', 'newsSentiment')
  .addEdge('newsSentiment', 'analysis')
  .addEdge('analysis', 'reportGeneration')
  .addEdge('reportGeneration', END);

export const graph = builder.compile();
