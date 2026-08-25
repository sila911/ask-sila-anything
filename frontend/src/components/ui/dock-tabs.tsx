import { useState, useRef, useEffect, cloneElement, Fragment } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { AddSquare, FolderOpen, Setting2, Logout, Chart } from "iconsax-react"

interface DockItem {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

const dockItems: DockItem[] = [
  { id: "create", name: "Create Reply", icon: <AddSquare size="22" variant="Bulk" />, color: "bg-cyan-500 hover:bg-cyan-600" },
  { id: "library", name: "Library", icon: <FolderOpen size="22" variant="Bulk" />, color: "bg-amber-500 hover:bg-amber-600" },
  { id: "analytics", name: "Analytics", icon: <Chart size="22" variant="Bulk" />, color: "bg-emerald-500 hover:bg-emerald-600" },
  { id: "admin", name: "Admin Dashboard", icon: <Setting2 size="22" variant="Bulk" />, color: "bg-indigo-500 hover:bg-indigo-600" },
  { id: "logout", name: "Logout", icon: <Logout size="22" variant="Bulk" />, color: "bg-rose-500 hover:bg-rose-600" },
]

function DockIcon({ 
  item, 
  mouseX, 
  isActive, 
  isMobile,
  onClick 
}: { 
  item: DockItem
  mouseX: any
  isActive: boolean
  isMobile: boolean
  onClick: () => void 
}) {
  const ref = useRef<HTMLDivElement>(null)
  
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return (val as number) - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], isMobile ? [40, 40, 40] : [50, 80, 50])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const heightSync = useTransform(distance, [-150, 0, 150], isMobile ? [40, 40, 40] : [50, 80, 50])
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onClick={onClick}
      className="aspect-square cursor-pointer flex items-center justify-center relative group"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden ${item.color}`}
        animate={{
          y: isClicked ? 2 : isHovered ? -8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          {cloneElement(item.icon as React.ReactElement, { size: isMobile ? 18 : 22 })}
        </motion.div>
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Tooltip - disable on mobile */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? -20 : 10,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800/95 dark:bg-slate-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none backdrop-blur-sm shadow-md border border-white/5"
        >
          {item.name}
        </motion.div>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/90 dark:bg-sky-400 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          animate={{
            scale: isClicked ? 1.5 : 1,
            opacity: isClicked ? 1 : 0.8,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </motion.div>
  )
}

export function DockTabs({
  activeTab,
  onChange,
  onLogout,
}: {
  activeTab: string
  onChange: (tab: string) => void
  onLogout: () => void
}) {
  const mouseX = useMotionValue(Infinity)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center p-2 w-max max-w-[95vw]">
      <motion.div
        onMouseMove={(e) => !isMobile && mouseX.set(e.pageX)}
        onMouseLeave={() => !isMobile && mouseX.set(Infinity)}
        className="mx-auto flex h-14 sm:h-20 items-end gap-2.5 sm:gap-3.5 rounded-2xl sm:rounded-3xl bg-slate-900/35 dark:bg-slate-950/35 backdrop-blur-xl px-3 pb-2 sm:px-4.5 sm:pb-3 border border-white/10 dark:border-white/5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        {dockItems.map((item) => (
          <Fragment key={item.id}>
            {item.id === "logout" && (
              <div 
                className="w-px h-8 sm:h-12 bg-white/20 dark:bg-white/10 self-center mb-1 sm:mb-2 mx-1 sm:mx-2 shrink-0" 
                aria-hidden="true"
              />
            )}
            <DockIcon 
              item={item} 
              mouseX={mouseX} 
              isActive={activeTab === item.id}
              isMobile={isMobile}
              onClick={() => {
                if (item.id === "logout") {
                  onLogout()
                } else {
                  onChange(item.id)
                }
              }}
            />
          </Fragment>
        ))}
      </motion.div>
    </div>
  )
}
