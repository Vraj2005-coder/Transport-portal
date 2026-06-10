function ExpenseForm() {
  return (
    <div className="expense-form-card">

      <h2>Add Expense</h2>

      <div className="form-grid">

        <input
          type="text"
          placeholder="Vehicle Number"
        />

        <input
          type="text"
          placeholder="Trip ID"
        />

        <input
          type="number"
          placeholder="Amount"
        />

        <input
          type="date"
        />

      </div>

      <textarea
        rows="4"
        placeholder="Remarks"
      />

    </div>
  );
}

export default ExpenseForm;