<!-- resources/js/components/Icon.vue -->
<template>
  <component :is="iconComponent" :class="props.class" />
</template>

<script setup>
import { computed } from 'vue';
import {
  Pencil, Trash, Eye, Check, X, LogOut, ShoppingCart,
  CreditCard, Users, User, Building2, Calendar, ClipboardList,
  CircleDollarSign, Zap, Settings, Plus, ArrowLeft, Key, Clipboard,
  BarChart2, Receipt, Briefcase, Shield, Wrench, TrendingUp, History, Lock,
  Bell, Menu, RefreshCw, Banknote, Landmark
} from '@lucide/vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: 'w-5 h-5 inline-block'
  }
});

const iconMap = {
  pencil: Pencil,
  trash: Trash,
  eye: Eye,
  check: Check,
  x: X,
  'log-out': LogOut,
  'shopping-cart': ShoppingCart,
  'credit-card': CreditCard,
  users: Users,
  user: User,
  building: Building2,
  calendar: Calendar,
  'clipboard-list': ClipboardList,
  'circle-dollar-sign': CircleDollarSign,
  zap: Zap,
  settings: Settings,
  plus: Plus,
  'arrow-left': ArrowLeft,
  key: Key,
  clipboard: Clipboard,
  'bar-chart-2': BarChart2,
  receipt: Receipt,
  briefcase: Briefcase,
  shield: Shield,
  wrench: Wrench,
  'trending-up': TrendingUp,
  history: History,
  lock: Lock,
  bell: Bell,
  menu: Menu,
  'refresh-cw': RefreshCw,
  banknote: Banknote,
  landmark: Landmark
};

const iconComponent = computed(() => {
  return iconMap[props.name.toLowerCase()] || Zap; // Fallback to zap
});
</script>
