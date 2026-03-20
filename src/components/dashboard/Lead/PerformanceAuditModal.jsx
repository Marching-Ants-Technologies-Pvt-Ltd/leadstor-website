'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { xFetch } from '@/utility/xFetch';
import { User } from '@/utility/TinyDB';

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

const normalizeStatus = (value) => {
  if (!value) return '';
  const status = String(value).toLowerCase();
  if (status === 'generated') return 'Generated';
  if (status === 'processing') return 'Processing';
  if (status === 'queued') return 'Queued';
  if (status === 'failed') return 'Failed';
  if (status === 'not_found') return 'Queued';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function PerformanceAuditModal({ isOpen, onClose, days = 7 }) {
  const REPORT_DAYS = Number(days) || 7;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [reportStatus, setReportStatus] = useState('');
  const pollingRef = useRef(null);
  const [data,setData] = useState({});
  const [meta,setMeta] = useState({});
  const [eventStats,setEventStats] = useState({});  

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPollingWithDelay = (initialDelayMs = 5000) => {
    clearPolling();

    pollingRef.current = setInterval(async () => {
      console.log('Started polling for report status...');
      try {
        const payload = { days: REPORT_DAYS };

        const res = await xFetch({
          method: 'POST',
          path: '/services/invite/getCorporatePerformanceAuditStatus',
          payload
        });

        if (!res) return;

        const status = (res.report_status || res.job_status || '').toLowerCase();

        setReportStatus(status);

        if (status === 'queued') {
          setReportStatus('queued');
          return;
        }

        if ( status === 'processing') {
          setReportStatus('processing');
          return;
        }

        if (res?.data || status === 'generated') {

          setReportStatus('generated');
          setPayload(res);
          setData(res.data || {});
          setMeta(res.meta || {});
          setEventStats(res.event_stats || {});
          setLoading(false);
          clearPolling();
          return;
        }

        if (status === 'failed') {
          setError('Report generation failed');
          setLoading(false);
          clearPolling();
          return;
        }

      } catch (err) {
        console.error(err);
        // keep polling or you can add max retry logic
      }
    }, initialDelayMs);
  };

  const checkInitialStatus = async () => {
    setLoading(true);
    setError('');
    setPayload(null);
    setReportStatus('queued');
    try {
    // Step 1: First check current status (fast path if report already exists)
      const res = await xFetch({
        method: 'POST',
        path: '/services/invite/getCorporatePerformanceAuditStatus',
        payload: { days: REPORT_DAYS }, // add days if the endpoint expects it
      });

      const currentStatus = (res?.report_status || res?.job_status || '').toLowerCase();

      if (res?.data || currentStatus === 'generated') {
        setPayload(res);
        setData(res.data || {});
        setMeta(res.meta || {});
        setEventStats(res.event_stats || {});
        setReportStatus('generated');
        setLoading(false);
        return;
      }
      setReportStatus(currentStatus);
      loadAudit(false);       
      
    } catch (err) {
      console.error('Audit load failed:', err);
      setError(err?.message || 'Failed to load or fetch audit');
      setLoading(false);
    }
  }

  const loadAudit = async (forceNew = false) => {
    setLoading(true);
    setError('');
    setPayload(null);
    setReportStatus('queued');
    if(forceNew == true){
      clearPolling();
    }

    try {
      
      const generateRes = await xFetch({
        method: 'POST',
        path: '/services/invite/generateCorporatePerformanceAudit',
        payload: {
          days: REPORT_DAYS,
          userId: User?._id,
          force_new: forceNew,
        },
      });

      // Start polling to wait for completion
      startPollingWithDelay(5000);

    } catch (err) {
      console.error('Audit load failed:', err);
      setError(err?.message || 'Failed to load or generate audit');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkInitialStatus();
    } else {
      clearPolling();
    }
  }, [isOpen, REPORT_DAYS]);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

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
  const hasAnyOutput =
    Boolean(data?.best_performer || data?.average_performer || data?.weakest_performer ||
      data?.bestPerformer || data?.averagePerformer || data?.weakestPerformer ||
      comparativeRows.length || scorecardRows.length || individualRows.length ||
      insights.length || ranking.length);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[980px] max-h-[92vh] overflow-y-auto border border-gray-200 animate-fadeIn">
        <div className="px-6 py-3 flex justify-between items-center border-b bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="text-lg font-semibold text-slate-900">Team Performance Insight</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Last {REPORT_DAYS} days overview{meta?.from && meta?.to ? ` - ${meta.from} to ${meta.to}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAudit(true)}
              disabled={loading}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Generate New Report
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 hover:text-black transition"
              aria-label="Close"
            >
              &#10005;
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {(loading || reportStatus) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 flex items-center gap-3">
              {normalizeStatus(reportStatus) !== 'Generated' && (
                <span className="inline-flex h-4 w-4 rounded-full border-2 border-blue-300 border-t-blue-700 animate-spin" />
              )}
              <div>
                {normalizeStatus(reportStatus) !== 'Generated' ? 'Generating AI report...' : 'Report Status'}
                <br />
                Status: {normalizeStatus(reportStatus) || 'Queued'}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-800 flex items-center justify-between gap-4">
              <div>{error}</div>
              <button
                onClick={() => loadAudit(true)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {Object.keys(eventStats).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Sales Activity Signals
              </div>

              {Object.entries(eventStats).map(([user, events]) => (
                <div key={user} className="mb-3">
                  <div className="text-xs font-semibold text-slate-800">{user}</div>
                  <div className="text-xs text-slate-600">
                    {Object.entries(events).map(([event,count]) => (
                      <span key={event} className="mr-3">
                        {event.replaceAll('_',' ')}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (reportStatus === 'generated' || payload?.data) && (
            <>
              {!hasAnyOutput && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  No analysis data returned from AI. This usually means the model returned an unexpected
                  format or an empty response.
                </div>
              )}
              {meta?.compressed && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  Large data detected. The audit used intelligent summarization to fit model limits.
                  {meta?.raw_entries ? ` Raw entries: ${meta.raw_entries}.` : ''}
                </div>
              )}
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
                      <div key={idx}>{line}</div>
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
                        {row?.reason && <span className="text-slate-600">{row.reason}</span>}
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
