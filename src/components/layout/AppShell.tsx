import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { DetailDrawer } from '../common/DetailDrawer'
import { CommandPalette } from '../common/CommandPalette'
import { ToastContainer } from '../common/Toast'
import { useApp } from '../../context/AppContext'

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isModelDrawerOpen, closeModelDrawer, activeModelDrawer } = useApp()

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Slide-over Model Inspection Drawer */}
      <DetailDrawer
        isOpen={isModelDrawerOpen}
        onClose={closeModelDrawer}
        model={activeModelDrawer}
      />

      {/* Global Cmd+K Command Palette */}
      <CommandPalette />

      {/* Action Notification Toasts */}
      <ToastContainer />
    </div>
  )
}
