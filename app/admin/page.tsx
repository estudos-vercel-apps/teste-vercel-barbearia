"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Scissors, User, LogOut, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { signOut, getCurrentUser, getUserProfile } from "@/lib/auth"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  notes: string | null
  created_at: string
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
  }
  services: {
    name: string
    duration: number
    price: number
  }
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    totalUsers: 0,
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  const checkAdminAndLoadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const userProfile = await getUserProfile(currentUser.id)
      setProfile(userProfile)

      // Verificar se é admin
      if (!userProfile.is_admin) {
        router.push("/dashboard")
        return
      }

      await Promise.all([loadAppointments(), loadUsers(), loadStats()])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        profiles (
          full_name,
          email,
          phone
        ),
        services (
          name,
          duration,
          price
        )
      `)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })

    if (error) throw error
    setAppointments(data || [])
  }

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_admin", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    setUsers(data || [])
  }

  const loadStats = async () => {
    const { data: appointmentsData } = await supabase.from("appointments").select("status")

    const { data: usersData } = await supabase.from("profiles").select("id").eq("is_admin", false)

    if (appointmentsData && usersData) {
      setStats({
        totalAppointments: appointmentsData.length,
        scheduledAppointments: appointmentsData.filter((a) => a.status === "scheduled").length,
        completedAppointments: appointmentsData.filter((a) => a.status === "completed").length,
        totalUsers: usersData.length,
      })
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: "scheduled" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (error) throw error

      // Recarregar dados
      await Promise.all([loadAppointments(), loadStats()])
    } catch (err: any) {
      setError(err.message)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <Scissors className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold">BarbeariaTop</span>
              <Badge className="bg-amber-500 text-black ml-2">Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span>{profile?.full_name || profile?.email}</span>
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
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-300">Gerencie agendamentos, usuários e configurações da barbearia</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Agendamentos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Agendados</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.scheduledAppointments}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Concluídos</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedAppointments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
            >
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                  Gerenciar Agendamentos
                </CardTitle>
                <CardDescription className="text-slate-300">Visualize e gerencie todos os agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">Nenhum agendamento encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                            <div>
                              <p>
                                <strong>Cliente:</strong> {appointment.profiles.full_name || appointment.profiles.email}
                              </p>
                              <p>
                                <strong>Email:</strong> {appointment.profiles.email}
                              </p>
                              {appointment.profiles.phone && (
                                <p>
                                  <strong>Telefone:</strong> {appointment.profiles.phone}
                                </p>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.appointment_time}
                              </div>
                              <p>
                                <strong>Preço:</strong> R$ {appointment.services.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-slate-400 mt-2">
                              <strong>Observações:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Concluir
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          {appointment.status === "cancelled" && (
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "scheduled")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Reagendar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-amber-500" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription className="text-slate-300">Visualize todos os usuários cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-700/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-white">{user.full_name || "Nome não informado"}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                            <div>
                              <p>
                                <strong>Email:</strong> {user.email}
                              </p>
                              {user.phone && (
                                <p>
                                  <strong>Telefone:</strong> {user.phone}
                                </p>
                              )}
                            </div>
                            <div>
                              <p>
                                <strong>Cadastrado em:</strong> {new Date(user.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
