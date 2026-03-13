'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { xFetch } from '@/utility/xFetch';

const toTitle = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
};

const pick = (obj, keys, fallback) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

export default function PerformanceAuditModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const loadAudit = async () => {
    setLoading(true);
    setError('');
    setPayload(null);
    try {
      const res = await xFetch({
        method: 'POST',
        path: '/services/invite/getCorporatePerformanceAudit'
      });
      if (!res || res.status === false) {
        throw new Error(res?.error || 'Unable to generate performance audit');
      }
      setPayload(res);
    } catch (err) {
      setError(err?.message || 'Failed to load performance audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAudit();
    }
  }, [isOpen]);

  const data = payload?.data || {};
  const meta = payload?.meta || {};

  const comparativeRows = useMemo(
    () =>
      ensureArray(
        pick(data, ['comparative_performance_table', 'comparativePerformanceTable'], [])
      ),
    [data]
  );

  const scorecardRows = useMemo(
    () =>
      ensureArray(
        pick(data, ['sales_discipline_scorecard', 'salesDisciplineScorecard'], [])
      ),
    [data]
  );

  const individualRows = useMemo(
    () =>
      ensureArray(
        pick(data, ['individual_salesperson_analysis', 'individualSalespersonAnalysis'], [])
      ),
    [data]
  );

  const insights = useMemo(
    () => ensureArray(pick(data, ['key_business_insights', 'keyBusinessInsights'], [])),
    [data]
  );

  const ranking = useMemo(
    () => ensureArray(pick(data, ['final_salesperson_ranking', 'finalSalespersonRanking'], [])),
    [data]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[980px] max-h-[92vh] overflow-y-auto border border-gray-200 animate-fadeIn">
        <div className="px-6 py-3 flex justify-between items-center border-b bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="text-lg font-semibold text-slate-900">Owner Performance Audit</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Last 5 days overview{meta?.from && meta?.to ? ` • ${meta.from} to ${meta.to}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 hover:text-black transition"
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
              Generating performance evaluation. This can take a few seconds.
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-800 flex items-center justify-between gap-4">
              <div>{error}</div>
              <button
                onClick={loadAudit}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && payload && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div className="text-xs uppercase text-emerald-600 font-semibold">Best Performer</div>
                  <div className="text-base font-semibold text-emerald-900 mt-1">
                    {data?.best_performer || data?.bestPerformer || 'Not enough data'}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="text-xs uppercase text-amber-600 font-semibold">Average Performer</div>
                  <div className="text-base font-semibold text-amber-900 mt-1">
                    {data?.average_performer || data?.averagePerformer || 'Not enough data'}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
                  <div className="text-xs uppercase text-rose-600 font-semibold">Weakest Performer</div>
                  <div className="text-base font-semibold text-rose-900 mt-1">
                    {data?.weakest_performer || data?.weakestPerformer || 'Not enough data'}
                  </div>
                </div>
              </div>

              {comparativeRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b text-sm font-semibold text-slate-700 bg-slate-50">
                    Comparative Performance Table
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {Object.keys(comparativeRows[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              {toTitle(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {comparativeRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {Object.keys(comparativeRows[0] || {}).map((key) => (
                              <td key={key} className="px-4 py-2 text-slate-700">
                                {row?.[key] ?? '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {scorecardRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b text-sm font-semibold text-slate-700 bg-slate-50">
                    Sales Discipline Scorecard
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {Object.keys(scorecardRows[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              {toTitle(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {scorecardRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {Object.keys(scorecardRows[0] || {}).map((key) => (
                              <td key={key} className="px-4 py-2 text-slate-700">
                                {row?.[key] ?? '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {individualRows.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-700">Individual Salesperson Analysis</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {individualRows.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {item?.salesperson || item?.name || `Salesperson ${idx + 1}`}
                        </div>
                        {item?.analysis && (
                          <div className="text-xs text-slate-600 mt-1">{item.analysis}</div>
                        )}

                        {ensureArray(item?.strengths).length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-emerald-600 uppercase">Strengths</div>
                            <div className="text-xs text-slate-700 mt-1">
                              {ensureArray(item?.strengths).join(', ')}
                            </div>
                          </div>
                        )}

                        {ensureArray(item?.weaknesses).length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-rose-600 uppercase">Gaps</div>
                            <div className="text-xs text-slate-700 mt-1">
                              {ensureArray(item?.weaknesses).join(', ')}
                            </div>
                          </div>
                        )}

                        {ensureArray(item?.behavior_patterns || item?.behaviorPatterns).length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-slate-600 uppercase">Behavior Patterns</div>
                            <div className="text-xs text-slate-700 mt-1">
                              {ensureArray(item?.behavior_patterns || item?.behaviorPatterns).join(', ')}
                            </div>
                          </div>
                        )}

                        {ensureArray(item?.improvement_recommendations || item?.recommendations).length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-blue-600 uppercase">Recommendations</div>
                            <div className="text-xs text-slate-700 mt-1">
                              {ensureArray(item?.improvement_recommendations || item?.recommendations).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                  <div className="text-sm font-semibold text-slate-700">Key Business Insights</div>
                  <div className="text-xs text-slate-700 mt-2 space-y-1">
                    {insights.map((line, idx) => (
                      <div key={idx}>• {line}</div>
                    ))}
                  </div>
                </div>
              )}

              {ranking.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                  <div className="text-sm font-semibold text-slate-700">Final Salesperson Ranking</div>
                  <div className="text-xs text-slate-700 mt-2 space-y-2">
                    {ranking.map((row, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                          {row?.rank ?? idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{row?.salesperson || row?.name}</span>
                        {row?.reason && <span className="text-slate-600">— {row.reason}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
