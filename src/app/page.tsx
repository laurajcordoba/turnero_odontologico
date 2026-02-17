import Link from "next/link";
import {
  Calendar,
  Clock,
  Shield,
  Sparkles,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    name: "Arreglos",
    description: "Restauraciones y empastes dentales con materiales de calidad",
    duration: "30 min",
  },
  {
    name: "Extracciones",
    description: "Extracciones dentales con anestesia local y seguimiento",
    duration: "60 min",
  },
  {
    name: "Limpieza bucal",
    description: "Limpieza profesional y pulido para una sonrisa saludable",
    duration: "30 min",
  },
  {
    name: "Otros tratamientos",
    description: "Consultas generales y otros procedimientos odontologicos",
    duration: "30 min",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Turnero Odontologico
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-sm text-gray-600 hover:text-gray-900">
              Servicios
            </a>
            <a href="#nosotros" className="text-sm text-gray-600 hover:text-gray-900">
              Nosotros
            </a>
            <a href="#contacto" className="text-sm text-gray-600 hover:text-gray-900">
              Contacto
            </a>
            <Link href="/reservar">
              <Button size="sm">Reservar turno</Button>
            </Link>
          </nav>
          <Link href="/reservar" className="md:hidden">
            <Button size="sm">Reservar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tu sonrisa merece la mejor atencion
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Reserve su turno odontologico de forma rapida y sencilla.
            Atencion personalizada con los mejores profesionales.
          </p>
          <Link href="/reservar">
            <Button size="lg">
              Reservar turno
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Turnos online 24/7
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Confirmacion inmediata
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Recordatorio por WhatsApp
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Nuestros servicios
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de tratamientos odontologicos para
            cuidar su salud bucal
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Clock className="w-4 h-4" />
                  {service.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="nosotros" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sobre nosotros
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Somos un consultorio odontologico dedicado a brindar atencion de
            calidad. Con anos de experiencia, nos enfocamos en la salud
            bucal de nuestros pacientes utilizando las tecnicas mas modernas
            y un trato personalizado.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Profesionalismo
              </h3>
              <p className="text-sm text-gray-600">
                Atencion con los mas altos estandares de calidad y bioseguridad
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puntualidad
              </h3>
              <p className="text-sm text-gray-600">
                Respetamos su tiempo con un sistema de turnos eficiente
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Tecnologia
              </h3>
              <p className="text-sm text-gray-600">
                Equipamiento moderno para un tratamiento preciso y confortable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contacto</h2>
          <p className="text-gray-600 mb-8">
            No dude en contactarnos para cualquier consulta
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Telefono</p>
                <p className="font-medium text-gray-900">(011) 1234-5678</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Direccion</p>
                <p className="font-medium text-gray-900">
                  Av. Ejemplo 1234, CABA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">
              Turnero Odontologico
            </span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
