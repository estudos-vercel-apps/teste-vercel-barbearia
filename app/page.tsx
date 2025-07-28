import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Star, Scissors, Users, Calendar } from "lucide-react"

export default function HomePage() {
  const services = [
    {
      name: "Corte Tradicional",
      description: "Corte clássico com tesoura e máquina",
      duration: "30 min",
      price: "R$ 25,00",
    },
    {
      name: "Corte + Barba",
      description: "Corte completo com aparação de barba",
      duration: "45 min",
      price: "R$ 35,00",
    },
    {
      name: "Barba Completa",
      description: "Aparação e modelagem de barba",
      duration: "20 min",
      price: "R$ 15,00",
    },
    {
      name: "Corte Degradê",
      description: "Corte moderno com degradê",
      duration: "40 min",
      price: "R$ 30,00",
    },
    {
      name: "Sobrancelha",
      description: "Aparação e modelagem de sobrancelha",
      duration: "15 min",
      price: "R$ 10,00",
    },
    {
      name: "Pacote Completo",
      description: "Corte + Barba + Sobrancelha",
      duration: "60 min",
      price: "R$ 45,00",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-amber-500" />
              <h1 className="text-2xl font-bold text-white">BarbeariaTop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black bg-transparent"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-amber-500 text-black hover:bg-amber-600">Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-5xl font-bold">
              Estilo e Tradição em <span className="text-amber-500">Cada Corte</span>
            </h2>
            <p className="mb-8 text-xl text-slate-300">
              A melhor barbearia da cidade com profissionais experientes e ambiente acolhedor. Agende seu horário e
              experimente nossos serviços premium.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Horário
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <Phone className="mr-2 h-5 w-5" />
                (11) 99999-9999
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">500+</h3>
              <p className="text-slate-300">Clientes Satisfeitos</p>
            </div>
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500">
                <Star className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">5.0</h3>
              <p className="text-slate-300">Avaliação Média</p>
            </div>
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500">
                <Clock className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-2 text-3xl font-bold">10+</h3>
              <p className="text-slate-300">Anos de Experiência</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">Nossos Serviços</h2>
            <p className="text-xl text-slate-300">Oferecemos uma ampla gama de serviços para cuidar do seu visual</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card key={index} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{service.name}</CardTitle>
                    <Badge variant="secondary" className="bg-amber-500 text-black">
                      {service.price}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-300">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-slate-400">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-white">Nossa Localização</h2>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-amber-500" />
                  <span>Rua das Flores, 123 - Centro, São Paulo - SP</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-amber-500" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-amber-500" />
                  <div>
                    <p>Segunda a Sexta: 9h às 19h</p>
                    <p>Sábado: 8h às 17h</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-700 p-8">
              <h3 className="mb-4 text-2xl font-bold text-white">Pronto para agendar?</h3>
              <p className="mb-6 text-slate-300">Cadastre-se agora e agende seu horário de forma rápida e prática.</p>
              <Link href="/register">
                <Button size="lg" className="w-full bg-amber-500 text-black hover:bg-amber-600">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <div className="flex items-center justify-center space-x-2">
            <Scissors className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-white">BarbeariaTop</span>
          </div>
          <p className="mt-4">© 2024 BarbeariaTop. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
