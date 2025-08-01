import { useState } from 'react'
import { toast } from 'sonner'
import { WalletIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiService } from '@/api/service'
import { useAuth } from '@/context/auth'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function WalletModal({ isOpen, onClose, onSuccess }: WalletModalProps) {
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { User } = useAuth()
  const api = ApiService()

  const validateNome = (value: string) => {
    if (value.length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres'
    }
    return ''
  }

  const handleInputChange = (value: string) => {
    setNome(value)
    const validationError = validateNome(value)
    setError(validationError)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateNome(nome)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!User?.id) {
      toast.error('Usuário não encontrado')
      return
    }

    try {
      setLoading(true)

      await api.createWallet({
        name: nome.trim(),
      })

      toast.success('Carteira criada com sucesso!')

      setNome('')
      setError('')
      onClose()
      onSuccess()
      window.location.reload()
    } catch (error: any) {
      console.error('Erro ao criar carteira:', error)
      toast.error(error || 'Erro ao criar carteira')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNome('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="mb-2 flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-primary/10"
            aria-hidden="true"
          >
            <WalletIcon size={20} className="text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Criar Nova Carteira
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Crie uma carteira para organizar suas finanças
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Digite o nome da carteira"
              value={nome}
              onChange={e => handleInputChange(e.target.value)}
              disabled={loading}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !!error || nome.length < 3}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
