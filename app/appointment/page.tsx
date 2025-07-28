"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Scissors, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
}

export default function AppointmentPage() {
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadServices()
  }, [])

  const checkUserAndLoadServices = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
      await loadServices()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    const { data, error } = await supabase.from("services").select("*").eq("active", true).order("name")

    if (error) throw error
    setServices(data || [])
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break // Não permitir após 18:00
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(time)
      }
    }
    return slots
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      // Verificar se já existe agendamento no mesmo horário
      const { data: existingAppointment } = await supabase
        .from("appointments")
        .select("id")
        .eq("appointment_date", appointmentDate)
        .eq("appointment_time", appointmentTime)
        .eq("status", "scheduled")
        .single()

      if (existingAppointment) {
        setError("Este horário já está ocupado. Escolha outro horário.")
        setSubmitting(false)
        return
      }

      // Criar agendamento
      const { error: insertError } = await supabase.from("appointments").insert({
        user_id: user.id,
        service_id: selectedService,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes || null,
        status: "scheduled",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Erro ao criar agendamento")
    } finally {
      setSubmitting(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 2) // 2 meses à frente
    return maxDate.toISOString().split("T")[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-green-500 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Agendamento realizado!</h2>
            <p className="text-slate-300">Redirecionando para o dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-amber-500">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2 text-white">
              <Scissors className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold">BarbeariaTop</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Agendar Horário</h1>
            <p className="text-slate-300">Escolha o serviço, data e horário desejados</p>
          </div>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                Novo Agendamento
              </CardTitle>
              <CardDescription className="text-slate-300">
                Preencha os dados abaixo para agendar seu horário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="service" className="text-white">
                    Serviço
                  </Label>
                  <Select value={selectedService} onValueChange={setSelectedService} required>
                    <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-600 bg-slate-700">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id} className="text-white">
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className="text-sm text-slate-400">{service.duration}min</span>
                              <span className="text-sm font-semibold text-amber-500">
                                R$ {service.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && (
                    <div className="mt-2 p-3 rounded-lg bg-slate-700/50">
                      {services.find((s) => s.id === selectedService)?.description && (
                        <p className="text-sm text-slate-300">
                          {services.find((s) => s.id === selectedService)?.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white">
                      Data
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                      className="border-slate-600 bg-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white">
                      Horário
                    </Label>
                    <Select value={appointmentTime} onValueChange={setAppointmentTime} required>
                      <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-600 bg-slate-700">
                        {generateTimeSlots().map((time) => (
                          <SelectItem key={time} value={time} className="text-white">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alguma observação especial para o atendimento..."
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 bg-amber-500 text-black hover:bg-amber-600"
                    disabled={submitting}
                  >
                    {submitting ? "Agendando..." : "Confirmar Agendamento"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
