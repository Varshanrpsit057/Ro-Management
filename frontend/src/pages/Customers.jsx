import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCustomers, deleteCustomer } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    fetchCustomers(search)
      .then(setCustomers)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCustomer(deleteId);
      setDeleteId(null);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <Link to="/customers/new" className="btn btn-primary">+ Add Customer</Link>
      </div>
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr><td colSpan={4} className="empty">No customers found.</td></tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/customers/${c.id}`} className="link">{c.name}</Link>
                </td>
                <td>{c.phone}</td>
                <td>{c.address || "—"}</td>
                <td>
                  <Link to={`/customers/${c.id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                  <button onClick={() => setDeleteId(c.id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {deleteId && (
        <ConfirmDialog
          message="Delete this customer and all their RO systems?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
