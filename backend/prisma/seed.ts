import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Crear negocio de prueba
  const negocio = await prisma.negocio.upsert({
    where: { id: 'test-negocio-id' },
    update: {},
    create: {
      id: 'test-negocio-id',
      nombre: 'Barbería Veylo Demo',
      direccion: 'Av. Corrientes 1234, CABA',
      telefono: '11-5555-1234',
      email: 'contacto@veylo.barber',
      timezone: 'America/Argentina/Buenos_Aires',
      configuracion: JSON.stringify({
        horarioApertura: '09:00',
        horarioCierre: '20:00',
        duracionTurno: 30,
      }),
    },
  });
  console.log(`✅ Negocio creado: ${negocio.nombre}`);

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUsuario = await prisma.usuario.upsert({
    where: { email: 'admin@veylo.barber' },
    update: {},
    create: {
      id: 'admin-user-id',
      negocioId: negocio.id,
      nombre: 'Administrador',
      email: 'admin@veylo.barber',
      password: hashedPassword,
      rol: 'admin',
      activo: true,
    },
  });
  console.log(`✅ Usuario admin creado: ${adminUsuario.email}`);

  // Crear recepcionista
  const recepcionistaUsuario = await prisma.usuario.upsert({
    where: { email: 'recepcion@veylo.barber' },
    update: {},
    create: {
      id: 'recepcion-user-id',
      negocioId: negocio.id,
      nombre: 'María García',
      email: 'recepcion@veylo.barber',
      password: hashedPassword,
      rol: 'recepcionista',
      activo: true,
    },
  });
  console.log(`✅ Usuario recepcionista creado: ${recepcionistaUsuario.email}`);

  // Crear empleados
  const empleados = await Promise.all([
    prisma.empleado.upsert({
      where: { id: 'empleado-1-id' },
      update: {},
      create: {
        id: 'empleado-1-id',
        negocioId: negocio.id,
        nombre: 'Javier',
        apellido: 'Martínez',
        telefono: '11-4444-5678',
        fotoUrl: null,
        comisionPorcentaje: 20,
        activo: true,
        fechaIngreso: new Date('2024-01-15'),
        especialidades: 'Corte clásico,Degradé,Barba',
      },
    }),
    prisma.empleado.upsert({
      where: { id: 'empleado-2-id' },
      update: {},
      create: {
        id: 'empleado-2-id',
        negocioId: negocio.id,
        nombre: 'Lucas',
        apellido: 'Rodríguez',
        telefono: '11-4444-5679',
        fotoUrl: null,
        comisionPorcentaje: 20,
        activo: true,
        fechaIngreso: new Date('2024-02-01'),
        especialidades: 'Corte moderno,Tintes,Diseño',
      },
    }),
    prisma.empleado.upsert({
      where: { id: 'empleado-3-id' },
      update: {},
      create: {
        id: 'empleado-3-id',
        negocioId: negocio.id,
        nombre: 'Nicolás',
        apellido: 'Fernández',
        telefono: '11-4444-5680',
        fotoUrl: null,
        comisionPorcentaje: 15,
        activo: true,
        fechaIngreso: new Date('2024-03-01'),
        especialidades: 'Barba,Perfilado,Corte infantil',
      },
    }),
  ]);
  console.log(`✅ ${empleados.length} empleados creados`);

  // Asignar usuario a un empleado
  const javierEmpleado = empleados[0];
  await prisma.empleado.update({
    where: { id: javierEmpleado.id },
    data: { usuarioId: adminUsuario.id },
  });

  // Crear horarios para empleados
  const diasSemana = [0, 1, 2, 3, 4, 5]; // Lunes a Sábado
  for (const empleado of empleados) {
    for (const dia of diasSemana) {
      await prisma.horarioEmpleado.upsert({
        where: {
          empleadoId_diaSemana: {
            empleadoId: empleado.id,
            diaSemana: dia,
          },
        },
        update: {},
        create: {
          empleadoId: empleado.id,
          diaSemana: dia,
          horaInicio: '09:00',
          horaFin: '20:00',
          activo: true,
        },
      });
    }
  }
  console.log('✅ Horarios de empleados creados');

  // Crear servicios
  const servicios = await Promise.all([
    prisma.servicio.upsert({
      where: { id: 'servicio-1-id' },
      update: {},
      create: {
        id: 'servicio-1-id',
        negocioId: negocio.id,
        nombre: 'Corte clásico',
        descripcion: 'Corte de cabello tradicional con tijera y máquina',
        precio: 2200,
        duracionMin: 25,
        colorAgenda: '#3B82F6',
        activo: true,
        categoria: 'Cortes',
      },
    }),
    prisma.servicio.upsert({
      where: { id: 'servicio-2-id' },
      update: {},
      create: {
        id: 'servicio-2-id',
        negocioId: negocio.id,
        nombre: 'Corte degradé',
        descripcion: 'Corte con degradado moderno y detallado',
        precio: 2800,
        duracionMin: 30,
        colorAgenda: '#8B5CF6',
        activo: true,
        categoria: 'Cortes',
      },
    }),
    prisma.servicio.upsert({
      where: { id: 'servicio-3-id' },
      update: {},
      create: {
        id: 'servicio-3-id',
        negocioId: negocio.id,
        nombre: 'Corte + Barba',
        descripcion: 'Combo de corte y arreglo de barba',
        precio: 3500,
        duracionMin: 50,
        colorAgenda: '#10B981',
        activo: true,
        categoria: 'Combos',
      },
    }),
    prisma.servicio.upsert({
      where: { id: 'servicio-4-id' },
      update: {},
      create: {
        id: 'servicio-4-id',
        negocioId: negocio.id,
        nombre: 'Arreglo de barba',
        descripcion: 'Perfilado y recorte de barba',
        precio: 1500,
        duracionMin: 20,
        colorAgenda: '#F59E0B',
        activo: true,
        categoria: 'Barba',
      },
    }),
    prisma.servicio.upsert({
      where: { id: 'servicio-5-id' },
      update: {},
      create: {
        id: 'servicio-5-id',
        negocioId: negocio.id,
        nombre: 'Diseño personalizado',
        descripcion: 'Diseño de cabello a medida',
        precio: 4500,
        duracionMin: 60,
        colorAgenda: '#EC4899',
        activo: true,
        categoria: 'Premium',
      },
    }),
  ]);
  console.log(`✅ ${servicios.length} servicios creados`);

  // Asignar servicios a empleados
  for (const empleado of empleados) {
    for (const servicio of servicios) {
      await prisma.servicioEmpleado.upsert({
        where: {
          empleadoId_servicioId: {
            empleadoId: empleado.id,
            servicioId: servicio.id,
          },
        },
        update: {},
        create: {
          empleadoId: empleado.id,
          servicioId: servicio.id,
        },
      });
    }
  }
  console.log('✅ Servicios asignados a empleados');

  // Crear clientes de prueba
  const clientes = await Promise.all([
    prisma.cliente.upsert({
      where: { id: 'cliente-1-id' },
      update: {},
      create: {
        id: 'cliente-1-id',
        negocioId: negocio.id,
        nombre: 'Carlos',
        apellido: 'Ramírez',
        telefono: '11-4523-1234',
        email: 'carlos@gmail.com',
        fechaNacimiento: new Date('1990-05-12'),
        segmento: 'frecuente',
        puntosAcumulados: 340,
        preferencias: 'Corte bajo con fade. Rata al costado izquierda.',
        observaciones: 'Cliente VIP. Buen pagador. Prefiere citas matutinas.',
      },
    }),
    prisma.cliente.upsert({
      where: { id: 'cliente-2-id' },
      update: {},
      create: {
        id: 'cliente-2-id',
        negocioId: negocio.id,
        nombre: 'Diego',
        apellido: 'Fernández',
        telefono: '11-5678-9012',
        email: 'diego@gmail.com',
        fechaNacimiento: new Date('1988-08-22'),
        segmento: 'frecuente',
        puntosAcumulados: 210,
        preferencias: 'Corte alto, sin usar máquina en los costados.',
        observaciones: '',
      },
    }),
    prisma.cliente.upsert({
      where: { id: 'cliente-3-id' },
      update: {},
      create: {
        id: 'cliente-3-id',
        negocioId: negocio.id,
        nombre: 'Martín',
        apellido: 'Sosa',
        telefono: '11-3456-7890',
        email: 'martin@gmail.com',
        fechaNacimiento: new Date('1995-11-30'),
        segmento: 'nuevo',
        puntosAcumulados: 50,
        preferencias: '',
        observaciones: '',
      },
    }),
    prisma.cliente.upsert({
      where: { id: 'cliente-4-id' },
      update: {},
      create: {
        id: 'cliente-4-id',
        negocioId: negocio.id,
        nombre: 'Rodrigo',
        apellido: 'Gómez',
        telefono: '11-2345-6789',
        email: 'rodrigo@gmail.com',
        fechaNacimiento: new Date('1992-03-15'),
        segmento: 'frecuente',
        puntosAcumulados: 180,
        preferencias: 'Barba bien perfilada, cejas recortadas.',
        observaciones: 'Siempre paga con tarjeta.',
      },
    }),
    prisma.cliente.upsert({
      where: { id: 'cliente-5-id' },
      update: {},
      create: {
        id: 'cliente-5-id',
        negocioId: negocio.id,
        nombre: 'Pablo',
        apellido: 'Torres',
        telefono: '11-8901-2345',
        email: 'pablo@gmail.com',
        fechaNacimiento: new Date('1987-07-08'),
        segmento: 'inactivo',
        puntosAcumulados: 85,
        preferencias: '',
        observaciones: 'No viene desde hace 3 meses.',
      },
    }),
  ]);
  console.log(`✅ ${clientes.length} clientes creados`);

  // Crear algunos turnos de prueba (para hoy y días siguientes)
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const turnos = await Promise.all([
    prisma.turno.create({
      data: {
        id: 'turno-1-id',
        negocioId: negocio.id,
        clienteId: clientes[0].id,
        empleadoId: empleados[0].id,
        fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 10, 30),
        fechaFin: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 11, 20),
        estado: 'confirmado',
        origen: 'web',
        notas: '',
        servicios: {
          create: [
            {
              servicioId: servicios[2].id,
              precioAplicado: 3500,
              duracionAplicada: 50,
            },
          ],
        },
      },
    }),
    prisma.turno.create({
      data: {
        id: 'turno-2-id',
        negocioId: negocio.id,
        clienteId: clientes[1].id,
        empleadoId: empleados[1].id,
        fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 14, 0),
        fechaFin: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 14, 30),
        estado: 'pendiente',
        origen: 'presencial',
        notas: '',
        servicios: {
          create: [
            {
              servicioId: servicios[1].id,
              precioAplicado: 2800,
              duracionAplicada: 30,
            },
          ],
        },
      },
    }),
    prisma.turno.create({
      data: {
        id: 'turno-3-id',
        negocioId: negocio.id,
        clienteId: clientes[0].id,
        empleadoId: empleados[0].id,
        fechaInicio: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 10, 30),
        fechaFin: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 11, 20),
        estado: 'confirmado',
        origen: 'phone',
        notas: '',
        servicios: {
          create: [
            {
              servicioId: servicios[2].id,
              precioAplicado: 3500,
              duracionAplicada: 50,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ ${turnos.length} turnos de prueba creados`);

  // Crear productos de prueba
  const productos = await Promise.all([
    prisma.producto.upsert({
      where: { id: 'producto-1-id' },
      update: {},
      create: {
        id: 'producto-1-id',
        negocioId: negocio.id,
        nombre: 'Pomada Mate',
        descripcion: 'Pomada para cabello con fijación fuerte',
        tipo: 'venta',
        precioVenta: 3500,
        costoCompra: 2000,
        stockActual: 15,
        stockMinimo: 5,
        unidad: 'unidad',
        activo: true,
      },
    }),
    prisma.producto.upsert({
      where: { id: 'producto-2-id' },
      update: {},
      create: {
        id: 'producto-2-id',
        negocioId: negocio.id,
        nombre: 'Aceite para barba',
        descripcion: 'Aceite hidratante para barba',
        tipo: 'venta',
        precioVenta: 2800,
        costoCompra: 1500,
        stockActual: 8,
        stockMinimo: 3,
        unidad: 'botella',
        activo: true,
      },
    }),
    prisma.producto.upsert({
      where: { id: 'producto-3-id' },
      update: {},
      create: {
        id: 'producto-3-id',
        negocioId: negocio.id,
        nombre: 'Toallas desechables',
        descripcion: 'Paquete de 50 toallas',
        tipo: 'insumo',
        costoCompra: 500,
        stockActual: 3,
        stockMinimo: 5,
        unidad: 'paquete',
        activo: true,
      },
    }),
  ]);
  console.log(`✅ ${productos.length} productos creados`);

  // Crear cupón de prueba
  const cupon = await prisma.cupon.upsert({
    where: { codigo: 'BIENVENIDO10' },
    update: {},
    create: {
      negocioId: negocio.id,
      codigo: 'BIENVENIDO10',
      descripcion: 'Descuento para nuevos clientes',
      tipoDescuento: 'porcentaje',
      valor: 10,
      usosMax: 100,
      usosActuales: 0,
      fechaDesde: new Date(),
      fechaHasta: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      activo: true,
    },
  });
  console.log(`✅ Cupón creado: ${cupon.codigo}`);

  // Crear membresía de prueba
  const membresia = await prisma.membresia.upsert({
    where: { id: 'membresia-vip-id' },
    update: {},
    create: {
      id: 'membresia-vip-id',
      negocioId: negocio.id,
      nombre: 'VIP',
      descripcion: 'Membresía VIP con beneficios exclusivos',
      precioMensual: 5000,
      beneficios: JSON.stringify([
        '10% descuento en todos los servicios',
        'Prioridad en reservas',
        'Producto de regalo cada 5 visitas',
      ]),
      activa: true,
    },
  });
  console.log(`✅ Membresía creada: ${membresia.nombre}`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Admin: admin@veylo.barber / admin123');
  console.log('   Recepcionista: recepcion@veylo.barber / admin123');
  console.log('\n🌐 Backend corriendo en: http://localhost:3001');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
