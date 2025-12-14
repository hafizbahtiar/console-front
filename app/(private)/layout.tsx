import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/private/app-sidebar"
import { AppHeader } from "@/components/layout/private/app-header"

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

