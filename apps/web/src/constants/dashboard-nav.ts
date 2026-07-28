import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ClipboardList,
  Inbox,
  MessageCircle,
  Heart,
  History,
  Bell,
  User,
  Settings,
  CalendarDays,
  Star,
  BarChart3,
  Wallet,
  Crown,
} from 'lucide-react';

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * "Estado dos pedidos" (pedido do prompt) não é uma secção à parte —
 * fica dentro de "Os meus pedidos" como badge de estado em cada cartão,
 * para não duplicar navegação para a mesma informação.
 */
export const CLIENT_DASHBOARD_NAV: DashboardNavItem[] = [
  { id: 'inicio', label: 'Início', href: '/dashboard/cliente', icon: Home },
  { id: 'pedidos', label: 'Os meus pedidos', href: '/dashboard/cliente/pedidos', icon: ClipboardList },
  { id: 'propostas', label: 'Propostas recebidas', href: '/dashboard/cliente/propostas', icon: Inbox },
  { id: 'conversas', label: 'Conversas', href: '/dashboard/cliente/conversas', icon: MessageCircle },
  { id: 'favoritos', label: 'Favoritos', href: '/dashboard/cliente/favoritos', icon: Heart },
  { id: 'historico', label: 'Histórico', href: '/dashboard/cliente/historico', icon: History },
  { id: 'notificacoes', label: 'Notificações', href: '/dashboard/cliente/notificacoes', icon: Bell },
  { id: 'perfil', label: 'Perfil', href: '/dashboard/cliente/perfil', icon: User },
  { id: 'definicoes', label: 'Definições', href: '/dashboard/cliente/definicoes', icon: Settings },
];

/**
 * "Calendário" também não é secção à parte — é uma vista dentro de
 * "Agenda" (a mesma informação, duas formas de ver), mesma razão acima.
 */
export const PROFESSIONAL_DASHBOARD_NAV: DashboardNavItem[] = [
  { id: 'inicio', label: 'Início', href: '/dashboard/profissional', icon: Home },
  { id: 'pedidos-disponiveis', label: 'Pedidos disponíveis', href: '/dashboard/profissional/pedidos-disponiveis', icon: Inbox },
  { id: 'trabalhos-aceites', label: 'Trabalhos aceites', href: '/dashboard/profissional/trabalhos-aceites', icon: ClipboardList },
  { id: 'agenda', label: 'Agenda', href: '/dashboard/profissional/agenda', icon: CalendarDays },
  { id: 'conversas', label: 'Conversas', href: '/dashboard/profissional/conversas', icon: MessageCircle },
  { id: 'avaliacoes', label: 'Avaliações', href: '/dashboard/profissional/avaliacoes', icon: Star },
  { id: 'estatisticas', label: 'Estatísticas', href: '/dashboard/profissional/estatisticas', icon: BarChart3 },
  { id: 'ganhos', label: 'Ganhos', href: '/dashboard/profissional/ganhos', icon: Wallet },
  { id: 'premium', label: 'Plano Premium', href: '/dashboard/profissional/premium', icon: Crown },
  { id: 'perfil', label: 'Perfil', href: '/dashboard/profissional/perfil', icon: User },
  { id: 'definicoes', label: 'Definições', href: '/dashboard/profissional/definicoes', icon: Settings },
];
