"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scissors, ArrowLeft, User, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadProfile()
  }, [])

  const checkUserAndLoadProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const userProfile = await getUserProfile(currentUser.id)
      setProfile(userProfile)

      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Perfil atualizado com sucesso!")

      // Recarregar perfil
      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil")
    } finally {
      setSaving(false)
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
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-slate-300">Atualize suas informações pessoais</p>
          </div>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-amber-500" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-slate-300">Mantenha seus dados sempre atualizados</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-500 bg-green-500/10">
                    <AlertDescription className="text-green-400">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="border-slate-600 bg-slate-700/50 text-slate-400"
                  />
                  <p className="text-sm text-slate-400">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white">
                    Nome Completo
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                    placeholder="(11) 99999-9999"
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
                  <Button type="submit" className="flex-1 bg-amber-500 text-black hover:bg-amber-600" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
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
