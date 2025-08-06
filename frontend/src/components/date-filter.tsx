import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookMarkedIcon, Copy, Search } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { toast } from 'sonner'

/**
 * Gera uma lista de anos em um intervalo específico para uso no seletor de ano.
 * @param start - O ano inicial do intervalo.
 * @param end - O ano final do intervalo.
 * @returns Um array de números representando os anos.
 */
const generateYearOptions = (start: number, end: number) => {
  const years = []
  for (let i = start; i <= end; i++) {
    years.push(i)
  }
  return years
}

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

interface Wallet {
  id: string
  name: string
}

interface DateFilterProps {
  onDateChange: (year: number, month: number, walletId: string) => void
  autoLoad?: boolean
}

/**
 * DateFilter é um componente que fornece seletores para mês e ano.
 * Ele utiliza o estado para controlar os valores selecionados e inicializa com o mês e ano atuais.
 */
export default function DateFilter({
  onDateChange,
  autoLoad = true,
}: DateFilterProps) {
  const currentDate = new Date()
  const { User } = useAuth()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [wallet, setWallet] = useState<string>('')

  const yearOptions = generateYearOptions(
    currentDate.getFullYear() - 3,
    currentDate.getFullYear()
  )

  const handleDateChange = () => {
    if (!wallet) return
    onDateChange(year, month, wallet)
  }

  const copyWalletId = async () => {
    if (wallet) {
      try {
        await navigator.clipboard.writeText(wallet)
        toast.success('ID da carteira copiado!')
      } catch {
        toast.error('Erro ao copiar ID da carteira')
      }
    }
  }

  useEffect(() => {
    if (User?.Wallets) {
      // Verificar se existe uma carteira salva no localStorage
      const savedWallet = localStorage.getItem('selectedWallet')
      
      if (User.Wallets.length === 1) {
        setWallet(User.Wallets[0].id)
      } else if (User.Wallets.length > 1) {
        // Se existe carteira salva e ela ainda está na lista de carteiras do usuário, usar ela
        if (savedWallet && User.Wallets.some(w => w.id === savedWallet)) {
          setWallet(savedWallet)
        } else {
          // Caso contrário, usar a primeira carteira (mais antiga)
          setWallet(User.Wallets[0].id)
        }
      }
    }
  }, [User])

  useEffect(() => {
    if (autoLoad && wallet) {
      onDateChange(year, month, wallet)
    }
  }, [wallet, autoLoad, year, month])

  // Salvar carteira selecionada quando ela mudar (exceto para carteira única)
  useEffect(() => {
    if (wallet && User?.Wallets && User.Wallets.length > 1) {
      localStorage.setItem('selectedWallet', wallet)
    }
  }, [wallet, User?.Wallets])

  // Classe base para todos os controles de formulário
  const inputBaseClass =
    'flex h-9 w-full items-center whitespace-nowrap rounded-md border border-input bg-background py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1'

  // Classe para inputs com ícone à esquerda
  const inputWithIconClass = `${inputBaseClass} pl-9`

  // Classe para botões que devem parecer com inputs
  const buttonAsInputClass =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground'

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
      <div className="w-full sm:w-auto">
        {User?.Wallets && User.Wallets.length > 1 && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="wallet"
              className="text-sm font-medium text-foreground/80"
            >
              Carteira
            </label>
            <div className="flex gap-2 items-center w-[200px]">
              <div className="relative flex-1">
                <Select value={wallet} onValueChange={(value) => {
                  setWallet(value)
                  // Salvar a carteira selecionada no localStorage quando o usuário trocar
                  localStorage.setItem('selectedWallet', value)
                }}>
                  <SelectTrigger className={inputBaseClass}>
                    <SelectValue placeholder="Selecione uma carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todas as carteiras</SelectItem>
                    {User.Wallets.map((w: Wallet) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                className={`${buttonAsInputClass} h-9 w-9 p-0`}
                onClick={copyWalletId}
                disabled={wallet === '0'}
                title="Copiar ID da carteira"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {User?.Wallets && User.Wallets.length === 1 && (
          <div className="flex flex-col gap-2 w-[200px]">
            <label
              htmlFor="wallet"
              className="text-sm font-medium text-foreground/80"
            >
              Caderneta
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <div className={inputWithIconClass}>
                  <span className="truncate">{User.Wallets[0].name}</span>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <BookMarkedIcon size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`${buttonAsInputClass} h-9 w-9 p-0`}
                onClick={copyWalletId}
                title="Copiar ID da carteira"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground/80">
            Período
          </span>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Select
                value={String(month)}
                onValueChange={value => setMonth(Number(value))}
              >
                <SelectTrigger className={inputBaseClass}>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Select
                value={String(year)}
                onValueChange={value => setYear(Number(value))}
              >
                <SelectTrigger className={inputBaseClass}>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              className={`${buttonAsInputClass} h-9 w-9 p-0`}
              onClick={handleDateChange}
              title="Aplicar filtros"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
