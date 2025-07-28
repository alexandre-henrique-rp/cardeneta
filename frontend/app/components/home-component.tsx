import { useState, useEffect } from "react";
import DateFilter from "./date-filter";
import FinancialDataTable from "./financial-data-table";
import SummaryFooter from "./summary-footer";
import { WalletModal } from "./wallet-modal";
import { useAuth } from "~/context/auth";
import { ApiService } from "~/api/service";

interface ATM {
  id: string;
  name: string;
  value: number;
  type: string;
  typePayment: string;
  createdAt: string;
}

interface FinancialData {
  id: string;
  atms: ATM[];
  currentBalance: number;
}

export default function HomeComponent() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { User } = useAuth();

  useEffect(() => {
    if (User && User.Wallets && User.Wallets.length === 0) {
      setShowWalletModal(true);
    }

  }, [User]);

  const handleWalletSuccess = () => {
    setShowWalletModal(false);
  };

  const handleDateChange = async (year: number, month: number, walletId: string) => {
    try {
      const api = ApiService();
      const currentWallet = localStorage.getItem("currentWallet");
      if (currentWallet !== walletId) {
        localStorage.setItem("currentWallet", walletId);
      }
      const data = await api.getWallet(month, year, walletId);
      setData(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-[86vh]">
        <header className="p-4 border-b">
          <DateFilter onDateChange={handleDateChange} />
        </header>

        <main className="flex-1 overflow-y-auto">
          {data && <FinancialDataTable data={data}/>}
        </main>

        <footer className="p-4 border-t">
          <SummaryFooter valor={data?.currentBalance || 0}/>
        </footer>
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSuccess={handleWalletSuccess}
      />
    </>
  );
}