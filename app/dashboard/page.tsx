"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Scissors, User, LogOut, Plus, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { signOut, getCurrentUser, getUserProfile } from "@/lib/auth"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  notes: string | null
  services: {
    name: string
    duration: number
    price: number
  } | null
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      // Tentar carregar o perfil com retry
      let userProfile = null
      let retries = 3

      while (retries > 0 && !userProfile) {
        try {
          userProfile = await getUserProfile(currentUser.id)
          break
        } catch (profileError) {
          console.warn(`Tentativa ${4 - retries} falhou:`, profileError)
          retries--
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
      }

      if (!userProfile) {
        setError("Erro ao carregar perfil do usuário. Tente fazer login novamente.")
        return
      }

      setProfile(userProfile)

      // Verificar se é admin e redirecionar
      if (userProfile.is_admin) {
        router.push("/admin")
        return
      }

      // Só carregar appointments se não for admin
      await loadAppointments(currentUser.id)
    } catch (err: any) {
      console.error("Error in checkUser:", err)
      setError("Erro ao carregar dados. Tente fazer login novamente.")
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          notes,
          services!inner (
            name,
            duration,
            price
          )
        `)
        .eq("user_id", userId)
        .order("appointment_date", { ascending: true })

      if (error) {
        console.error("Error loading appointments:", error)
        throw error
      }

      // Filtrar dados válidos
      const validAppointments = (data || []).filter(
        (appointment) =>
          appointment.services &&
          appointment.services.name &&
          appointment.appointment_date &&
          appointment.appointment_time,
      )

      setAppointments(validAppointments)
    } catch (err: any) {
      console.error("Error in loadAppointments:", err)
      setError("Erro ao carregar agendamentos. Tente novamente.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  // Se for admin, não renderizar nada (vai redirecionar)
  if (profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Redirecionando para área administrativa...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-amber-500">
              <Scissors className="h-8 w-8" />
              <span className="text-2xl font-bold">BarbeariaTop</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span>{profile?.full_name || profile?.email || "Usuário"}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {profile?.full_name?.split(" ")[0] || "Cliente"}!
          </h1>
          <p className="text-slate-300">Gerencie seus agendamentos e acompanhe seu histórico</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="h-5 w-5 mr-2 text-amber-500" />
                Novo Agendamento
              </CardTitle>
              <CardDescription className="text-slate-300">Agende um novo horário para seus serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/appointment">
                <Button className="w-full bg-amber-500 text-black hover:bg-amber-600">Agendar Horário</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-amber-500" />
                Meu Perfil
              </CardTitle>
              <CardDescription className="text-slate-300">Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Section */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-500" />
              Meus Agendamentos
            </CardTitle>
            <CardDescription className="text-slate-300">Histórico e próximos agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 mb-4">Você ainda não tem agendamentos</p>
                <Link href="/appointment">
                  <Button className="bg-amber-500 text-black hover:bg-amber-600">Fazer Primeiro Agendamento</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .map((appointment) => {
                    // Verificar se os dados necessários existem
                    if (!appointment.services || !appointment.services.name) {
                      return null
                    }

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-700/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-white">{appointment.services.name}</h3>
                            <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-300">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {appointment.appointment_date
                                ? new Date(appointment.appointment_date).toLocaleDateString("pt-BR")
                                : "Data não disponível"}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.appointment_time || "Horário não disponível"}
                            </div>
                            <div>R$ {appointment.services.price ? appointment.services.price.toFixed(2) : "0,00"}</div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-slate-400 mt-2">Observações: {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                  .filter(Boolean)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
