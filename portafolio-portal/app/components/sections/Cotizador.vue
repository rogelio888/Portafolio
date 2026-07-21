<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  plans, 
  domainRates, 
  domainAdjustments, 
  hostingRates,
  managedHostingRates,
  contractingPolicies,
  contractingPoliciesSaaS,
  additionalCosts,
  type Plan,
  type AdditionalCost
} from '../../utils/plansData'

import {
  Sun, Moon, Search, Check, CheckCircle, HelpCircle, FileText, Mail, Printer,
  ChevronRight, ChevronDown, Info, DollarSign, Calendar, AlertCircle, X,
  MessageSquare, ShieldCheck, Activity, Building2, Heart, GraduationCap,
  Dumbbell, Leaf, Rocket, Layers, Users, Coins, Flame, Laptop, ShoppingCart,
  Briefcase, Globe, Database, Compass, BadgeAlert, Cpu, ShoppingBag, BookOpen,
  Server, Shield, CreditCard, ExternalLink, CheckCircle2
} from 'lucide-vue-next'

const LucideIcons: Record<string, any> = {
  Sun, Moon, Search, Check, CheckCircle, HelpCircle, FileText, Mail, Printer,
  ChevronRight, ChevronDown, Info, DollarSign, Calendar, AlertCircle, X,
  MessageSquare, ShieldCheck, Activity, Building2, Heart, GraduationCap,
  Dumbbell, Leaf, Rocket, Layers, Users, Coins, Flame, Laptop, ShoppingCart,
  Briefcase, Globe, Database, Compass, BadgeAlert, Cpu, ShoppingBag, BookOpen,
  Server, Shield, CreditCard, ExternalLink, CheckCircle2
}

// --- ESTADO DEL COTIZADOR ---
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedPlan = ref<Plan | null>(null)

// Model Selection ('sale' = Venta Completa, 'rent' = Alquiler SaaS)
const selectedModel = ref('sale')

const selectedHostingPeriod = ref('monthly') // Default matching 'sale' model
const selectedDomain = ref('.com') // '.com' or '.com.bo'
const includeMaintenance = ref(false)
const maintenanceType = ref('monthly') // 'monthly' or 'annual'
const customFeaturePrice = ref(0)
const customFeatureDescription = ref('')
const originProjectName = ref<string | null>(null)

// Track expanded plans for the "Ver más" toggle
const expandedPlans = ref<Record<string | number, boolean>>({})

const togglePlanExpand = (id: string | number) => {
  expandedPlans.value[String(id)] = !expandedPlans.value[String(id)]
}
const isPlanExpanded = (id: string | number) => !!expandedPlans.value[String(id)]

watch(selectedPlan, (newPlan) => {
  if (!newPlan) return
  if (!newPlan.saas) {
    selectedModel.value = 'sale'
  }
})

watch(selectedModel, (newModel) => {
  if (newModel === 'sale') {
    selectedHostingPeriod.value = 'monthly'
  } else {
    selectedHostingPeriod.value = 'annual'
  }
})

onMounted(() => {
  selectedPlan.value = plans[0] || null
})

const categories = [
  { id: 'all', name: 'Todos los Planes' },
  { id: 'basic', name: 'Básicos' },
  { id: 'medium', name: 'Corporativos' },
  { id: 'advanced', name: 'Sistemas Avanzados' }
]

const filteredPlans = computed(() => {
  return plans.filter(plan => {
    const categoryMatch = selectedCategory.value === 'all' || plan.category === selectedCategory.value
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return categoryMatch

    const nameMatch = plan.name.toLowerCase().includes(query)
    const descMatch = plan.description.toLowerCase().includes(query)
    const idealMatch = plan.idealFor.some(item => item.toLowerCase().includes(query))
    const includesMatch = plan.includes.some(item => item.toLowerCase().includes(query))

    return categoryMatch && (nameMatch || descMatch || idealMatch || includesMatch)
  })
})

const selectPlan = (plan: Plan) => {
  selectedPlan.value = plan
  customFeaturePrice.value = 0
  customFeatureDescription.value = ''
  includeMaintenance.value = false
  originProjectName.value = null

  // Smooth scroll to calculator on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    setTimeout(() => {
      const calcEl = document.getElementById('quote-calculator')
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 80)
  }
}

const calculatorResults = computed(() => {
  if (!selectedPlan.value) return null

  const extraDevCost = customFeaturePrice.value || 0

  if (selectedModel.value === 'sale') {
    const baseDevMin = selectedPlan.value.pricing.devMin
    const baseDevMax = selectedPlan.value.pricing.devMax || baseDevMin
    
    const rec = selectedPlan.value.pricing.hostingRec
    let baseHostingPrice = selectedPlan.value.pricing.hostingPrice
    const periodKey = selectedHostingPeriod.value
    
    let hostingTotalUpfront = baseHostingPrice
    let hostingRenewal = baseHostingPrice
    
    if (hostingRates[rec] && hostingRates[rec][periodKey]) {
      baseHostingPrice = hostingRates[rec][periodKey].price
      hostingTotalUpfront = hostingRates[rec][periodKey].total
      hostingRenewal = hostingRates[rec][periodKey].renewal
    }
    
    let domainCostReg = 15
    let domainCostRenewal = 15
    const domainRateInfo = domainRates[selectedDomain.value]
    if (domainRateInfo) {
      domainCostReg = domainRateInfo.reg
      domainCostRenewal = domainRateInfo.renewal
    }
    
    const maintenanceMonthly = includeMaintenance.value && maintenanceType.value === 'monthly' ? 30 : 0
    const maintenanceAnnual = includeMaintenance.value 
      ? (maintenanceType.value === 'monthly' ? 360 : 250) 
      : 0

    const initialDevMin = baseDevMin + extraDevCost
    const initialDevMax = baseDevMax + extraDevCost
    
    let hostingAnnualCost = 0;
    if (periodKey === 'monthly') hostingAnnualCost = hostingRenewal * 12;
    else if (periodKey === 'annual') hostingAnnualCost = hostingRenewal;
    else if (periodKey === 'biannual') hostingAnnualCost = hostingRenewal / 2;
    
    const totalAnnualRecurring = domainCostRenewal + hostingAnnualCost + maintenanceAnnual
    
    const upfrontTotalMin = initialDevMin + hostingTotalUpfront + domainCostReg + maintenanceMonthly + (maintenanceType.value === 'annual' ? maintenanceAnnual : 0)
    const upfrontTotalMax = initialDevMax + hostingTotalUpfront + domainCostReg + maintenanceMonthly + (maintenanceType.value === 'annual' ? maintenanceAnnual : 0)

    return {
      model: 'sale',
      initialDevMin,
      initialDevMax,
      upfrontTotalMin,
      upfrontTotalMax,
      domainCostReg,
      domainCostRenewal,
      domainCostAnnual: domainCostRenewal,
      hostingMonthly: baseHostingPrice,
      hostingAnnual: hostingAnnualCost,
      hostingTotalUpfront,
      hostingRenewal,
      maintenanceMonthly,
      maintenanceAnnual,
      totalAnnualRecurring,
      totalMonthlyRecurring: (periodKey === 'monthly' ? hostingRenewal : hostingRenewal / (periodKey === 'annual' ? 12 : 24)) + maintenanceMonthly
    }
  } else {
    // SaaS Alquiler Model
    const saasConfig = selectedPlan.value.saas
    if (!saasConfig) return null
    const setupFee = saasConfig.setupFee
    const monthlyPrice = saasConfig.monthlyPrice
    
    const periodKey = (selectedHostingPeriod.value === 'monthly' || selectedHostingPeriod.value === 'annual')
      ? selectedHostingPeriod.value
      : 'annual'
      
    const hostingTotalUpfront = periodKey === 'annual' ? monthlyPrice * 10 : monthlyPrice
    const hostingMonthly = periodKey === 'annual' ? (monthlyPrice * 10) / 12 : monthlyPrice
    const hostingAnnualCost = periodKey === 'annual' ? monthlyPrice * 10 : monthlyPrice * 12

    const domainConfig = domainAdjustments[selectedDomain.value] || domainAdjustments['.com']
    const domainAdjustmentAnnual = domainConfig?.price ?? 0
    const domainCostReg = domainAdjustmentAnnual

    const maintenanceMonthly = includeMaintenance.value && maintenanceType.value === 'monthly' ? 30 : 0
    const maintenanceAnnual = includeMaintenance.value 
      ? (maintenanceType.value === 'monthly' ? 360 : 250) 
      : 0

    const initialDevMin = setupFee + extraDevCost
    const initialDevMax = setupFee + extraDevCost

    const totalAnnualRecurring = hostingAnnualCost + domainAdjustmentAnnual + maintenanceAnnual

    const upfrontTotalMin = initialDevMin + hostingTotalUpfront + domainCostReg + maintenanceMonthly + (maintenanceType.value === 'annual' ? maintenanceAnnual : 0)
    const upfrontTotalMax = initialDevMax + hostingTotalUpfront + domainCostReg + maintenanceMonthly + (maintenanceType.value === 'annual' ? maintenanceAnnual : 0)

    return {
      model: 'rent',
      initialDevMin,
      initialDevMax,
      upfrontTotalMin,
      upfrontTotalMax,
      domainCostReg: domainAdjustmentAnnual,
      domainCostRenewal: domainAdjustmentAnnual,
      domainCostAnnual: domainAdjustmentAnnual,
      hostingMonthly,
      hostingAnnual: hostingAnnualCost,
      hostingTotalUpfront,
      hostingRenewal: hostingMonthly,
      maintenanceMonthly,
      maintenanceAnnual,
      totalAnnualRecurring,
      totalMonthlyRecurring: hostingMonthly + (domainAdjustmentAnnual / 12) + maintenanceMonthly
    }
  }
})

// Generate WhatsApp quote link
const whatsappUrl = computed(() => {
  if (!selectedPlan.value || !calculatorResults.value) return '#'
  
  const planName = selectedPlan.value.shortName
  const calc = calculatorResults.value
  
  let msg = originProjectName.value
    ? `¡Hola! Vi la demo de *${originProjectName.value}* y quiero algo similar. Me interesa el *${planName}*.\n\n`
    : `¡Hola! Vengo de ver tu catálogo web y me interesa el *${planName}*.\n\n`
  msg += `*Detalles de mi Cotización:*\n`
  
  if (calc.model === 'sale') {
    let periodLabel = '1 mes'
    if (selectedHostingPeriod.value === 'annual') periodLabel = '1 año'
    if (selectedHostingPeriod.value === 'biannual') periodLabel = '2 años'

    msg += `* *Modalidad:* Venta Completa (Código Propio)\n`
    msg += `* *Hosting recomendado:* ${selectedPlan.value.pricing.hostingRec} (${periodLabel})\n`
    msg += `* *Costo Hosting:* $${calc.hostingMonthly.toFixed(2)} USD/mes (Inicial: $${calc.hostingTotalUpfront.toFixed(2)} USD)\n`
    msg += `* *Dominio seleccionado:* ${selectedDomain.value} (Registro: $${calc.domainCostReg.toFixed(2)} USD, Renovación: $${calc.domainCostRenewal.toFixed(2)} USD/año)\n`
  } else {
    msg += `* *Modalidad:* Alquiler del Sistema (SaaS)\n`
    msg += `* *Suscripción:* ${selectedHostingPeriod.value === 'annual' ? 'Anual' : 'Mensual'}\n`
    msg += `* *Costo de Alquiler:* $${calc.hostingTotalUpfront.toFixed(2)} USD/${selectedHostingPeriod.value === 'annual' ? 'año' : 'mes'}\n`
    msg += `* *Dominio seleccionado:* ${selectedDomain.value}${calc.domainCostReg > 0 ? ` (+ $${calc.domainCostReg.toFixed(2)} USD/año de ajuste)` : ' (Incluido)'}\n`
  }
  
  if (includeMaintenance.value) {
    msg += `* *Soporte Premium:* Sí (${maintenanceType.value === 'monthly' ? 'Mensual' : 'Anual'})\n`
  }
  if (customFeaturePrice.value > 0) {
    msg += `* *Funcionalidad extra:* ${customFeatureDescription.value || 'Personalizada'} (+${customFeaturePrice.value} USD)\n`
  }
  
  msg += `\n*Presupuesto Estimado:*\n`
  if (calc.model === 'sale') {
    msg += `* *Inversión Total Inicial:* De $${calc.upfrontTotalMin}${selectedPlan.value.pricing.devMax ? ` a $${calc.upfrontTotalMax}` : ' en adelante'} USD\n`
    msg += `* *Costo Recurrente (Hosting + Dominio):* $${calc.totalAnnualRecurring.toFixed(2)} USD/año\n\n`
  } else {
    msg += `* *Inversión Total Inicial:* De $${calc.upfrontTotalMin}${selectedPlan.value.pricing.devMax ? ` a $${calc.upfrontTotalMax}` : ' en adelante'} USD\n`
    msg += `* *Costo Recurrente de Alquiler:* $${calc.totalAnnualRecurring.toFixed(2)} USD/año\n\n`
  }
  msg += `¿Podemos agendar una breve reunión para detallar los requerimientos?`

  return `https://wa.me/59168787985?text=${encodeURIComponent(msg)}`
})

const printProposal = () => {
  if (typeof window !== 'undefined') window.print()
}
</script>


<template>
<section id="cotizador" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 border-t border-black/[0.04] dark:border-white/[0.04]">
      <div class="mb-12 no-print">
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
          <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          Cotizador de Soluciones Web
        </h2>
        <p class="text-slate-500 dark:text-slate-200  text-sm mt-2">Configura detalladamente el presupuesto de tu aplicación estimando licencias, dominios y soporte.</p>
      </div>

      <!-- Controls Row: Category and Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
        <div class="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-black/[0.04] dark:border-white/[0.04] self-start md:self-auto">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            :class="selectedCategory === cat.id
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
          >
            {{ cat.name }}
          </button>
        </div>

        <div class="relative flex-1 max-w-md w-full">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-200 ">
            <Search class="w-4 h-4" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por tecnología o tipo (tienda, blog, etc)..."
            class="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- PRINT TEMPLATE (Formal PDF Quote) -->
      <div class="hidden print:block w-full bg-white text-black font-sans max-w-4xl mx-auto py-4" v-if="selectedPlan && calculatorResults">
        
        <!-- Header -->
        <div class="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">COTIZACIÓN DE SERVICIOS WEB</h1>
            <p class="text-xs text-slate-500 dark:text-slate-200  mt-1">Documento generado automáticamente</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] text-slate-500 dark:text-slate-200  mt-1 font-bold">Fecha: {{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>

        <!-- Plan Details -->
        <div class="mb-6">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-200 uppercase tracking-widest mb-2">Detalles del Proyecto</h3>
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 class="text-xl font-bold text-slate-900 mb-1">{{ selectedPlan.shortName }}</h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 mb-3">{{ selectedPlan.description }}</p>
            <div class="flex gap-8 text-xs">
              <div><span class="font-bold text-slate-900">Modalidad:</span> {{ selectedModel === 'sale' ? 'Desarrollo a Medida (Propiedad Total)' : 'SaaS (Suscripción/Alquiler)' }}</div>
              <div><span class="font-bold text-slate-900">Tiempo Estimado:</span> {{ selectedPlan.pricing.timeRaw }}</div>
            </div>
          </div>
        </div>

        <!-- Breakdown Table -->
        <div class="mb-6">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-200 uppercase tracking-widest mb-2">Desglose de Inversión</h3>
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 dark:text-slate-200 ">
                <th class="py-2 font-semibold">Concepto</th>
                <th class="py-2 font-semibold text-right">Costo Estimado (USD)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="py-2.5">
                  <div class="font-bold text-slate-900">{{ selectedModel === 'sale' ? 'Desarrollo e Implementación Base' : 'Instalación y Setup Inicial' }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-200  mt-0.5">Pago único al iniciar el proyecto.</div>
                </td>
                <td class="py-2.5 text-right font-bold text-slate-900">${{ calculatorResults.initialDevMin }}</td>
              </tr>
              <tr v-if="customFeaturePrice > 0">
                <td class="py-2.5">
                  <div class="font-bold text-slate-900">Módulos Especiales (Adicional)</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-200  mt-0.5">{{ customFeatureDescription || 'Funcionalidad personalizada' }}</div>
                </td>
                <td class="py-2.5 text-right font-bold text-slate-900">+${{ customFeaturePrice }}</td>
              </tr>
              <tr>
                <td class="py-2.5">
                  <div class="font-bold text-slate-900">Servicio de Hosting / Alojamiento</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-200  mt-0.5">
                    {{ selectedModel === 'sale' ? `${selectedPlan.pricing.hostingRec} (Periodo: ${selectedHostingPeriod === '1' ? '1 mes' : selectedHostingPeriod + ' meses'})` : `Suscripción SaaS (${selectedHostingPeriod === 'annual' ? 'Anual' : 'Mensual'})` }}
                  </div>
                </td>
                <td class="py-2.5 text-right font-bold text-slate-900">${{ calculatorResults.hostingTotalUpfront.toFixed(2) }}</td>
              </tr>
              <tr>
                <td class="py-2.5">
                  <div class="font-bold text-slate-900">Registro de Dominio ({{ selectedDomain }})</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-200  mt-0.5">Costo inicial.</div>
                </td>
                <td class="py-2.5 text-right font-bold text-slate-900">{{ calculatorResults.domainCostReg > 0 ? `~$${calculatorResults.domainCostReg.toFixed(2)}` : 'Incluido' }}</td>
              </tr>
              <tr v-if="includeMaintenance">
                <td class="py-2.5">
                  <div class="font-bold text-slate-900">Soporte y Mantenimiento Premium</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-200  mt-0.5">Suscripción {{ maintenanceType === 'monthly' ? 'Mensual' : 'Anual' }}.</div>
                </td>
                <td class="py-2.5 text-right font-bold text-slate-900">${{ (maintenanceType === 'monthly' ? calculatorResults.maintenanceMonthly : calculatorResults.maintenanceAnnual).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="flex justify-end mb-4">
          <div class="w-full sm:w-2/3 md:w-1/2 bg-violet-50 p-4 rounded-xl border border-violet-100">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-slate-700">Inversión Total Inicial:</span>
              <span class="text-lg font-black text-violet-600"><span class="text-sm">De</span> ${{ calculatorResults.upfrontTotalMin.toFixed(2) }}<span v-if="selectedPlan.pricing.devMax"> <span class="text-sm">a</span> ${{ calculatorResults.upfrontTotalMax.toFixed(2) }}</span> USD</span>
            </div>
            <div class="flex justify-between items-center border-t border-violet-200/50 pt-2 mt-2">
              <span class="text-[10px] text-slate-500 dark:text-slate-200 ">Costo Recurrente Estimado:</span>
              <span class="text-xs font-bold text-slate-700">${{ calculatorResults.totalAnnualRecurring.toFixed(2) }} USD / año</span>
            </div>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-200">
          <p>Esta es una estimación referencial basada en los requerimientos estándar. Los costos finales pueden variar ligeramente.</p>
          <p class="mt-1">Para iniciar el proyecto o solicitar un análisis detallado, contáctanos indicando esta configuración.</p>
        </div>

      </div>

      <!-- Quoter Core Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:hidden">

        <!-- Left Side: Interactive Plans List (7 Columns) -->
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 no-print">
          <div v-if="filteredPlans.length === 0" class="text-center py-16 rounded-2xl border-2 border-dashed border-black/[0.04] dark:border-white/[0.04] p-8 bg-black/[0.015] dark:bg-slate-950/20">
            <component :is="LucideIcons.Search" class="w-12 h-12 mx-auto text-slate-400 dark:text-slate-200 dark:text-slate-600 dark:text-slate-300 mb-4" />
            <h3 class="text-lg font-bold text-slate-900 dark:text-white font-heading">No se encontraron soluciones</h3>
            <p class="text-xs text-slate-500 dark:text-slate-200  mt-2">Intenta cambiar el término de búsqueda o limpia los filtros.</p>
          </div>

          <div 
            v-for="plan in filteredPlans" 
            :key="plan.id"
            @click="selectPlan(plan)"
            class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border p-5 md:p-6"
            :class="selectedPlan?.id === plan.id
              ? 'bg-white/80 dark:bg-slate-950/60 border-violet-500/80 shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/30'
              : 'bg-black/[0.015] dark:bg-slate-950/20 border-black/[0.05] dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-950/40 shadow-sm'"
          >
            <div class="flex flex-col md:flex-row gap-5 items-start">

              <!-- Plan Icon & Tag -->
              <div class="flex md:flex-col items-center md:items-start gap-4">
                <div
                  class="p-3 rounded-xl transition-all"
                  :class="selectedPlan?.id === plan.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-slate-950 border border-black/[0.05] dark:border-white/[0.04] text-slate-500 dark:text-slate-200  group-hover:bg-violet-600 group-hover:text-white'"
                >
                  <component :is="LucideIcons[plan.icon] || LucideIcons.HelpCircle" class="w-6 h-6" />
                </div>

                <div class="block md:hidden">
                  <h3 class="text-base font-bold font-heading text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {{ plan.shortName }}
                  </h3>
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase">Plan {{ plan.id }}</span>
                </div>
              </div>

              <!-- Content Body -->
              <div class="flex-1 w-full">
                <!-- Header (Hidden on Mobile) -->
                <div class="hidden md:flex items-start justify-between">
                  <div>
                    <h3 class="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {{ plan.shortName }}
                    </h3>
                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-wider">Plan {{ plan.id }}</span>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] text-slate-500 dark:text-slate-200  font-bold uppercase">Desarrollo (Aprox.)</p>
                    <p class="text-base font-extrabold text-violet-600 dark:text-violet-400">{{ plan.pricing.devRaw }}</p>
                  </div>
                </div>

                <p class="mt-2 text-xs text-slate-500 dark:text-slate-200  leading-relaxed">{{ plan.description }}</p>

                <!-- Inclusions Lists -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-black/[0.05] dark:border-white/[0.04]">
                  <!-- Ideal para -->
                  <div>
                    <h4 class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <component :is="LucideIcons.Users" class="w-3.5 h-3.5" /> Ideal Para
                    </h4>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="(ideal, idx) in plan.idealFor"
                        :key="idx"
                        class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300  border border-black/[0.04] dark:border-white/[0.03]"
                      >
                        {{ ideal }}
                      </span>
                    </div>
                  </div>

                  <!-- Incluye -->
                  <div>
                    <h4 class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <component :is="LucideIcons.Layers" class="w-3.5 h-3.5" /> Incluye / Funciones
                    </h4>
                    <ul class="space-y-1">
                      <li
                        v-for="(inc, idx) in (isPlanExpanded(plan.id) ? plan.includes : plan.includes.slice(0, 4))"
                        :key="idx"
                        class="text-xs flex items-center gap-2 text-slate-500 dark:text-slate-200 "
                      >
                        <Check class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span class="truncate">{{ inc }}</span>
                      </li>
                      <li
                        v-if="plan.includes.length > 4"
                        @click.stop="togglePlanExpand(plan.id)"
                        class="text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-bold pl-5.5 cursor-pointer hover:underline inline-block mt-1 transition-all"
                      >
                        {{ isPlanExpanded(plan.id) ? '▲ Ver menos' : `+ ${plan.includes.length - 4} más...` }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Technologies -->
                <div v-if="plan.technologies" class="mt-4 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 flex flex-wrap gap-3 items-center justify-between text-xs">
                  <span class="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest font-heading">Tecnologías Recomendadas:</span>
                  <div class="flex gap-2">
                    <span class="font-semibold px-2 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300">Frontend: {{ plan.technologies.frontend }}</span>
                    <span class="font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Backend: {{ plan.technologies.backend }}</span>
                  </div>
                </div>

                <!-- Footer details for Mobile layout -->
                <div class="flex md:hidden items-center justify-between mt-5 pt-3 border-t border-black/[0.05] dark:border-white/[0.04]">
                  <div>
                    <span class="text-[9px] text-slate-500 dark:text-slate-200  font-semibold block">Desarrollo</span>
                    <span class="text-sm font-extrabold text-violet-600 dark:text-violet-400">{{ plan.pricing.devRaw }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-500 dark:text-slate-200  font-semibold block">Tiempo Aprox.</span>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300 ">{{ plan.pricing.timeRaw }}</span>
                  </div>
                </div>

              </div>
            </div>
            
            <!-- Glow Accent Line -->
            <div 
              class="absolute top-0 left-0 w-1 h-full bg-violet-600 transition-transform origin-left"
              :class="selectedPlan?.id === plan.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'"
            ></div>
          </div>
        </div>

        <!-- Right Side: Sticky Interactive Calculator (5 Columns) -->
        <aside id="quote-calculator" class="lg:col-span-5 xl:col-span-4 sticky top-24 flex flex-col gap-6 print:col-span-12 print:w-full">
          <div class="rounded-2xl bg-white/70 dark:bg-slate-950/40 border border-black/[0.06] dark:border-white/[0.06] p-5 md:p-6 backdrop-blur-md shadow-xl lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto print:max-h-none print:overflow-visible">
            <h3 class="text-base font-bold font-heading border-b border-black/[0.06] dark:border-white/[0.06] pb-3 flex items-center gap-2 text-slate-900 dark:text-white">
              <component :is="LucideIcons.Coins" class="w-5 h-5 text-violet-500" />
              <span>Cotizador de Soluciones</span>
            </h3>

            <!-- Selected plan summary inside card -->
            <div v-if="selectedPlan" class="mt-4 p-4 rounded-xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.05] dark:border-white/[0.04]">
              <span class="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest font-heading">Plan Configurando:</span>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-tight">{{ selectedPlan.shortName }}</h4>

              <div v-if="selectedModel === 'sale'" class="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-200 ">
                <span>Desarrollo Base:</span>
                <span class="font-extrabold text-slate-900 dark:text-white">{{ selectedPlan.pricing.devRaw }}</span>
              </div>
              <div v-else class="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-200 ">
                <span>Costo Instalación:</span>
                <span class="font-extrabold text-slate-900 dark:text-white">{{ selectedPlan.saas?.setupRaw }}</span>
              </div>
              <div class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-200 ">
                <span>Tiempo de Entrega:</span>
                <span class="font-semibold text-slate-600 dark:text-slate-300 ">{{ selectedPlan.pricing.timeRaw }}</span>
              </div>
              <div v-if="selectedModel === 'sale'" class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-200 ">
                <span>Hosting Sugerido:</span>
                <span class="font-semibold text-slate-600 dark:text-slate-300 ">{{ selectedPlan.pricing.hostingRec }}</span>
              </div>
              <div v-else class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-200 ">
                <span>Alquiler Mensual:</span>
                <span class="font-bold text-violet-600 dark:text-violet-400">{{ selectedPlan.saas?.monthlyRaw }}</span>
              </div>
            </div>

            <!-- Model Switcher (Sale vs SaaS) -->
            <div v-if="selectedPlan && selectedPlan.saas" class="mt-4 p-1 bg-slate-100 dark:bg-slate-950 border border-black/[0.05] dark:border-white/[0.04] rounded-xl grid grid-cols-2 gap-1 text-center">
              <button
                @click="selectedModel = 'sale'"
                class="py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                :class="selectedModel === 'sale'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
              >
                Comprar Sistema
              </button>
              <button
                @click="selectedModel = 'rent'"
                class="py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                :class="selectedModel === 'rent'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
              >
                Alquilar Sistema
              </button>
            </div>

            <div v-if="!selectedPlan" class="text-center py-6 text-slate-500 dark:text-slate-200 ">
              <component :is="LucideIcons.Info" class="w-8 h-8 mx-auto text-slate-400 dark:text-slate-200 dark:text-slate-600 dark:text-slate-300 mb-2" />
              <p class="text-xs">Selecciona un plan de la izquierda para comenzar a configurar.</p>
            </div>

            <!-- Calculator Inputs Fields -->
            <div v-if="selectedPlan" class="mt-6 space-y-5">

              <!-- Hosting period button grid -->
              <div>
                <div v-if="selectedModel === 'sale'">
                  <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Ciclo de Facturación (Hosting)</span>
                    <span class="text-slate-500 dark:text-slate-200 dark:text-slate-600 dark:text-slate-300 font-semibold lowercase">Namecheap</span>
                  </label>
                  <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-black/[0.05] dark:border-white/[0.04]">
                    <button
                      @click="selectedHostingPeriod = 'monthly'"
                      class="py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      :class="selectedHostingPeriod === 'monthly'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
                    >
                      1 Mes
                    </button>
                    <button
                      @click="selectedHostingPeriod = 'annual'"
                      class="py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center leading-tight"
                      :class="selectedHostingPeriod === 'annual'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
                    >
                      <span>1 Año</span>
                      <span class="text-[8px] uppercase tracking-wider" :class="selectedHostingPeriod === 'annual' ? 'text-emerald-300' : 'text-emerald-500'">Oferta</span>
                    </button>
                    <button
                      @click="selectedHostingPeriod = 'biannual'"
                      class="py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center leading-tight"
                      :class="selectedHostingPeriod === 'biannual'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
                    >
                      <span>2 Años</span>
                      <span class="text-[8px] uppercase tracking-wider" :class="selectedHostingPeriod === 'biannual' ? 'text-yellow-300' : 'text-yellow-500'">Mejor Precio</span>
                    </button>
                  </div>
                  
                  <div class="mt-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-black/[0.05] dark:border-white/[0.04] flex flex-col gap-2">
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-200 ">
                      <span>Pago Inicial (Hosting):</span>
                      <span class="font-bold text-violet-600 dark:text-violet-400 text-sm">${{ (calculatorResults?.hostingTotalUpfront || 0).toFixed(2) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-200 ">
                      <span>Precio Normal / Renovación:</span>
                      <span class="font-bold text-slate-900 dark:text-white text-sm">${{ (calculatorResults?.hostingRenewal || 0).toFixed(2) }}<span class="text-xs font-normal"> / <span v-if="selectedHostingPeriod === 'monthly'">mes</span><span v-else-if="selectedHostingPeriod === 'annual'">año</span><span v-else>2 años</span></span></span>
                    </div>
                    
                    <div v-if="calculatorResults?.hostingRenewal && calculatorResults?.hostingTotalUpfront && calculatorResults.hostingRenewal > calculatorResults.hostingTotalUpfront" 
                         class="mt-2 py-2 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center border border-emerald-500/20">
                      Ahorras ${{ (calculatorResults.hostingRenewal - calculatorResults.hostingTotalUpfront).toFixed(2) }} ({{ Math.round(((calculatorResults.hostingRenewal - calculatorResults.hostingTotalUpfront) / calculatorResults.hostingRenewal) * 100) }}%) en el primer pago
                    </div>
                  </div>
                </div>

                <div v-else>
                  <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2">
                    <span>Plan Suscripción SaaS</span>
                  </label>
                  <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-black/[0.05] dark:border-white/[0.04]">
                    <button
                      v-for="(info, key) in managedHostingRates"
                      :key="key"
                      @click="selectedHostingPeriod = key"
                      class="py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      :class="selectedHostingPeriod === key
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white'"
                    >
                      {{ info.label }}
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-200  flex items-center justify-between leading-snug">
                    <span>Alquiler &amp; Hosting: <strong>${{ (calculatorResults?.hostingTotalUpfront || 0).toFixed(2) }} USD / {{ selectedHostingPeriod === 'annual' ? 'año' : 'mes' }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Domain Extensions grid -->
              <div>
                <div v-if="selectedModel === 'sale'">
                  <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Extensión de Dominio</span>
                    <span class="text-slate-500 dark:text-slate-200 dark:text-slate-600 dark:text-slate-300 font-semibold lowercase">Precios Namecheap</span>
                  </label>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="(info, ext) in domainRates"
                      :key="ext"
                      @click="selectedDomain = ext"
                      class="py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center"
                      :class="selectedDomain === ext
                        ? 'border-violet-600 bg-violet-600/10 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-black/[0.05] dark:border-white/[0.04] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-200  hover:bg-slate-200 dark:hover:bg-slate-900'"
                    >
                      <span>{{ ext }}</span>
                      <span class="text-[9px] text-slate-500 dark:text-slate-200  font-semibold mt-0.5">~${{ info.reg.toFixed(0) }}</span>
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-200  flex items-center justify-between">
                    <span>Registro (1er año): <strong>~${{ (calculatorResults?.domainCostReg || 0).toFixed(2) }} USD</strong></span>
                    <span>Renovación: <strong>~${{ (calculatorResults?.domainCostRenewal || 0).toFixed(2) }} USD/año</strong></span>
                  </div>
                </div>

                <div v-else>
                  <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Extensión de Dominio</span>
                    <span class="text-slate-500 dark:text-slate-200 dark:text-slate-600 dark:text-slate-300 font-semibold lowercase">Incluidos en SaaS</span>
                  </label>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="(info, ext) in domainAdjustments"
                      :key="ext"
                      @click="selectedDomain = ext"
                      class="py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center"
                      :class="selectedDomain === ext
                        ? 'border-violet-600 bg-violet-600/10 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-black/[0.05] dark:border-white/[0.04] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-200  hover:bg-slate-200 dark:hover:bg-slate-900'"
                    >
                      <span>{{ ext }}</span>
                      <span class="text-[9px] text-slate-500 dark:text-slate-200  font-semibold mt-0.5">
                        {{ info.price === 0 ? 'Incluido' : `+$${info.price.toFixed(0)}` }}
                      </span>
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-200 ">
                    <span>Ajuste Dominio: <strong>{{ (calculatorResults?.domainCostReg || 0) > 0 ? `+~$${(calculatorResults?.domainCostReg || 0).toFixed(2)} USD/año` : '$0.00 USD (Incluido)' }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Maintenance packages -->
              <div>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="includeMaintenance"
                    class="w-4 h-4 rounded text-violet-600 border-black/[0.08] dark:border-white/[0.08] bg-slate-100 dark:bg-slate-950 focus:ring-violet-500 cursor-pointer"
                  />
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest">Soporte y Mantenimiento</span>
                </label>

                <div v-if="includeMaintenance" class="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-black/[0.05] dark:border-white/[0.04] space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="maintenanceType = 'monthly'"
                      class="py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer"
                      :class="maintenanceType === 'monthly'
                        ? 'border-violet-600 bg-violet-600/10 text-violet-600 dark:text-violet-400'
                        : 'border-black/[0.05] dark:border-white/[0.04] bg-white/60 dark:bg-slate-900/40 text-slate-500 dark:text-slate-200 '"
                    >
                      Mensual (30 USD/m)
                    </button>
                    <button
                      @click="maintenanceType = 'annual'"
                      class="py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer"
                      :class="maintenanceType === 'annual'
                        ? 'border-violet-600 bg-violet-600/10 text-violet-600 dark:text-violet-400'
                        : 'border-black/[0.05] dark:border-white/[0.04] bg-white/60 dark:bg-slate-900/40 text-slate-500 dark:text-slate-200 '"
                    >
                      Anual (250 USD/año)
                    </button>
                  </div>
                  <p class="text-[9px] text-slate-500 dark:text-slate-200  leading-tight">
                    Monitorea servidores, backups semanales, actualizaciones del framework y soporte prioritario de incidencias.
                  </p>
                </div>
              </div>

              <!-- Custom additions estimator -->
              <div class="border-t border-black/[0.05] dark:border-white/[0.04] pt-4 space-y-2">
                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-widest">Agregar Módulo Especial</label>
                <input
                  type="text"
                  v-model="customFeatureDescription"
                  placeholder="Ej. API Facturación Impuestos, Pasarela de Pago"
                  class="w-full px-3 py-2 text-xs rounded-xl border border-black/[0.05] dark:border-white/[0.04] bg-slate-100 dark:bg-slate-950 text-slate-700  focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-400 dark:placeholder-slate-400"
                />
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 dark:text-slate-200 ">Costo:</span>
                  <div class="relative flex-1 max-w-[120px]">
                    <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-500 dark:text-slate-200 ">$</span>
                    <input
                      type="number"
                      v-model.number="customFeaturePrice"
                      min="0"
                      class="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-black/[0.05] dark:border-white/[0.04] bg-slate-100 dark:bg-slate-950 text-slate-700  focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <span class="text-xs text-slate-500 dark:text-slate-200 ">USD</span>
                </div>
              </div>

              <!-- Calculator economic results output card -->
              <div v-if="calculatorResults" class="pt-4 border-t border-black/[0.05] dark:border-white/[0.04] space-y-4">

                <!-- initial Dev Dev/Setup investment -->
                <div>
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-200  uppercase tracking-wider block">Inversión Total Inicial:</span>
                  <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    <span class="text-lg font-bold text-slate-500 dark:text-slate-200 ">De</span> ${{ calculatorResults.upfrontTotalMin.toFixed(0) }}
                    <span v-if="selectedPlan.pricing.devMax"> <span class="text-lg font-bold text-slate-500 dark:text-slate-200 ">a</span> ${{ calculatorResults.upfrontTotalMax.toFixed(0) }}</span>
                    <span v-else class="text-xs font-semibold text-slate-500 dark:text-slate-200  ml-1"> USD en adelante</span>
                  </span>
                </div>

                <!-- Recurrent Cost summary Box -->
                <div class="p-3.5 rounded-xl bg-violet-600/5 border border-violet-500/10 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Recurrente Anual Estimado:</span>
                    <span class="text-sm font-extrabold text-violet-600 dark:text-violet-400">${{ (calculatorResults?.totalAnnualRecurring || 0).toFixed(2) }} USD/año</span>
                  </div>
                  <div class="text-[9px] text-slate-500 dark:text-slate-200  space-y-1 leading-snug">
                    <div class="flex justify-between">
                      <span v-if="selectedModel === 'sale'">Hosting ({{ selectedPlan.pricing.hostingRec }} - {{ selectedHostingPeriod === 'monthly' ? '1 Mes' : selectedHostingPeriod === 'annual' ? '1 Año' : '2 Años' }}):</span>
                      <span v-else>Alquiler SaaS ({{ selectedHostingPeriod === 'annual' ? 'Anual' : 'Mensual' }}):</span>
                      <span>~${{ (calculatorResults?.hostingTotalUpfront || 0).toFixed(2) }} USD</span>
                    </div>
                    <div v-if="(calculatorResults?.domainCostAnnual || 0) > 0 || selectedModel === 'sale'" class="flex justify-between">
                      <span v-if="selectedModel === 'sale'">Dominio ({{ selectedDomain }}):</span>
                      <span v-else>Ajuste Dominio ({{ selectedDomain }}):</span>
                      <span>~${{ (calculatorResults?.domainCostAnnual || 0) }} USD</span>
                    </div>
                    <div v-if="includeMaintenance" class="flex justify-between">
                      <span>Mantenimiento y Soporte ({{ maintenanceType === 'monthly' ? 'm' : 'a' }}):</span>
                      <span>~${{ (calculatorResults?.maintenanceAnnual || 0) }} USD</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- CTA Quoter buttons -->
              <div class="space-y-2.5 pt-2">
                <a 
                  :href="whatsappUrl" 
                  target="_blank"
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] rounded-xl transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  <component :is="LucideIcons.MessageSquare" class="w-4 h-4 shrink-0" />
                  <span>Enviar Cotización a WhatsApp</span>
                </a>
                <button
                  @click="printProposal"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold text-[10px] text-slate-500 dark:text-slate-200  hover:text-slate-900 dark:hover:text-white border border-black/[0.08] dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                >
                  <Printer class="w-3.5 h-3.5 shrink-0" />
                  <span>Guardar como PDF / Imprimir</span>
                </button>
              </div>

            </div>
          </div>
        </aside>

      </div>
    </section>
</template>
