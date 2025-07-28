"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scissors, Eye, EyeOff } from "lucide-react"
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-white hover:text-amber-500">
            <Scissors className="h-8 w-8" />
            <span className="text-2xl font-bold">BarbeariaTop</span>
          </Link>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Entrar</CardTitle>
            <CardDescription className="text-slate-300">Acesse sua conta para agendar horários</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 pr-10"
                    placeholder="Sua senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-600" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Credenciais de Teste - Remover em produção */}
            <div className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/10">
              <h3 className="text-amber-500 font-semibold mb-2">🧪 Credenciais de Teste</h3>
              <div className="space-y-2 text-sm">
                <div className="text-slate-300">
                  <strong>Cliente:</strong> cliente@teste.com
                  <br />
                  <strong>Senha:</strong> 123456
                </div>
                <div className="text-slate-300">
                  <strong>Admin:</strong> admin@barbeariatop.com
                  <br />
                  <strong>Senha:</strong> admin123
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Use essas credenciais para testar o sistema sem verificação de email
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-300">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-amber-500 hover:text-amber-400">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
