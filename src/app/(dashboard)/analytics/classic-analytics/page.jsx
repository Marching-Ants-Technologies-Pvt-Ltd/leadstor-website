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
import TabularModal from '@/utility/TabularModal';

const StatCard = ({
  title,
  value,
  subLabel,
  subValue,
  footer,
  subColor = "text-green-600",
}) => (
  <div className="bg-white rounded-xl border px-6 py-5">
    
    {/* Title */}
    <div className="text-sm text-slate-600 mb-3">
      {title}
    </div>
    <div className="text-sm text-slate-600 mb-3 text-center">
    {/* Main Value */}
    <div className="text-3xl font-semibold text-slate-900 mb-2">
      {value}
    </div>

    {/* Sub metric */}
    {subLabel && (
      <div className={`text-sm ${subColor} mb-2`}>
        {subLabel} <span className="font-medium">{subValue}</span>
      </div>
    )}

    {/* Footer */}
    {footer && (
      <div className="text-xs text-slate-400">
        {footer}
      </div>
    )}
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
  const [courseTotal, setCourseTotal] = useState(0);
  const [sourceTotal, setSourceTotal] = useState(0);
  const [ownerTotal, setOwnerTotal] = useState(0);
  const [reportType, setReportType] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);

  const durationOptions = [
    { label: 'Last 6 Months', value: 6 },
    { label: 'Last 12 Months', value: 12 },
    { label: 'Last 18 Months', value: 18 },
    { label: 'Last 24 Months', value: 24 },
    { label: 'Last 36 Months', value: 36 },
    { label: 'Last 48 Months', value: 48 },
  ];

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

  const showTable = (title, data) => {
    setModalTitle(title.replace('Graph', 'Table'));
    setModalData(data);
    setModalOpen(true);
  };

  const nameMap = owner;
  const ownerMap = Object.fromEntries(
    owner.map(item => [item.value, item.label])
  );

  const getOwnerName = (id) => {
    if(id == -1) return 'Admin';
    if (!id) return "Unknown";
    return ownerMap[id] || "Unknown";
  };

  const leadsDistributionData = useMemo(() => {
    return prepareOwnerLikeData(summary.owner?.items || [], nameMap, summary.totalLeads || 0);
  }, [summary.owner?.items, nameMap, summary.totalLeads]);

  const leadsConversionData = useMemo(() => {
    const items = summary.joined?.items?.length ? summary.joined.items : summary.owner?.items || [];
      return prepareOwnerLikeData(items, nameMap, summary.totalJoined || 0);
    }, [summary.joined?.items, summary.owner?.items, nameMap, summary.totalJoined]);

  const courseChartData = useMemo(() => {
    return prepareSimpleData(summary.course?.items || [], summary.totalLeads || 0, 9, 'Admin');
  }, [summary.course?.items, summary.totalLeads]);

  const sourceChartData = useMemo(() => {
    return prepareSimpleData(summary.source?.items || [], summary.totalLeads || 0, 9, 'Admin');
  }, [summary.source?.items, summary.totalLeads]);

  const statusChartData = useMemo(() => {
    return prepareSimpleData(summary.status?.items || [], summary.totalLeads || 0, 9, 'Admin');
  }, [summary.status?.items, summary.totalLeads]);

  const followUpChartData = useMemo(() => {
    const fu = Number(summary.totalFollowUp || 0);
    const pfu = Number(summary.pendingFollowUps || 0);

    if (fu === 0 && pfu === 0) return [];

    return [
      { label: 'FollowUp', value: fu },
      { label: 'Pending FollowUp', value: pfu },
    ];
  }, [summary.totalFollowUp, summary.pendingFollowUps]);

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
  }, [q,durationWon,durationRevenue]);

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
      case 'LAST_MONTH':
        from = dayjs().subtract(1, 'month').startOf('month');
        to = dayjs().subtract(1, 'month').endOf('month');
        break;
      case 'CUSTOM':
        return;
    }

    setRange({ from, to });
    setCustomRange([from.toDate(), to.toDate()]);
  }, [filters.datePreset]);

  useEffect(() => {
    loadWonTrend(durationWon);
    loadSalesTrend(durationRevenue);
  }, [durationWon, durationRevenue]);

  function DurationDropdown({ value, onChange, label }) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {durationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

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
    setCourseTotal(course.length || 0);
    setSourceTotal(source.length || 0);
    setOwnerTotal(owner.length || 0);
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
        LAST_MONTH: 'last month',
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

  function ChartCard({ 
    title, 
    subtitle, 
    data, 
    children,
    onShowTable 
  }) {
    return (
      <div className="bg-white rounded-xl border p-5 relative">
        <div className="flex justify-between items-start mb-3">  {/* reduced mb-4 → mb-3 */}
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>  {/* slightly smaller title */}
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          {data?.length > 0 && (
            <button
              onClick={() => onShowTable?.(title, data)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
            >
              Tabular
            </button>
          )}
        </div>
        <div className="h-[420px] md:h-[440px]">  {/* ← was 520/580, now smaller */}
          {children}
        </div>
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

    function prepareOwnerLikeData(
      items,
      nameMap,
      total,
      maxVisible = 9
    ){
      const data = [];

      // Sort descending
      const sorted = [...items].sort((a, b) => Number(b.leadsCount) - Number(a.leadsCount));

      let remaining = Number(total);
      // Visible slices
      for (let i = 0; i < Math.min(maxVisible, sorted.length); i++) {
        const item = sorted[i];
        const count = Number(item.leadsCount);
        const name = getOwnerName(item.title) ?? item.title ?? 'Unknown';
        data.push({
          label: name,
          value: count,
          originalTitle: item.title,
        });

        remaining -= count;
      }

      // Others (remaining items beyond maxVisible)
      const othersFromSlice = sorted.slice(maxVisible);
      let othersCount = othersFromSlice.reduce((sum, it) => sum + Number(it.leadsCount), 0);

      // Still remaining after visible + sliced others?
      othersCount += remaining;

      if (othersCount > 0) {
        data.push({
          label: othersCount > 0 && data.length >= maxVisible ? `${othersFromSlice.length} Others` : 'Others',
          value: othersCount,
          isOthers: true,
        });
      }

      return data;
    }

    function prepareSimpleData(
      items,
      total,
      maxVisible = 6,
      othersLabel = 'Admin'
    ) {
      const data = [];

      const sorted = [...items].sort((a, b) => Number(b.leadsCount) - Number(a.leadsCount));

      let remaining = Number(total);

      for (let i = 0; i < Math.min(maxVisible, sorted.length); i++) {
        const item = sorted[i];
        const count = Number(item.leadsCount);

        data.push({
          label: item.title || 'Unknown',
          value: count,
          originalTitle: item.title,
        });

        remaining -= count;
      }

      const othersFromSlice = sorted.slice(maxVisible);
      let othersCount = othersFromSlice.reduce((sum, it) => sum + Number(it.leadsCount), 0) + remaining;

      if (othersCount > 0) {
        data.push({
          label: othersFromSlice.length > 0 && data.length >= maxVisible
            ? `Admin`
            : othersLabel,
          value: othersCount,
          isOthers: true,
        });
      }

      return data;
    }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="mx-auto">
        <div className="p-2 space-y-6 bg-slate-50 min-h-screen">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                    <option value="LAST_MONTH">Last Month</option>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Leads"
              value={`${formatNumber(summary.totalLeads)}`}
              subLabel="Open"
              subValue={summary.totalOpen}
              footer={`${formatNumber(summary.overallLeads)} Overall Leads`}
            />

            <StatCard
              title="Conversion"
              value={summary.totalJoined}
              subLabel="FollowUp"
              subValue={summary.totalFollowUp}
              footer={`${summary.pendingFollowUps} Pending Followups`}
            />

            <StatCard
              title="Revenue"
              value={`${formatNumber(summary.paidAmount)}`}
              subLabel="Overdue"
              subValue={`${formatNumber(summary.dueAmount)}`}
              subColor="text-red-600"
              footer={`${formatNumber(summary.totalAmount)} Total Sells`}
            />

            <StatCard
              title="Collection"
              value={`${formatNumber(summary.collection)}`}
              subLabel="Invoices"
              subValue={summary.invoices}
              footer={`${summary.candidates || 0} Candidates`}
            />

            <StatCard
              title="Courses"
              value={`${formatNumber(summary.course?.count || 0)}`}
              subLabel="Total"
              subValue={courseTotal || 0}
              footer={`Listed Courses`}
            />

            <StatCard
              title="Sources"
              value={`${formatNumber(summary.source?.count || 0)}`}
              subLabel="Total"
              subValue={sourceTotal || 0}
              footer={`Listed Sources`}
            />

            <StatCard
              title="Counsellors"
              value={`${formatNumber(summary.owner?.count || 0)}`}
              subLabel="Total"
              subValue={ownerTotal || 0}
              footer={`Listed Counsellors`}
            />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Won Opportunities */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="font-semibold text-slate-800">Won Opportunities</h3>
                <DurationDropdown
                  value={durationWon}
                  onChange={setDurationWon}
                  label="Duration"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wonTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="value" stroke="#f97316" strokeWidth={2} /> {/* orange like your screenshot */}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales Trend */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="font-semibold text-slate-800">Sales Trend</h3>
                <DurationDropdown
                  value={durationRevenue}
                  onChange={setDurationRevenue}
                  label="Duration"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="value" stroke="#16a34a" fill="#86efac" /> {/* green like before */}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-10">
            <ChartCard
              title="Leads Distribution Graph"
              subtitle="The graphical representation illustrates the distribution of leads among counsellors."
              data={leadsDistributionData}
              onShowTable={showTable}
            >
              <DonutChart data={leadsDistributionData} />
            </ChartCard>

            <ChartCard
              title="Leads Conversion Graph"
              subtitle="The graphical representation illustrates the conversion of leads done by counsellors."
              data={leadsConversionData}
              onShowTable={showTable}
            >
              <DonutChart data={leadsConversionData} />
            </ChartCard>

            <ChartCard
              title="Lead-Source Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on sources."
              data={sourceChartData}
              onShowTable={showTable}
            >
              <DonutChart data={sourceChartData} />
            </ChartCard>

            <ChartCard
              title="Lead-Course Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on courses."
              data={courseChartData}
              onShowTable={showTable}
            >
              <DonutChart data={courseChartData} />
            </ChartCard>

            <ChartCard
              title="Lead-Status Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on current status."
              data={statusChartData}
              onShowTable={showTable}
            >
              <DonutChart data={statusChartData} />
            </ChartCard>

            <ChartCard
              title="Lead FollowUp Graph"
              subtitle="The graphical representation illustrates the distribution of leads based on followUp status."
              data={followUpChartData}
              onShowTable={showTable}
            >
              <DonutChart data={followUpChartData} />
            </ChartCard>
          </div>

          <TabularModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalTitle}
            data={modalData}
          />
        </div>
      </div>
    </div>
  );
}
