<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { plans, generalFeatures, additionalCosts, contractingPolicies, contractingPoliciesSaaS, managedHostingRates, domainAdjustments, hostingRates, domainRates } from './plansData.js'
import * as Icons from '@lucide/vue'

// Icons to import explicitly for other parts of UI
import {
  Sun,
  Moon,
  Search,
  Check,
  CheckCircle,
  HelpCircle,
  FileText,
  Mail,
  Printer,
  ChevronRight,
  ChevronDown,
  Info,
  DollarSign,
  Calendar,
  AlertCircle,
  X
} from '@lucide/vue'

// State variables
const isDark = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedPlan = ref(null)

// Calculator selections
const selectedHostingPeriod = ref('48') // Default matching 'sale' model
const selectedDomain = ref('.com') // '.com' or '.com.bo'
const includeMaintenance = ref(false)
const maintenanceType = ref('monthly') // 'monthly' or 'annual'
const customFeaturePrice = ref(0)
const customFeatureDescription = ref('')

// Model Selection ('sale' = Venta Completa, 'rent' = Alquiler SaaS)
const selectedModel = ref('sale')

// Force 'sale' model if plan doesn't have SaaS option (plans 1 to 6)
watch(selectedPlan, (newPlan) => {
  if (!newPlan) return
  if (!newPlan.saas) {
    selectedModel.value = 'sale'
  }
})

// Handle contract periods adjustments when model changes
watch(selectedModel, (newModel) => {
  if (newModel === 'sale') {
    selectedHostingPeriod.value = '48'
  } else {
    selectedHostingPeriod.value = 'annual'
  }
})

// Expanded plans tracker for "Incluye" section
const expandedPlans = ref(new Set())
const togglePlanExpand = (planId) => {
  if (expandedPlans.value.has(planId)) {
    expandedPlans.value.delete(planId)
  } else {
    expandedPlans.value.add(planId)
  }
}
const isPlanExpanded = (planId) => {
  return expandedPlans.value.has(planId)
}

// Initialize with the first plan
onMounted(() => {
  selectedPlan.value = plans[0]
  applyTheme()
  
  // Strip dark mode during printing for ink-saving white background
  window.addEventListener('beforeprint', () => {
    document.documentElement.classList.remove('dark')
  })
  window.addEventListener('afterprint', () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    }
  })
})

// Toggle Dark Theme
const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Categories definitions
const categories = [
  { id: 'all', name: 'Todos los Planes' },
  { id: 'basic', name: 'Básicos' },
  { id: 'medium', name: 'Corporativos / Medios' },
  { id: 'advanced', name: 'Sistemas / Avanzados' }
]

// Filter plans based on search query and category tab
const filteredPlans = computed(() => {
  return plans.filter(plan => {
    // Category match
    const categoryMatch = selectedCategory.value === 'all' || plan.category === selectedCategory.value

    // Search query match
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return categoryMatch

    const nameMatch = plan.name.toLowerCase().includes(query)
    const descMatch = plan.description.toLowerCase().includes(query)
    const idealMatch = plan.idealFor.some(item => item.toLowerCase().includes(query))
    const includesMatch = plan.includes.some(item => item.toLowerCase().includes(query))

    return categoryMatch && (nameMatch || descMatch || idealMatch || includesMatch)
  })
})

// Select a plan for customization
const selectPlan = (plan) => {
  selectedPlan.value = plan
  // Reset calculator sub-options to defaults matching the plan
  customFeaturePrice.value = 0
  customFeatureDescription.value = ''
  includeMaintenance.value = false
  
  // Smooth scroll to calculator on mobile devices
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      const calcEl = document.getElementById('quote-calculator')
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 80)
  }
}

// Dynamic calculations based on selected plan and options
const calculatorResults = computed(() => {
  if (!selectedPlan.value) return null

  // Plan base price
  const baseDevMin = selectedPlan.value.pricing.devMin
  const baseDevMax = selectedPlan.value.pricing.devMax || baseDevMin
  
  const extraDevCost = customFeaturePrice.value || 0

  if (selectedModel.value === 'sale') {
    // VENTA COMPLETA MODEL
    const baseDevMin = selectedPlan.value.pricing.devMin
    const baseDevMax = selectedPlan.value.pricing.devMax || baseDevMin
    
    const rec = selectedPlan.value.pricing.hostingRec
    let baseHostingPrice = selectedPlan.value.pricing.hostingPrice
    
    // Guard against 'annual' / 'monthly' period keys in 'sale' model
    const parsedPeriod = parseInt(selectedHostingPeriod.value)
    const periodMonths = isNaN(parsedPeriod) ? 48 : parsedPeriod
    const periodKey = isNaN(parsedPeriod) ? '48' : selectedHostingPeriod.value
    
    let hostingTotalUpfront = baseHostingPrice * (periodKey === '1' ? 1 : periodMonths)
    let hostingRenewal = baseHostingPrice
    
    if (hostingRates[rec] && hostingRates[rec][periodKey]) {
      baseHostingPrice = hostingRates[rec][periodKey].price
      hostingTotalUpfront = hostingRates[rec][periodKey].total
      hostingRenewal = hostingRates[rec][periodKey].renewal
    }
    
    let domainCostReg = 15
    let domainCostRenewal = 15
    if (domainRates[selectedDomain.value]) {
      domainCostReg = domainRates[selectedDomain.value].reg
      domainCostRenewal = domainRates[selectedDomain.value].renewal
    }
    
    const maintenanceMonthly = includeMaintenance.value && maintenanceType.value === 'monthly' ? 30 : 0
    const maintenanceAnnual = includeMaintenance.value 
      ? (maintenanceType.value === 'monthly' ? 360 : 250) 
      : 0

    const initialDevMin = baseDevMin + extraDevCost
    const initialDevMax = baseDevMax + extraDevCost
    const hostingAnnualCost = baseHostingPrice * 12
    const totalAnnualRecurring = domainCostRenewal + hostingAnnualCost + maintenanceAnnual

    return {
      model: 'sale',
      initialDevMin,
      initialDevMax,
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
      totalMonthlyRecurring: baseHostingPrice + maintenanceMonthly
    }
  } else {
    // ALQUILER (SaaS) MODEL
    const setupFee = selectedPlan.value.saas.setupFee
    const monthlyPrice = selectedPlan.value.saas.monthlyPrice
    
    // Guard against numeric period keys in 'rent' model (e.g. '48', '24', etc.)
    const periodKey = (selectedHostingPeriod.value === 'monthly' || selectedHostingPeriod.value === 'annual')
      ? selectedHostingPeriod.value
      : 'annual'
      
    const hostingTotalUpfront = periodKey === 'annual' ? monthlyPrice * 10 : monthlyPrice
    const hostingMonthly = periodKey === 'annual' ? (monthlyPrice * 10) / 12 : monthlyPrice
    const hostingAnnualCost = periodKey === 'annual' ? monthlyPrice * 10 : monthlyPrice * 12

    const domainConfig = domainAdjustments[selectedDomain.value] || domainAdjustments['.com']
    const domainAdjustmentAnnual = domainConfig.price

    const maintenanceMonthly = includeMaintenance.value && maintenanceType.value === 'monthly' ? 30 : 0
    const maintenanceAnnual = includeMaintenance.value 
      ? (maintenanceType.value === 'monthly' ? 360 : 250) 
      : 0

    const initialDevMin = setupFee + extraDevCost
    const initialDevMax = setupFee + extraDevCost

    const totalAnnualRecurring = hostingAnnualCost + domainAdjustmentAnnual + maintenanceAnnual

    return {
      model: 'rent',
      initialDevMin,
      initialDevMax,
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
  
  let msg = `¡Hola! Vengo de ver tu catálogo web y me interesa el *${planName}*.\n\n`
  msg += `*Detalles de mi Cotización:*\n`
  
  if (calc.model === 'sale') {
    msg += `* *Modalidad:* Venta Completa (Código Propio)\n`
    msg += `* *Hosting recomendado:* ${selectedPlan.value.pricing.hostingRec} (${selectedHostingPeriod.value === '1' ? '1 mes' : `${selectedHostingPeriod.value} meses`})\n`
    msg += `* *Costo Hosting:* $${calc.hostingMonthly.toFixed(2)} USD/mes (Inicial: $${calc.hostingTotalUpfront.toFixed(2)} USD)\n`
    msg += `* *Dominio seleccionado:* ${selectedDomain.value} (Registro: $${calc.domainCostReg.toFixed(2)} USD, Renovación: $${calc.domainCostRenewal.toFixed(2)} USD/año)\n`
  } else {
    msg += `* *Modalidad:* Alquiler del Sistema (SaaS)\n`
    msg += `* *Suscripción:* ${selectedHostingPeriod.value === 'annual' ? 'Anual' : 'Mensual'}\n`
    msg += `* *Costo de Alquiler:* $${calc.hostingTotalUpfront.toFixed(2)} USD/${selectedHostingPeriod.value === 'annual' ? 'año' : 'mes'} (Aprox.)\n`
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
    msg += `* *Desarrollo Inicial (Pago Único Aprox.):* ~${calc.initialDevMin}${selectedPlan.value.pricing.devMax ? ` - ~${calc.initialDevMax}` : ' en adelante'} USD\n`
    msg += `* *Costo Recurrente (Hosting + Dominio Aprox.):* ~${calc.totalAnnualRecurring.toFixed(2)} USD/año\n\n`
  } else {
    msg += `* *Costo Inicial de Instalación (Aprox.):* ~${calc.initialDevMin} USD\n`
    msg += `* *Costo Recurrente de Alquiler (Aprox.):* ~${calc.totalAnnualRecurring.toFixed(2)} USD/año\n\n`
  }
  msg += `¿Podemos agendar una breve reunión para detallar los requerimientos?`

  return `https://wa.me/59168787985?text=${encodeURIComponent(msg)}` // Replace with user's WhatsApp number or standard link
})

// Trigger Browser Print Dialog
const printProposal = () => {
  window.print()
}
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 font-sans text-slate-800 bg-slate-50 dark:text-slate-200 dark:bg-slate-950">
    
    <!-- HEADER (no-print) -->
    <header class="sticky top-0 z-40 w-full no-print backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <img 
            src="./assets/novabyte_icon.png" 
            class="h-9 w-9 object-contain" 
            alt="Novabyte" 
          />
          <div class="flex flex-col">
            <span class="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white leading-none font-display">
              NOVABYTE
            </span>
            <span class="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-0.5">
              SOFTWARE SOLUTIONS
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- WhatsApp Floating Contact Button -->
          <a :href="whatsappUrl" target="_blank" class="hidden md:flex items-center gap-2 px-4 h-10 text-sm font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all">
            <component :is="Icons.MessageSquare" class="w-4 h-4" />
            <span>Consultar por WhatsApp</span>
          </a>

          <!-- Theme Toggle -->
          <button @click="toggleTheme" class="p-2.5 rounded-full border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer text-slate-600 dark:text-slate-400" title="Cambiar tema">
            <Sun v-if="!isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- HERO SECTION (no-print) -->
    <section class="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center no-print overflow-hidden">
      <!-- Glow Gradients background -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl -z-10"></div>
      <div class="absolute top-1/3 left-1/3 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl -z-10"></div>

      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight max-w-4xl mx-auto leading-tight">
        Lleva tu negocio al siguiente nivel con una <span class="bg-gradient-to-r from-brand-500 via-accent-500 to-brand-600 bg-clip-text text-transparent">Presencia Web</span> de impacto.
      </h2>
      
      <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Compara nuestros planes de desarrollo web, personaliza los servicios dinámicamente y obtén una cotización estimada al instante adaptada a tus necesidades reales.
      </p>
    </section>

    <!-- GENERAL INCLUSIONS TICKER (no-print) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 no-print">
      <div class="relative rounded-2xl overflow-hidden glass-panel-light dark:glass-panel glow-teal p-6 md:p-8">
        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
        
        <h3 class="text-sm font-semibold tracking-widest text-brand-600 dark:text-brand-500 uppercase mb-6 flex items-center gap-2 justify-center md:justify-start">
          <CheckCircle class="w-4 h-4" /> Todos nuestros proyectos incluyen sin costo adicional:
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(feature, idx) in generalFeatures" :key="idx" class="flex gap-3 items-start p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30">
            <span class="p-1 rounded bg-emerald-500/10 text-emerald-500 shrink-0">
              <Check class="w-4 h-4 stroke-[3]" />
            </span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{{ feature }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SEARCH & FILTER INTERACTION (no-print) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 no-print">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300/30 dark:border-slate-800/80 self-start md:self-auto">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            :class="selectedCategory === cat.id 
              ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md w-full">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search class="w-4 h-4" />
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por tecnología, sector (ej. tienda, hotel)..."
            class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300/50 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm placeholder-slate-400"
          />
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>

    <!-- CORE CONTENT GRID (no-print) -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 no-print">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Side: Plans Grid (7 Columns) -->
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div v-if="filteredPlans.length === 0" class="text-center py-16 rounded-2xl border-2 border-dashed border-slate-300/40 dark:border-slate-800/40 p-8">
            <component :is="Icons.SearchCode" class="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 class="text-lg font-bold">No se encontraron soluciones</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Intenta cambiar el término de búsqueda o limpia los filtros.</p>
          </div>

          <div 
            v-for="plan in filteredPlans" 
            :key="plan.id"
            @click="selectPlan(plan)"
            class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border p-5 md:p-6"
            :class="selectedPlan?.id === plan.id 
              ? 'bg-white dark:bg-slate-900 border-brand-500/80 shadow-md shadow-brand-500/5 glow-teal ring-1 ring-brand-500/30' 
              : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-white dark:hover:bg-slate-900/60 shadow-sm'"
          >
            <!-- Background highlight pattern -->
            <div 
              class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              :class="selectedPlan?.id === plan.id 
                ? 'from-brand-500/10 to-transparent' 
                : 'from-accent-500/5 to-transparent'"
            ></div>

            <div class="flex flex-col md:flex-row gap-5 items-start">
              
              <!-- Plan Icon & Metadata -->
              <div class="flex md:flex-col items-center md:items-start gap-4">
                <div 
                  class="p-3 rounded-xl transition-all"
                  :class="selectedPlan?.id === plan.id 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-accent-500 group-hover:text-white'"
                >
                  <component :is="Icons[plan.icon] || Icons.HelpCircle" class="w-6 h-6" />
                </div>
                
                <div class="block md:hidden">
                  <h3 class="text-lg font-bold font-display group-hover:text-brand-500 dark:group-hover:text-brand-500 transition-colors">
                    {{ plan.shortName }}
                  </h3>
                  <span class="text-xs font-semibold text-slate-400">Plan {{ plan.id }}</span>
                </div>
              </div>

              <!-- Content Body -->
              <div class="flex-1 w-full">
                <!-- Header (Hidden on Mobile) -->
                <div class="hidden md:flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-bold font-display group-hover:text-brand-500 dark:group-hover:text-brand-500 transition-colors">
                      {{ plan.shortName }}
                    </h3>
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan {{ plan.id }}</span>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-slate-400 font-semibold">Desarrollo (Aprox.)</p>
                    <p class="text-lg font-extrabold text-slate-900 dark:text-white">
                      ~{{ plan.pricing.devRaw }}
                    </p>
                  </div>
                </div>

                <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {{ plan.description }}
                </p>

                <!-- Plan features lists in Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <!-- Ideal para -->
                  <div>
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <component :is="Icons.Users" class="w-3.5 h-3.5" /> Ideal Para
                    </h4>
                    <div class="flex flex-wrap gap-1.5">
                      <span 
                        v-for="(ideal, idx) in plan.idealFor" 
                        :key="idx"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {{ ideal }}
                      </span>
                    </div>
                  </div>

                  <!-- Incluye -->
                  <div>
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <component :is="Icons.Layers" class="w-3.5 h-3.5" /> Incluye / Funciones
                    </h4>
                    <ul class="space-y-1">
                      <li 
                        v-for="(inc, idx) in (isPlanExpanded(plan.id) ? plan.includes : plan.includes.slice(0, 4))" 
                        :key="idx" 
                        class="text-xs flex items-center gap-2 text-slate-600 dark:text-slate-400 animate-fade-in"
                      >
                        <Check class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span class="truncate">{{ inc }}</span>
                      </li>
                      <li 
                        v-if="plan.includes.length > 4" 
                        @click.stop="togglePlanExpand(plan.id)"
                        class="text-[10px] text-brand-500 hover:text-brand-400 font-bold pl-5 cursor-pointer hover:underline inline-block mt-1 transition-all"
                      >
                        {{ isPlanExpanded(plan.id) ? '▲ Ver menos' : `+ ${plan.includes.length - 4} más...` }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Technologies used for complex plans -->
                <div v-if="plan.technologies" class="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex flex-wrap gap-3 items-center justify-between">
                  <span class="text-[11px] font-bold text-accent-500 uppercase tracking-widest">Tecnologías recomendadas:</span>
                  <div class="flex gap-2">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-accent-500">Frontend: {{ plan.technologies.frontend }}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Backend: {{ plan.technologies.backend }}</span>
                  </div>
                </div>

                <!-- Footer details for Mobile layout -->
                <div class="flex md:hidden items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span class="text-[10px] text-slate-400 font-semibold block">Desarrollo (Aprox.)</span>
                    <span class="text-base font-extrabold text-slate-900 dark:text-white">~{{ plan.pricing.devRaw }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 font-semibold block">Tiempo aprox</span>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ plan.pricing.timeRaw }}</span>
                  </div>
                </div>

              </div>
            </div>
            
            <!-- Quick select ribbon -->
            <div 
              class="absolute top-0 left-0 w-1 h-full bg-brand-500 transition-transform origin-left"
              :class="selectedPlan?.id === plan.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'"
            ></div>
          </div>
        </div>

        <!-- Right Side: Interactive Quote Calculator (5 Columns) -->
        <aside id="quote-calculator" class="lg:col-span-5 xl:col-span-4 sticky top-20 flex flex-col gap-6">
          <div class="rounded-2xl glass-panel-light dark:glass-panel border-2 border-brand-500/20 dark:border-brand-500/10 p-5 md:p-6 glow-teal max-h-[calc(100vh-110px)] overflow-y-auto">
            <h3 class="text-lg font-bold font-display border-b border-slate-200/50 dark:border-slate-800/80 pb-3 flex items-center gap-2">
              <component :is="Icons.Coins" class="w-5 h-5 text-brand-500" />
              <span>Cotizador de Soluciones</span>
            </h3>

            <!-- Selected plan summary -->
            <div v-if="selectedPlan" class="mt-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <span class="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Plan Configurado:</span>
              <h4 class="text-base font-bold text-slate-800 dark:text-white mt-1">{{ selectedPlan.shortName }}</h4>
              
              <div v-if="selectedModel === 'sale'" class="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Desarrollo Base (Aprox.):</span>
                <span class="font-extrabold text-slate-900 dark:text-white">~{{ selectedPlan.pricing.devRaw }}</span>
              </div>
              <div v-else class="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Costo Instalación (Aprox.):</span>
                <span class="font-extrabold text-slate-900 dark:text-white">~{{ selectedPlan.saas.setupRaw }}</span>
              </div>
              <div class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Tiempo de entrega:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ selectedPlan.pricing.timeRaw }}</span>
              </div>
              <div v-if="selectedModel === 'sale'" class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Hosting Sugerido:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ selectedPlan.pricing.hostingRec }}</span>
              </div>
              <div v-else class="flex justify-between items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Suscripción de Alquiler:</span>
                <span class="font-bold text-brand-500">~{{ selectedPlan.saas.monthlyRaw }}</span>
              </div>
            </div>

            <!-- Model Selector for Systems (Plans 7-10) -->
            <div v-if="selectedPlan && selectedPlan.saas" class="mt-4 p-1 bg-slate-200/50 dark:bg-slate-900/60 rounded-xl border border-slate-300/30 dark:border-slate-800/40 grid grid-cols-2 gap-1 text-center">
              <button 
                @click="selectedModel = 'sale'"
                class="py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                :class="selectedModel === 'sale' 
                  ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                Comprar Sistema (Venta)
              </button>
              <button 
                @click="selectedModel = 'rent'"
                class="py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                :class="selectedModel === 'rent' 
                  ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                Alquilar Sistema (SaaS)
              </button>
            </div>
            
            <div v-if="!selectedPlan" class="text-center py-6 text-slate-400">
              <component :is="Icons.Info" class="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p class="text-sm">Selecciona un plan de la izquierda para comenzar a personalizar.</p>
            </div>

            <!-- Configuration fields -->
            <div v-if="selectedPlan" class="mt-6 space-y-5">

              <!-- Hosting/Suscripción Selector -->
              <div>
                <div v-if="selectedModel === 'sale'">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Periodo Contrato Hosting</span>
                    <span class="text-[10px] text-slate-400">A mayor plazo, más descuento</span>
                  </label>
                  <div class="grid grid-cols-4 gap-1 bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-300/30 dark:border-slate-800/40">
                    <button 
                      v-for="period in ['48', '24', '12', '1']" 
                      :key="period"
                      @click="selectedHostingPeriod = period"
                      class="py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      :class="selectedHostingPeriod === period 
                        ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                    >
                      {{ period === '1' ? '1 mes' : `${period} meses` }}
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Hosting recomendado ({{ selectedPlan.pricing.hostingRec }}): <strong>~${{ calculatorResults?.hostingMonthly.toFixed(2) }} USD/mes</strong></span>
                    <span>Pago inicial: <strong>~${{ calculatorResults?.hostingTotalUpfront.toFixed(2) }} USD</strong></span>
                  </div>
                  <div class="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    * Tarifa de renovación posterior: ~${{ calculatorResults?.hostingRenewal.toFixed(2) }} USD/mes
                  </div>
                </div>

                <div v-else>
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Plan de Alojamiento Gestionado</span>
                    <span class="text-[10px] text-slate-400">Todo incluido & Configurado</span>
                  </label>
                  <div class="grid grid-cols-2 gap-1 bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-300/30 dark:border-slate-800/40">
                    <button 
                      v-for="(info, key) in managedHostingRates" 
                      :key="key"
                      @click="selectedHostingPeriod = key"
                      class="py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      :class="selectedHostingPeriod === key 
                        ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                    >
                      {{ info.label }}
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Costo Alquiler & Hosting: <strong>~${{ calculatorResults?.hostingTotalUpfront.toFixed(2) }} USD / {{ selectedHostingPeriod === 'annual' ? 'año' : 'mes' }}</strong></span>
                  </div>
                  <div class="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    * Incluye hosting SSD, base de datos central, certificado SSL (HTTPS), backups semanales y registro/renovación del dominio (si es estándar).
                  </div>
                </div>
              </div>
              
              <!-- Domain selector -->
              <div>
                <div v-if="selectedModel === 'sale'">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Extensión del Dominio</span>
                    <span class="text-[10px] text-slate-400">Precios Namecheap</span>
                  </label>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button 
                      v-for="(info, ext) in domainRates" 
                      :key="ext"
                      @click="selectedDomain = ext"
                      class="py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center"
                      :class="selectedDomain === ext 
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500 dark:text-brand-500 shadow-sm' 
                        : 'border-slate-300/40 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/35'"
                    >
                      <span>{{ ext }}</span>
                      <span class="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">~${{ info.reg.toFixed(2) }}</span>
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Registro (1er año Aprox.): <strong>~${{ calculatorResults?.domainCostReg.toFixed(2) }} USD</strong></span>
                    <span>Renovación (Aprox.): <strong>~${{ calculatorResults?.domainCostRenewal.toFixed(2) }} USD/año</strong></span>
                  </div>
                </div>

                <div v-else>
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Extensión del Dominio</span>
                    <span class="text-[10px] text-slate-400">Hosting Gestionado</span>
                  </label>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button 
                      v-for="(info, ext) in domainAdjustments" 
                      :key="ext"
                      @click="selectedDomain = ext"
                      class="py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center"
                      :class="selectedDomain === ext 
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500 dark:text-brand-500 shadow-sm' 
                        : 'border-slate-300/40 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/35'"
                    >
                      <span>{{ ext }}</span>
                      <span class="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                        {{ info.price === 0 ? 'Incluido' : `+$${info.price.toFixed(0)}/año` }}
                      </span>
                    </button>
                  </div>
                  <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span v-if="calculatorResults?.domainCostReg > 0">Costo adicional de dominio: <strong>+~${{ calculatorResults?.domainCostReg.toFixed(2) }} USD/año (Aprox.)</strong></span>
                    <span v-else>Costo adicional de dominio: <strong>$0.00 USD (Incluido)</strong></span>
                  </div>
                </div>
              </div>

              <!-- Maintenance Packages -->
              <div>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    v-model="includeMaintenance"
                    class="w-4 h-4 rounded text-brand-500 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-brand-500"
                  />
                  <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Soporte y Mantenimiento</span>
                </label>
                
                <div v-if="includeMaintenance" class="mt-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      @click="maintenanceType = 'monthly'"
                      class="py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer"
                      :class="maintenanceType === 'monthly' 
                        ? 'border-accent-500 bg-accent-500/10 text-accent-500' 
                        : 'border-slate-300/40 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-slate-400'"
                    >
                      Mensual (~30 USD/mes Aprox.)
                    </button>
                    <button 
                      @click="maintenanceType = 'annual'"
                      class="py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer"
                      :class="maintenanceType === 'annual' 
                        ? 'border-accent-500 bg-accent-500/10 text-accent-500' 
                        : 'border-slate-300/40 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-slate-400'"
                    >
                      Anual (~250 USD/año Aprox.)
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400 leading-tight">
                    Incluye monitoreo del servidor, copias de seguridad de la base de datos, actualizaciones de seguridad y soporte para incidencias técnicas.
                  </p>
                </div>
              </div>

              <!-- Custom additions estimator -->
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Agregar Funcionalidad Adicional
                </label>
                <input 
                  type="text" 
                  v-model="customFeatureDescription"
                  placeholder="Ej. Integración con ERP Facturación, login con Google..."
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-brand-500 mb-2 placeholder-slate-500"
                />
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400">Presupuesto Extra:</span>
                  <div class="relative flex-1 max-w-[120px]">
                    <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">$</span>
                    <input 
                      type="number" 
                      v-model.number="customFeaturePrice" 
                      min="0"
                      class="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-slate-300/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <span class="text-xs text-slate-400">USD</span>
                </div>
              </div>

              <!-- Dynamic calculations outputs -->
              <div v-if="calculatorResults" class="pt-4 border-t border-slate-200/50 dark:border-slate-800/80 space-y-4">
                
                <!-- 1. Desarrollo inicial (Onetime) -->
                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inversión de Desarrollo (Pago Único Aprox.):</span>
                  <span class="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    ~${{ calculatorResults.initialDevMin }}
                    <span v-if="selectedPlan.pricing.devMax"> – ~${{ calculatorResults.initialDevMax }}</span>
                    <span v-else class="text-xs font-medium text-slate-400"> USD +</span>
                    <span class="text-sm font-semibold text-slate-400 ml-1">USD (Aprox.)</span>
                  </span>
                </div>

                <!-- 2. Costo recurrente anual -->
                <div class="p-3.5 rounded-xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-brand-600 dark:text-brand-500 uppercase tracking-wider">Costo Recurrente Anual Estimado:</span>
                    <span class="text-sm font-bold text-brand-600 dark:text-brand-400">~${{ calculatorResults.totalAnnualRecurring.toFixed(2) }} USD</span>
                  </div>
                  <div class="text-[10px] text-slate-400 space-y-1">
                    <div class="flex justify-between">
                      <span v-if="selectedModel === 'sale'">Hosting ({{ selectedPlan.pricing.hostingRec }} - {{ selectedHostingPeriod === '1' ? '1 mes' : `${selectedHostingPeriod}m` }}):</span>
                      <span v-else>Alquiler de Sistema SaaS ({{ selectedHostingPeriod === 'annual' ? 'Anual' : 'Mensual' }}):</span>
                      <span>~${{ calculatorResults.hostingTotalUpfront.toFixed(2) }} USD/{{ selectedHostingPeriod === 'annual' || selectedModel === 'sale' ? 'año' : 'mes' }}</span>
                    </div>
                    <div v-if="calculatorResults.domainCostAnnual > 0 || selectedModel === 'sale'" class="flex justify-between">
                      <span v-if="selectedModel === 'sale'">Dominio ({{ selectedDomain }}):</span>
                      <span v-else>Ajuste Dominio ({{ selectedDomain }}):</span>
                      <span>~${{ calculatorResults.domainCostAnnual }} USD/año</span>
                    </div>
                    <div v-if="includeMaintenance" class="flex justify-between">
                      <span>{{ selectedModel === 'sale' ? 'Soporte Técnico' : 'Soporte Premium' }} ({{ maintenanceType === 'monthly' ? 'mensual' : 'anual' }}):</span>
                      <span>~${{ calculatorResults.maintenanceAnnual }} USD/año</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- CTA Actions inside Card -->
              <div class="space-y-2.5 pt-2">
                <a 
                  :href="whatsappUrl" 
                  target="_blank"
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  <component :is="Icons.MessageSquare" class="w-4 h-4" />
                  <span>Enviar Cotización a WhatsApp</span>
                </a>
                <button 
                  @click="printProposal"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <Printer class="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar como PDF</span>
                </button>
              </div>

            </div>
          </div>
        </aside>

      </div>
    </main>

    <!-- CONTRACTING TERMS & POLICIES (no-print) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 no-print border-t border-slate-200/50 dark:border-slate-900 pt-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        <!-- Policies -->
        <div class="rounded-2xl bg-white/40 dark:bg-slate-900/35 border border-slate-200/60 dark:border-slate-800 p-6">
          <h3 class="text-base font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <component :is="Icons.ShieldCheck" class="w-5 h-5 text-emerald-500" />
            <span>Políticas de Contratación & Garantía</span>
          </h3>
          <ul class="space-y-3">
            <li v-for="(policy, idx) in contractingPolicies" :key="idx" class="text-xs md:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <span class="p-0.5 rounded bg-emerald-500/10 text-emerald-500 mt-0.5">
                <Check class="w-3 h-3" />
              </span>
              <span>{{ policy }}</span>
            </li>
          </ul>
        </div>

        <!-- Additional Costs Table -->
        <div class="rounded-2xl bg-white/40 dark:bg-slate-900/35 border border-slate-200/60 dark:border-slate-800 p-6">
          <h3 class="text-base font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <component :is="Icons.BadgeAlert" class="w-5 h-5 text-brand-500" />
            <span>Costos Adicionales Opcionales</span>
          </h3>
          <div class="overflow-hidden border border-slate-200/50 dark:border-slate-800/80 rounded-xl bg-white/20 dark:bg-slate-950/20">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-200/40 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/80">
                  <th class="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
                  <th class="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-right">Precio Aprox.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200/40 dark:divide-slate-800/80">
                <tr v-for="(cost, idx) in additionalCosts" :key="idx" class="hover:bg-slate-500/5 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-300">{{ cost.name }}</td>
                  <td class="py-3 px-4 font-bold text-slate-900 dark:text-white text-right">{{ cost.priceRaw }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>

    <!-- FOOTER (no-print) -->
    <footer class="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 py-12 px-4 no-print text-center text-slate-500 dark:text-slate-400 text-xs">
      <p class="font-semibold text-slate-700 dark:text-slate-300 mb-2">Desarrollo de Soluciones de Software Web Premium</p>
      <p>&copy; 2026 Todos los derechos reservados. La propiedad del código fuente y la administración del hosting/dominio se rigen bajo el modelo de contrato acordado (Adquisición o Alquiler SaaS).</p>
    </footer>

    <!-- ========================================================================= -->
    <!-- ==================== PDF PROPOSAL PRINT-ONLY LAYOUT ===================== -->
    <!-- ========================================================================= -->
    <div class="hidden print:block print-page text-slate-800 bg-white">
      <!-- Proposal Header -->
      <div class="flex items-center justify-between border-b-2 border-brand-500 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <img src="./assets/novabyte_icon.png" class="h-10 w-10 object-contain" alt="Novabyte" />
          <div>
            <h1 class="text-xl font-black tracking-wider text-slate-900 leading-none">NOVABYTE</h1>
            <p class="text-[8px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">SOFTWARE SOLUTIONS</p>
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-base font-extrabold text-brand-600 uppercase">Propuesta Comercial</h2>
          <p class="text-[10px] text-slate-500 mt-1">Fecha: {{ new Date().toLocaleDateString('es-ES') }}</p>
        </div>
      </div>

      <!-- Content -->
      <div v-if="selectedPlan && calculatorResults" class="space-y-5">
        
        <!-- Concept Title -->
        <div>
          <span class="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Servicio Cotizado:</span>
          <h3 class="text-base font-extrabold text-slate-900 mt-0.5">{{ selectedPlan.name }}</h3>
          <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">{{ selectedPlan.description }}</p>
        </div>

        <!-- Detailed Configuration Table (What they chose) -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-4">
          <div>
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Detalles del Servicio:</h4>
            <ul class="space-y-1 text-xs text-slate-700">
              <li>• <strong>Plan Base:</strong> {{ selectedPlan.shortName }}</li>
              <li>• <strong>Modalidad:</strong> {{ selectedModel === 'sale' ? 'Adquisición (Venta Completa)' : 'Alquiler de Sistema (SaaS)' }}</li>
              <li>• <strong>Dominio Registrado:</strong> {{ selectedDomain }}</li>
            </ul>
          </div>
          <div>
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Configuración Elegida:</h4>
            <ul class="space-y-1 text-xs text-slate-700">
              <li v-if="selectedModel === 'sale'">• <strong>Periodo Hosting:</strong> {{ selectedHostingPeriod === '1' ? '1 mes' : `${selectedHostingPeriod} meses` }}</li>
              <li v-else>• <strong>Suscripción SaaS:</strong> {{ selectedHostingPeriod === 'annual' ? 'Anual (Descuento de 2 meses)' : 'Mensual' }}</li>
              <li>• <strong>Mantenimiento y Soporte:</strong> {{ includeMaintenance ? (maintenanceType === 'monthly' ? 'Mensual Activo' : 'Anual Activo') : 'No contratado' }}</li>
              <li v-if="customFeaturePrice > 0">• <strong>Extra:</strong> {{ customFeatureDescription || 'Función personalizada' }} (+~${{ customFeaturePrice }} USD)</li>
            </ul>
          </div>
        </div>


        <!-- Economic Structure -->
        <div class="pt-3 border-t border-slate-200">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Desglose Económico</h4>
          
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th class="py-2 px-3 font-bold text-left">Concepto</th>
                <th class="py-2 px-3 font-bold text-center">Frecuencia / Tipo</th>
                <th class="py-2 px-3 font-bold text-right">Monto Estimado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <!-- Base Dev -->
              <tr>
                <td class="py-2 px-3 font-semibold">Desarrollo Base: {{ selectedPlan.shortName }}</td>
                <td class="py-2 px-3 text-center text-slate-500">Pago Único (Aprox.)</td>
                <td class="py-2 px-3 font-bold text-right text-slate-900">~{{ selectedPlan.pricing.devRaw }}</td>
              </tr>
              <!-- Custom additions -->
              <tr v-if="customFeaturePrice > 0">
                <td class="py-2 px-3 font-semibold">Requerimiento Extra: {{ customFeatureDescription || 'Función personalizada' }}</td>
                <td class="py-2 px-3 text-center text-slate-500">Pago Único (Aprox.)</td>
                <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ customFeaturePrice.toFixed(2) }} USD</td>
              </tr>
              <!-- Sale Hosting/Domain or SaaS -->
              <template v-if="selectedModel === 'sale'">
                <tr>
                  <td class="py-2 px-3 font-semibold">Hosting Sugerido: {{ selectedPlan.pricing.hostingRec }} ({{ selectedHostingPeriod }} meses)</td>
                  <td class="py-2 px-3 text-center text-slate-500">Servicio de Proveedor</td>
                  <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ calculatorResults.hostingMonthly.toFixed(2) }} USD/mes (Inicial: ~${{ calculatorResults.hostingTotalUpfront.toFixed(2) }} USD)</td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-semibold">Registro de Dominio Especial ({{ selectedDomain }})</td>
                  <td class="py-2 px-3 text-center text-slate-500">Servicio de Proveedor</td>
                  <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ calculatorResults.domainCostReg.toFixed(2) }} USD (Renovación: ~${{ calculatorResults.domainCostRenewal.toFixed(2) }} USD/año)</td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td class="py-2 px-3 font-semibold">Hosting Centralizado & Licencia SaaS ({{ selectedHostingPeriod === 'annual' ? 'Anual' : 'Mensual' }})</td>
                  <td class="py-2 px-3 text-center text-slate-500">Suscripción Mensual</td>
                  <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ calculatorResults.hostingTotalUpfront.toFixed(2) }} USD/período (Aprox.)</td>
                </tr>
                <tr v-if="calculatorResults.domainCostReg > 0">
                  <td class="py-2 px-3 font-semibold">Ajuste de Dominio Premium ({{ selectedDomain }})</td>
                  <td class="py-2 px-3 text-center text-slate-500">Suscripción Anual</td>
                  <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ calculatorResults.domainCostReg.toFixed(2) }} USD/año (Aprox.)</td>
                </tr>
              </template>
              <!-- Maintenance -->
              <tr v-if="includeMaintenance">
                <td class="py-2 px-3 font-semibold">Soporte Técnico Especializado</td>
                <td class="py-2 px-3 text-center text-slate-500">{{ maintenanceType === 'monthly' ? 'Mensual' : 'Anual' }} (Aprox.)</td>
                <td class="py-2 px-3 font-bold text-right text-slate-900">~${{ includeMaintenance && maintenanceType === 'monthly' ? '30.00' : '250.00' }} USD</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals block structured inside the flow -->
          <div class="mt-4 flex justify-end">
            <div class="w-80 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs text-slate-700">
              <div class="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span class="font-bold text-slate-800">{{ selectedModel === 'sale' ? 'INVERSIÓN DESARROLLO (Pago Único Aprox.):' : 'COSTO INSTALACIÓN (Pago Único Aprox.):' }}</span>
                <span class="font-black text-slate-950">
                  ~${{ calculatorResults.initialDevMin }}
                  <span v-if="selectedModel === 'sale' && selectedPlan.pricing.devMax"> - ~${{ calculatorResults.initialDevMax }}</span>
                  USD
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ selectedModel === 'sale' ? 'Hosting & Dominio (Anualizado Aprox.):' : 'Suscripción Recurrente (Anualizado):' }}</span>
                <span class="font-bold text-slate-900">~${{ (calculatorResults.hostingAnnual + calculatorResults.domainCostAnnual).toFixed(2) }} USD/año</span>
              </div>
              <div v-if="includeMaintenance" class="flex justify-between items-center">
                <span class="font-medium">Soporte Técnico (Anualizado Aprox.):</span>
                <span class="font-bold text-slate-900">~${{ calculatorResults.maintenanceAnnual }} USD/año</span>
              </div>
              <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold text-slate-950">
                <span>TOTAL RECURRENTE ANUAL (Aprox.):</span>
                <span>~${{ calculatorResults.totalAnnualRecurring.toFixed(2) }} USD/año</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Printing Terms (Compact to fit 1 page) -->
        <div class="pt-4 border-t border-slate-200 text-[9px] text-slate-500 leading-relaxed space-y-1.5">
          <h4 class="font-bold uppercase tracking-wider text-slate-700">Términos Legales y de Contratación (Modalidad: {{ selectedModel === 'sale' ? 'Adquisición' : 'Alquiler/SaaS' }})</h4>
          <p v-for="(policy, idx) in (selectedModel === 'sale' ? contractingPolicies : contractingPoliciesSaaS)" :key="idx" class="m-0">
            {{ idx + 1 }}. {{ policy }}
          </p>
          <p class="m-0 mt-1 italic text-[8.5px]">
            <strong>Aviso de Variabilidad:</strong> Todos los precios indicados son aproximaciones. Las tarifas de hosting y registro de dominios especiales son administradas por los proveedores y pueden sufrir fluctuaciones. El costo definitivo de desarrollo se pactará mediante un contrato formal según requerimientos.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Scoped custom transitions if any */
</style>
