import * as React from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within Dialog")
  
  return (
    <div 
      className={cn("cursor-pointer", className)}
      onClick={() => context.setOpen(true)}
    >
      {children}
    </div>
  )
}

const DialogContent: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within Dialog")
  
  if (!context.open) return null
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      />
      
      {/* Content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className={cn(
          "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl",
          className
        )}>
          <button
            onClick={() => context.setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

const DialogHeader: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)}>
    {children}
  </div>
)

const DialogTitle: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}>
    {children}
  </h3>
)

const DialogDescription: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <p className={cn("text-sm text-gray-400", className)}>
    {children}
  </p>
)

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} 