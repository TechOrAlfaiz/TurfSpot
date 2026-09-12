import useTransactionData from "@hooks/admin/useTransactionData";
import TransactionSkeleton from "./TransactionSkeleton";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import useTransactionManagement from "@hooks/admin/useTransactionManagement.jsx";
import { Sparkles, CreditCard } from "lucide-react";

const TransactionSection = () => {
  const { transactions, loading, error } = useTransactionData();

  const {
    filters,
    sortField,
    sortDirection,
    filteredAndSortedTransactions,
    handleFilterChange,
    toggleSort,
  } = useTransactionManagement(transactions);

  if (loading) return <TransactionSkeleton />;
  if (error) return <div className="p-4 glass-panel border border-rose-500/30 text-rose-300 rounded-2xl">{error}</div>;

  return (
    <div className="min-h-screen bg-mesh-pattern text-slate-100 p-6 lg:p-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-16 lg:pt-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Financial Ledger</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              System <span className="text-gradient-emerald">Transactions</span>
            </h1>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="pt-2 border-t border-white/10">
            <TransactionTable
              transactions={filteredAndSortedTransactions}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={toggleSort}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionSection;
