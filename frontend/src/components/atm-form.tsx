import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
import { Upload, X, FileText, Image, Download } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateField, DateInput } from '@/components/ui/datefield-rac'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { useNavigate } from '@tanstack/react-router'
import { ApiService } from '@/api/service'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const parseCurrency = (value: string) => {
  // Remove tudo exceto números, vírgula e ponto
  const cleanValue = value.replace(/[^\d,]/g, '')

  // Se não tem vírgula, assume que são centavos
  if (!cleanValue.includes(',')) {
    return Number(cleanValue) / 100
  }

  // Se tem vírgula, divide em parte inteira e decimal
  const parts = cleanValue.split(',')
  const integerPart = parts[0]
  const decimalPart = (parts[1] || '').substring(0, 2).padEnd(2, '0')

  return Number(`${integerPart}.${decimalPart}`)
}

const formatInputCurrency = (value: string, previousValue = '') => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '')

  // Se está vazio, retorna vazio
  if (!numbers) return ''

  // Converte para número (centavos)
  let amount = Number(numbers)

  // Se o usuário está deletando, ajusta adequadamente
  if (value.length < previousValue.length && numbers.length > 0) {
    amount = Math.floor(amount / 10)
  }

  // Converte centavos para reais
  const reais = amount / 100

  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais)
}

const formSchema = z.object({
  nome: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres.',
  }),
  value: z.number().min(0.01, {
    message: 'O valor deve ser maior que zero.',
  }),
  createdPg: z.instanceof(CalendarDate, {
    message: 'A data é obrigatória.',
  }),
  type: z.string().min(1, {
    message: 'Selecione uma categoria.',
  }),
  paymentDueDate: z.instanceof(CalendarDate).optional().nullable(),
  typePayment: z.string().min(1, {
    message: 'Selecione um tipo de pagamento.',
  }),
  statusPg: z.string().optional(),
})

interface AtmFormProps {
  mode: 'create' | 'edit'
  data?: any
}

export function AtmForm({ mode, data }: AtmFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [existingProofUrl, setExistingProofUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [currencyValue, setCurrencyValue] = useState('')
  const { User } = useAuth()
  const navigate = useNavigate()
  const api = ApiService()

  const getCurrentLocation = (): Promise<{
    latitude: number | null
    longitude: number | null
    accuracy: number | null
  }> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null, accuracy: null })
        return
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        () => {
          // Se houver erro ou negação, envia null
          resolve({ latitude: null, longitude: null, accuracy: null })
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutos
        }
      )
    })
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      value: 0,
      createdPg: today(getLocalTimeZone()),
      type: '',
      paymentDueDate: null,
      typePayment: '',
      statusPg: '',
    },
  })

  const watchType = form.watch('type')

  const loadProofUrl = useCallback(async (proofId: string) => {
    try {
      const previewUrl = `${import.meta.env.VITE_API_URL}/comprovante/preview/${proofId}`
      setExistingProofUrl(previewUrl)
    } catch (error) {
      console.error('Erro ao carregar comprovante:', error)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !data) return

    const loadEditData = async () => {
      setId(data.id)

      // Converter datas do backend para CalendarDate
      const createdDate = new Date(data.createdPg)
      const paymentDate = data.paymentDueDate
        ? new Date(data.paymentDueDate)
        : null

      console.log('Dados recebidos:', data)
      console.log('Type:', data.type, 'TypePayment:', data.typePayment)
      console.log('Chaves do objeto data:', Object.keys(data))
      console.log('Tipo de typePayment:', typeof data.typePayment)
      console.log('Valor de typePayment:', data.typePayment)

      form.reset({
        nome: data.nome || '',
        value: data.value || 0,
        createdPg: new CalendarDate(
          createdDate.getFullYear(),
          createdDate.getMonth() + 1,
          createdDate.getDate()
        ),
        type: data.type || '',
        paymentDueDate: paymentDate
          ? new CalendarDate(
              paymentDate.getFullYear(),
              paymentDate.getMonth() + 1,
              paymentDate.getDate()
            )
          : null,
        typePayment: data.typePayment || '',
        statusPg: data.statusPg || '',
      })

      // Forçar atualização dos campos após reset
      setTimeout(() => {
        form.setValue('type', data.type || '')
        form.setValue('typePayment', data.typePayment || '')
        form.setValue('statusPg', data.statusPg || '')
      }, 200)

      if (data.value) {
        setCurrencyValue(formatCurrency(data.value))
      }

      // Carregar comprovante se existir
      if (data.proofId) {
        loadProofUrl(data.proofId)
      }
    }

    loadEditData()
  }, [mode, data, form, loadProofUrl])

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.uploadFile(formData)
      return response.id
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo')
      console.error(error)
      return null
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Obter carteira fixada do localStorage ou usar a primeira disponível
    const selectedWallet = localStorage.getItem('selectedWallet')
    let walletId = selectedWallet

    // Se não tem carteira salva ou ela não existe mais, usar a primeira
    if (!selectedWallet || !User?.Wallets?.some(w => w.id === selectedWallet)) {
      walletId = User?.Wallets?.[0]?.id || null
    }

    if (!walletId) {
      toast.error('Nenhuma carteira selecionada')
      return
    }

    try {
      setLoading(true)

      let proofId = null
      if (uploadedFile) {
        proofId = await handleFileUpload(uploadedFile)
        if (!proofId) return
      }

      // Obter localização atual
      const gpsLocation = await getCurrentLocation()
      console.log('GPS capturado:', gpsLocation)

      const payload = {
        nome: values.nome,
        value: values.value,
        walletId: walletId,
        proofId,
        typePayment: values.typePayment,
        createdPg: values.createdPg.toDate(getLocalTimeZone()),
        paymentDueDate: values.paymentDueDate
          ? values.paymentDueDate.toDate(getLocalTimeZone())
          : undefined,
        gps: gpsLocation,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        statusPg: values.statusPg,
      }

      const api = ApiService()

      if (mode === 'create') {
        if (values.type === 'Credito') {
          await api.createAtmCredito(payload)
        } else {
          await api.createAtmDebito(payload)
        }
        toast.success('Registro criado com sucesso!')
      } else {
        if (!id) return
        await api.updateAtm(id, payload)
        toast.success('Registro atualizado com sucesso!')
      }

      navigate({ to: '/' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar registro')
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files?.[0]) {
      handleFileChange(files[0])
    }
  }

  const handleFileChange = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.')
      return
    }

    setUploadedFile(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const removeExistingProof = async () => {
    if (!id) return

    try {
      setLoading(true)
      await api.updateAtm(id, { proofId: null })
      setExistingProofUrl(null)
      toast.success('Comprovante removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover comprovante:', error)
      toast.error('Erro ao remover comprovante')
    } finally {
      setLoading(false)
    }
  }

  const getFileTypeFromUrl = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    return extension === 'pdf' ? 'pdf' : 'image'
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8" />
    return <Image className="h-8 w-8" />
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição da transação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="R$ 0,00"
                    value={currencyValue}
                    onChange={e => {
                      const newValue = formatInputCurrency(
                        e.target.value,
                        currencyValue
                      )
                      setCurrencyValue(newValue)
                      const numericValue = parseCurrency(newValue)
                      field.onChange(numericValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdPg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <DateField value={field.value} onChange={field.onChange}>
                    <DateInput />
                  </DateField>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={mode === 'edit'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Credito">Receita</SelectItem>
                    <SelectItem value="Debito">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchType === 'Debito' && (
            <FormField
              control={form.control}
              name="paymentDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de vencimento</FormLabel>
                  <FormControl>
                    <DateField value={field.value} onChange={field.onChange}>
                      <DateInput />
                    </DateField>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="typePayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de pagamento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchType === 'Debito' && (
            <FormField
              control={form.control}
              name="statusPg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'EM ABERTO'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EM ABERTO">Em Aberto</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="space-y-2">
            <label htmlFor="proof" className="text-sm font-medium">
              Comprovante
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!uploadedFile && !existingProofUrl ? (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Arraste arquivos aqui ou{' '}
                      <label className="text-primary cursor-pointer hover:underline">
                        clique para selecionar
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e =>
                            e.target.files?.[0] &&
                            handleFileChange(e.target.files[0])
                          }
                        />
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG ou PNG até 10MB
                    </p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(uploadedFile)}
                    <div className="text-left">
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : existingProofUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      {getFileTypeFromUrl(existingProofUrl) === 'pdf' ? (
                        <FileText className="h-8 w-8" />
                      ) : (
                        <Image className="h-8 w-8" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium">Comprovante atual</p>
                        <p className="text-xs text-muted-foreground">
                          {getFileTypeFromUrl(existingProofUrl) === 'pdf'
                            ? 'PDF'
                            : 'Imagem'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(existingProofUrl, '_blank')}
                      >
                        Ver
                      </Button>
                      {data?.proofId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `${import.meta.env.VITE_API_URL}/comprovante/download/${data.proofId}`,
                              '_blank'
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeExistingProof}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    {getFileTypeFromUrl(existingProofUrl) === 'image' ? (
                      <img
                        src={existingProofUrl}
                        alt="Comprovante"
                        className="max-w-full h-auto max-h-48 rounded-md border"
                        onError={e => {
                          console.error('Erro ao carregar imagem')
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <embed
                        src={existingProofUrl}
                        type="application/pdf"
                        className="w-full h-48 rounded-md border"
                        style={{ display: 'block' }}
                        onError={e => {
                          console.error('Erro ao carregar PDF')
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>

                  {!data?.proofId && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Substituir comprovante
                      </p>
                      <label className="text-primary cursor-pointer hover:underline text-sm">
                        Clique para selecionar novo arquivo
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e =>
                            e.target.files?.[0] &&
                            handleFileChange(e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  )}

                  {data?.proofId && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Para substituir o comprovante, primeiro exclua o atual
                        clicando no botão ✕ acima
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: '/' })}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
