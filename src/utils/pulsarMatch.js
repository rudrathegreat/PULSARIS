export function getClosestPulsars(candidate, pulsars) {
  const Pc = Number(candidate.period);
  const DMc = Number(candidate.dm_new);

  if (!Number.isFinite(Pc) || !Number.isFinite(DMc)) return [];

  return pulsars
    .map((p) => {
      const Pp = Number(p.period);
      const DMp = Number(p.dm);

      const dP = (Pc - Pp) / Pp;
      const dDM = (DMc - DMp) / DMp;

      return {
        ...p,
        dist: Math.sqrt(dP * dP + dDM * dDM),
      };
    })
    .filter((p) => Number.isFinite(p.dist))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);
}
