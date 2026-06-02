function DutyLogTable({ logs }) {
  return (
    <table className="duty-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>KM Start</th>
          <th>KM End</th>
          <th>Total KM</th>
        </tr>
      </thead>

      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            <td>{log.date}</td>
            <td>{log.start}</td>
            <td>{log.end}</td>
            <td>{log.kmStart}</td>
            <td>{log.kmEnd}</td>
            <td>{log.totalKm}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DutyLogTable;