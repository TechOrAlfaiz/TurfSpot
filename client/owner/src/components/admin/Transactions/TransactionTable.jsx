import React from "react";
import Avatar from "react-avatar";
import { ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

const TransactionTable = ({
  transactions,
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">
              <button
                className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                onClick={() => onSort("createdAt")}
              >
                <span>Date</span>
                {sortField === "createdAt" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-emerald-400" />
                  ))}
              </button>
            </th>
            <th className="px-4 py-3">Turf Venue</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Payment ID</th>
            <th className="px-4 py-3 text-right">
              <button
                className="flex items-center gap-1 ml-auto hover:text-emerald-400 transition-colors"
                onClick={() => onSort("totalPrice")}
              >
                <span>Amount</span>
                {sortField === "totalPrice" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-emerald-400" />
                  ))}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction._id}
              className="glass-card hover:bg-white/5 transition-colors text-slate-200"
            >
              <td className="px-4 py-3.5 rounded-l-2xl">
                <div className="flex items-center gap-3">
                  <Avatar name={transaction.user?.name || "User"} size="36" round={true} />
                  <span className="font-semibold text-white">{transaction.user?.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 font-medium text-slate-300">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3.5 font-semibold text-emerald-300">
                {transaction.turf?.name}
              </td>
              <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                {transaction.payment?.orderId}
              </td>
              <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                {transaction.payment?.paymentId}
              </td>
              <td className="px-4 py-3.5 rounded-r-2xl text-right font-extrabold text-gradient-emerald">
                ₹{transaction.totalPrice}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
