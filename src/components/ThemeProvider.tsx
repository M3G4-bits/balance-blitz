import { createContext, useContext } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

const ThemeProviderContext = createContext<{
  theme: string | undefined
  setTheme: (theme: string) => void
} | undefined>(undefined)

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) return { theme: "dark", setTheme: () => {} }
  return context
}