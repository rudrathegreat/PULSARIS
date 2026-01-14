export default function CandidateDetails({ candidate }) {
  return (
    <div className="details">
      <h3>Candidate Details</h3>
      <p>Period: {candidate.period}</p>
      <p>DM (new): {candidate.dm_new}</p>
      <p>S/N (new): {candidate["S/N_new"]}</p>
      <p>Acceleration: {candidate.acc_new}</p>
      <p>Classification: {candidate.classification}</p>
    </div>
  );
}
