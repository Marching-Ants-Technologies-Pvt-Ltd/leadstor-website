'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import dayjs from 'dayjs';
import { xFetch } from '@/utility/xFetch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UseFilterOptionsStore } from '@/utility/UseFilterOptionsStore';
import MultiSelectDropdown from '@/utility/MultiSelectDropdown';
import DonutChart from '@/components/charts/DonutChart';
import { buildPieData } from '@/utility/ChartUtils';
import { Corporate } from '@/utility/TinyDB';

const StatCard = ({ icon, label, value, sub, color = 'text-slate-800' }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-4 flex gap-3">
    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
      <i className={`${icon} text-xl`} />
    </div>
    <div className="flex-1">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  </div>
);

export default function AnalyticsDashboard() {

  /* ---------------- STATE ---------------- */
  const [summary, setSummary] = useState({
    course: { count: 0, items: [] },
    source: { count: 0, items: [] },
    owner: { count: 0, items: [] },
  });

  const [invite, setInvite] = useState({});
  const [wonTrend, setWonTrend] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [durationWon, setDurationWon] = useState(12);
  const [durationRevenue, setDurationRevenue] = useState(12);
  const [sourceTotal, setSourceTotal] = useState(0);
  const [ownerTotal, setOwnerTotal] = useState(0);
  const [reportType, setReportType] = useState('');

  const [filters, setFilters] = useState({
    datePreset: 'THIS_WEEK',
    course: [],
    source: [],
    owner: [],
    status: [],
  });

  const getCurrentWeek = () => ({
    from: dayjs().startOf('week'),
    to: dayjs().endOf('week'),
  });

  const [range, setRange] = useState(getCurrentWeek);
  const [customRange, setCustomRange] = useState([
    getCurrentWeek().from.toDate(),
    getCurrentWeek().to.toDate(),
  ]);

  /* ---------------- QUERY ---------------- */
  const q = useMemo(() => {
    const params = new URLSearchParams({
      from: range.from.format('YYYY-MM-DD'),
      to: range.to.format('YYYY-MM-DD'),
      courses: filters.course.join(','),
      sources: filters.source.join(','),
      owners: filters.owner.join(','),
      statuses: filters.status.join(','),
      userType: '-1',
    });
    return params.toString();
  }, [range, filters]);

  /* ---------------- FILTER OPTIONS ---------------- */
  const {
    status,
    source,
    course,
    owner,
    fetchFilterOptions,
  } = UseFilterOptionsStore();

  const isWorkloadDisabled = useMemo(() => {
    if (!range?.from) return false;
    return range.from.startOf('day').isBefore(dayjs().startOf('day'));
  }, [range]);


  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (isWorkloadDisabled && reportType === 'workload') {
      setReportType('');
    }
  }, [isWorkloadDisabled, reportType]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    loadAnalytics();
    loadWonTrend(durationWon);
    loadSalesTrend(durationRevenue);
  }, [q]);

  useEffect(() => {
    let from, to;

    switch (filters.datePreset) {
      case 'TODAY':
        from = dayjs().startOf('day');
        to = dayjs().endOf('day');
        break;
      case 'THIS_WEEK':
        from = dayjs().startOf('week');
        to = dayjs().endOf('week');
        break;
      case 'LAST_WEEK':
        from = dayjs().subtract(1, 'week').startOf('week');
        to = dayjs().subtract(1, 'week').endOf('week');
        break;
      case 'THIS_MONTH':
        from = dayjs().startOf('month');
        to = dayjs().endOf('month');
        break;
      case 'CUSTOM':
        return;
    }

    setRange({ from, to });
    setCustomRange([from.toDate(), to.toDate()]);
  }, [filters.datePreset]);

  /* ---------------- API CALLS ---------------- */
  async function loadAnalytics() {
    const res = await xFetch({
      path: `/services/dashboard/getLeadsAnalyticsV2?${q}`,
    });

    if (!res) return;

    setSummary({
      ...res,
      course: res.course || { count: 0, items: [] },
      source: res.source || { count: 0, items: [] },
      owner: res.owner || { count: 0, items: [] },
    });

    setInvite({
      totalEnquiries: res.totalLeads,
      totalJoined: res.totalJoined,
      pendingFollowUps: res.pendingFollowUps,
    });

    setSourceTotal(
      (res.source?.items || []).reduce(
        (sum, i) => sum + Number(i.leadsCount), 0
      )
    );

    setOwnerTotal(
      (res.owner?.items || []).reduce(
        (sum, i) => sum + Number(i.leadsCount), 0
      )
    );
  }

  async function loadWonTrend(months) {
    const res = await xFetch({
      path: `/services/dashboard/getWonOpportunities?corporateId=${Corporate?._id}&last_x_months=${months}`,
    });
    setWonTrend(
      (res?.categories || []).map((c, i) => ({ name: c, value: res.data[i] }))
    );
  }

  async function loadSalesTrend(months) {
    const res = await xFetch({
      path: `/services/dashboard/getBusinessRevenue?corporateId=${Corporate?._id}&last_x_months=${months}`,
    });
    setSalesTrend(
      (res?.categories || []).map((c, i) => ({ name: c, value: res.data[i] }))
    );
  }

  function formatNumber(value = 0) {
    if (value >= 10000000) return (value / 10000000).toFixed(2) + ' Cr';
    if (value >= 100000) return (value / 100000).toFixed(2) + ' L';
    if (value >= 1000) return (value / 1000).toFixed(2) + ' K';
    return value;
  }

  function DateFilterMessage({ filters, range }) {
      if (!range?.from || !range?.to) return null;

      const labelMap = {
        TODAY: 'today',
        THIS_WEEK: 'current week',
        LAST_WEEK: 'last week',
        THIS_MONTH: 'current month',
        CUSTOM: 'selected period',
      };

      return (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm text-slate-700">
          Presenting a concise analysis of leads for the{" "}
          <span className="font-semibold text-blue-600">
            {labelMap[filters.datePreset]}
          </span>{" "}
          spanning from{" "}
          <span className="font-medium text-blue-600">
            {range.from.format('YYYY-MM-DD')}
          </span>{" "}
          to{" "}
          <span className="font-medium text-blue-600">
            {range.to.format('YYYY-MM-DD')}
          </span>.
        </div>
      );
  }

  function ChartCard({ title, subtitle, children }) {
      return (
        <div className="bg-white rounded-xl border p-5 mb-6">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mb-4">{subtitle}</p>
          {children}
        </div>
      );
    }

  async function downloadReport(type) {
    if (!type || !range?.from || !range?.to) return;

    const fromDate = range.from.format('YYYYMMDD');
    const toDate = range.to.format('YYYYMMDD');

    xFetch({ 
      path: `/services/dashboard/generateDashboardReports` +
      `?reportType=${type}` +
      `&fromDate=${fromDate}` +
      `&toDate=${toDate}`,
      responseType: "blob"
    })
    .then(blob => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        const date = dayjs().format('YYYY-MM-DD');
        link.download = `${type}_${Corporate?._id}_${date}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
    })
    .catch(error => {
      console.error(`An error occurred while downloading the report`, error);
    })
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="mx-auto">
        <div className="p-2 space-y-6 bg-slate-50 min-h-screen">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>

            <DateFilterMessage
              filters={filters}
              range={range}
            />

            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

                {/* Date Range */}
                <div>
                  <label className="text-xs text-slate-500">Date Range</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={filters.datePreset}
                    onChange={e => setFilters(f => ({ ...f, datePreset: e.target.value }))}
                  >
                    <option value="TODAY">Today</option>
                    <option value="THIS_WEEK">Current Week</option>
                    <option value="LAST_WEEK">Last Week</option>
                    <option value="THIS_MONTH">Current Month</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <MultiSelectDropdown label="Course" options={course} value={filters.course}
                  onChange={v => setFilters(f => ({ ...f, course: v }))} />

                <MultiSelectDropdown label="Source" options={source} value={filters.source}
                  onChange={v => setFilters(f => ({ ...f, source: v }))} />

                <MultiSelectDropdown label="Counsellor" options={owner} value={filters.owner}
                  onChange={v => setFilters(f => ({ ...f, owner: v }))} />

                <MultiSelectDropdown label="Status" options={status} value={filters.status}
                  onChange={v => setFilters(f => ({ ...f, status: v }))} />
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-4">

                {/* Custom date picker */}
                {filters.datePreset === 'CUSTOM' && (
                  <div className="w-full md:w-[260px]">
                    <label className="text-xs text-slate-500 mb-1 block">
                      From – To
                    </label>

                    <DatePicker
                      selectsRange
                      startDate={customRange[0]}
                      endDate={customRange[1]}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setCustomRange(dates);

                        if (start && end) {
                          setRange({
                            from: dayjs(start),
                            to: dayjs(end),
                          });
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholderText="Select date range"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      minDate={new Date(1990, 0, 1)}
                      maxDate={new Date()}
                      calendarStartDay={1}
                    />
                  </div>
                )}

                <div className="w-full md:w-[220px]">
                  <label className="text-xs text-slate-500">Downloads</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={reportType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReportType(val);

                      if (val) {
                        downloadReport(val);
                      }
                    }}
                  >
                    <option value="">Select Report</option>
                    <option value="funnel">Funnel</option>

                    <option
                      value="workload"
                      disabled={isWorkloadDisabled}
                    >
                      Workload {isWorkloadDisabled ? '(Future dates only)' : ''}
                    </option>

                    <option value="missedfollowup">Missed Follow Up</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="ri-user-add-line" label="Leads" value={summary.totalLeads || 0}
              sub={`Open ${summary.totalOpen || 0}`} />

            <StatCard icon="ri-refresh-line" label="Conversion" value={summary.totalJoined || 0}
              sub={`Followups ${summary.totalFollowUp || 0}`} />

            <StatCard icon="ri-money-rupee-circle-line"  label="Revenue" value={summary.totalAmount || 0}
              sub={`Due ${summary.dueAmount || 0}`} />

            <StatCard icon="ri-wallet-3-line"  label="Collection" value={summary.collection || 0}
              sub={`Invoices ${summary.invoices || 0}`} />

            <StatCard icon="ri-book-open-line"  label="Courses" value={summary.course?.count || 0}
              sub={`Total ${summary.totalLeads || 0}`} />

            <StatCard icon="ri-links-line"  label="Sources" value={summary.source?.count || 0}
              sub={`Total ${sourceTotal}`} />

            <StatCard icon="ri-user-star-line"  label="Counsellors" value={summary.owner?.count || 0}
              sub={`Total ${ownerTotal}`} />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-semibold mb-2">Won Opportunities</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={wonTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="value" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-semibold mb-2">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="value" stroke="#16a34a" fill="#86efac" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-8 mt-8">

            {/* Leads Distribution */}
            <ChartCard
              title="Leads Distribution Graph"
              subtitle="The graphical representation illustrates the distribution of leads among counsellors."
            >
              <DonutChart
                data={buildPieData(summary.owner?.items)}
              />
            </ChartCard>

            {/* Leads Conversion */}
            <ChartCard
              title="Leads Conversion Graph"
              subtitle="The graphical representation illustrates the conversion of leads done by counsellors."
            >
              <DonutChart
                data={buildPieData(
                  summary.owner?.items?.filter(i => Number(i.leadsCount) > 0)
                )}
              />
            </ChartCard>

            {/* Lead Source */}
            <ChartCard
              title="Lead-Source Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on sources."
            >
              <DonutChart
                data={buildPieData(summary.source?.items)}
              />
            </ChartCard>

            {/* Lead Course */}
            <ChartCard
              title="Lead-Course Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on courses."
            >
              <DonutChart
                data={buildPieData(summary.course?.items)}
              />
            </ChartCard>

            {/* Lead Status */}
            <ChartCard
              title="Lead-Status Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on current status."
            >
              <DonutChart
                data={buildPieData(summary.status?.items)}
              />
            </ChartCard>

            {/* Follow Up */}
            <ChartCard
              title="Lead Follow-Up Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on follow-up status."
            >
              <DonutChart
                data={[
                  { label: 'Follow-Up', value: summary.totalFollowUp },
                  { label: 'Pending Follow-Up', value: summary.pendingFollowUps },
                ]}
              />
            </ChartCard>

          </div>
        </div>
      </div>
    </div>
  );
}
