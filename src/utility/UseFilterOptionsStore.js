import { create } from 'zustand';
import { Corporate, User, Test } from '@/utility/TinyDB';

export const UseFilterOptionsStore = create((set, get) => ({
  loading: false,
  loaded: false,

  status: [],
  source: [],
  course: [],
  location: [],
  owner: [],
  counsellor: [],

  fetchFilterOptions: async () => {
    if (get().loaded) return; // ✅ prevent re-fetch

    set({ loading: true });

    try {
      const params = new URLSearchParams({
        testId: Test?._id ?? '',
        corporateType: Corporate?.type ?? '',
        isManager: User?.isManager ?? '',
      }).toString();

      const { xFetch } = await import('@/utility/xFetch');

      const res = await xFetch({
        method: 'GET',
        path: `/services/invite/getFilterParameters&${params}`,
      });

      const normalize = (arr) =>
        (Array.isArray(arr) ? arr : Object.values(arr || [])).map((v) => ({
          label: v.label || v.name || v.title || v.status || v,
          value: v.value || v.id || v.name || v.title || v.status || v,
        }));
      
      const normalizeArray = (arr) =>
      (Array.isArray(arr) ? arr : []).map(v => ({
        label: String(v),
        value: String(v),
      }));

    const normalizeOwners = (obj) =>
      obj && typeof obj === 'object'
        ? Object.entries(obj).map(([id, name]) => ({
        label: String(name), // 👁 show name
        value: String(id),   // ✅ send ID
      })) : [];

      set({
        status: normalizeArray(res.statuses),
        course: normalizeArray(res.courses),
        source: normalizeArray(res.sources),
        location: normalizeArray(res.locations),
        owner: normalizeOwners(res.owners),
        counsellor: normalizeOwners(res.counsellors),
        loaded: true,
      });
    } catch (e) {
      console.error('Filter options fetch failed', e);
    } finally {
      set({ loading: false });
    }
  },
}));
