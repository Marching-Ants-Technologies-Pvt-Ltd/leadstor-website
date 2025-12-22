export function buildPieData(items = [], limit = 8) {
  const sorted = [...items].sort(
    (a, b) => Number(b.leadsCount) - Number(a.leadsCount)
  );

  const top = sorted.slice(0, limit).map(i => ({
    label: i.title,
    value: Number(i.leadsCount),
  }));

  const rest = sorted.slice(limit);
  if (rest.length) {
    top.push({
      label: `${rest.length} Others`,
      value: rest.reduce((s, i) => s + Number(i.leadsCount), 0),
    });
  }

  return top;
}
