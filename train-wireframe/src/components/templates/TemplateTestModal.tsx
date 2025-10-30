/**
 * Template Test Modal
 * 
 * Allows users to test templates before activation by:
 * - Providing parameter inputs
 * - Auto-generating realistic test data
 * - Previewing resolved template
 * - Executing test with Claude API
 * - Displaying results with quality metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  Template, 
  TemplateTestResult, 
  TemplateVariable,
  QualityMetrics 
} from '../../lib/types';

interface TemplateTestModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateTestModal: React.FC<TemplateTestModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TemplateTestResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [compareBaseline, setCompareBaseline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize parameters with default values
  useEffect(() => {
    if (isOpen) {
      const initialParams: Record<string, any> = {};
      template.variables.forEach(variable => {
        if (variable.defaultValue) {
          initialParams[variable.name] = variable.defaultValue;
        } else {
          // Generate sample values based on type
          switch (variable.type) {
            case 'text':
              initialParams[variable.name] = `Sample ${variable.name}`;
              break;
            case 'number':
              initialParams[variable.name] = 42;
              break;
            case 'dropdown':
              initialParams[variable.name] = variable.options?.[0] || '';
              break;
          }
        }
      });
      setParameters(initialParams);
      setTestResult(null);
      setError(null);
    }
  }, [isOpen, template]);

  // Generate preview of resolved template
  const generatePreview = (): string => {
    let preview = template.structure;
    Object.entries(parameters).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, String(value || `{{${key}}}`));
    });
    return preview;
  };

  // Handle parameter change
  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate realistic test data
  const handleAutoGenerate = () => {
    const generatedParams: Record<string, any> = {};
    template.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          // Generate contextual sample data
          if (variable.name.toLowerCase().includes('name')) {
            generatedParams[variable.name] = 'Alex Johnson';
          } else if (variable.name.toLowerCase().includes('email')) {
            generatedParams[variable.name] = 'alex.johnson@example.com';
          } else if (variable.name.toLowerCase().includes('product')) {
            generatedParams[variable.name] = 'Premium Subscription';
          } else if (variable.name.toLowerCase().includes('topic')) {
            generatedParams[variable.name] = 'Machine Learning Best Practices';
          } else {
            generatedParams[variable.name] = `Sample ${variable.name} content`;
          }
          break;
        case 'number':
          generatedParams[variable.name] = Math.floor(Math.random() * 100) + 1;
          break;
        case 'dropdown':
          if (variable.options && variable.options.length > 0) {
            const randomIndex = Math.floor(Math.random() * variable.options.length);
            generatedParams[variable.name] = variable.options[randomIndex];
          }
          break;
      }
    });
    setParameters(generatedParams);
  };

  // Execute test
  const handleExecuteTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          parameters,
          compareToBaseline: compareBaseline,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute test');
      }

      const result: TemplateTestResult = await response.json();
      setTestResult(result);
    } catch (err) {
      console.error('Test execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute test');
    } finally {
      setIsLoading(false);
    }
  };

  // Render quality metric with visual indicator
  const renderQualityMetric = (label: string, value: number) => {
    const percentage = Math.round(value * 100);
    const color = value >= 0.8 ? 'bg-green-500' : value >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Template</h2>
            <p className="text-sm text-gray-600 mt-1">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Parameter Inputs */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Parameters</h3>
              <button
                onClick={handleAutoGenerate}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                🎲 Auto-Generate
              </button>
            </div>

            {template.variables.length === 0 ? (
              <p className="text-gray-500 italic">No parameters required for this template</p>
            ) : (
              <div className="space-y-4">
                {template.variables.map((variable: TemplateVariable) => (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variable.name}
                      {variable.helpText && (
                        <span className="text-gray-500 text-xs ml-2">({variable.helpText})</span>
                      )}
                    </label>

                    {variable.type === 'dropdown' && variable.options ? (
                      <select
                        value={parameters[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select {variable.name}</option>
                        {variable.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : variable.type === 'number' ? (
                      <input
                        type="number"
                        value={parameters[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={parameters[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Toggle */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Resolved Template Preview</span>
            </label>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolved Template</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {generatePreview()}
                </pre>
              </div>
            </div>
          )}

          {/* Baseline Comparison Toggle */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={compareBaseline}
                onChange={(e) => setCompareBaseline(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Compare with Baseline Performance</span>
            </label>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleExecuteTest}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing Template...
              </span>
            ) : (
              '▶ Execute Test'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">❌ Test Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="mt-6 space-y-6">
              {/* Overall Result */}
              <div className={`p-6 rounded-lg border-2 ${
                testResult.passedTest 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {testResult.passedTest ? '✅ Test Passed' : '⚠️ Test Did Not Meet Threshold'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Overall Quality Score: {Math.round(testResult.qualityScore * 100)}%
                      {' | '}
                      Threshold: {Math.round((template.qualityThreshold || 0.7) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Execution Time: {testResult.executionTimeMs}ms
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Breakdown */}
              {testResult.qualityBreakdown && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderQualityMetric('Relevance', testResult.qualityBreakdown.relevance)}
                    {renderQualityMetric('Accuracy', testResult.qualityBreakdown.accuracy)}
                    {renderQualityMetric('Naturalness', testResult.qualityBreakdown.naturalness)}
                    {renderQualityMetric('Methodology', testResult.qualityBreakdown.methodology)}
                    {renderQualityMetric('Coherence', testResult.qualityBreakdown.coherence)}
                    {renderQualityMetric('Uniqueness', testResult.qualityBreakdown.uniqueness)}
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div className="flex-1 bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className={`ml-2 font-semibold ${
                        testResult.qualityBreakdown.confidence === 'high' ? 'text-green-600' :
                        testResult.qualityBreakdown.confidence === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {testResult.qualityBreakdown.confidence.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Training Value:</span>
                      <span className={`ml-2 font-semibold ${
                        testResult.qualityBreakdown.trainingValue === 'high' ? 'text-green-600' :
                        testResult.qualityBreakdown.trainingValue === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {testResult.qualityBreakdown.trainingValue.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Baseline Comparison */}
              {testResult.baselineComparison && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Baseline Comparison</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Average Baseline Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(testResult.baselineComparison.avgQualityScore * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deviation</p>
                      <p className={`text-2xl font-bold ${
                        testResult.baselineComparison.deviation >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResult.baselineComparison.deviation >= 0 ? '+' : ''}
                        {testResult.baselineComparison.deviation.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* API Response */}
              {testResult.apiResponse && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">API Response</h3>
                  <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-2">
                      Model: {testResult.apiResponse.model} | 
                      Tokens: {testResult.apiResponse.usage.inputTokens} in / {testResult.apiResponse.usage.outputTokens} out
                    </p>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {testResult.apiResponse.content}
                    </pre>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {testResult.warnings.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Warnings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {testResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

