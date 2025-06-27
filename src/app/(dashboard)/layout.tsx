import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/modules/dashboard/ui/components/dashboard-sidebar'

export default function Layout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardSidebar/>
      <main className="flex flex-col h-screen">
        { children }
      </main>
    </SidebarProvider>
  )
}