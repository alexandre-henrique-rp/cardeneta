import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<
    boolean | undefined
  >(undefined)

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      const userAgent = navigator.userAgent.toLowerCase()

      // Detectar dispositivos móveis e tablets por user agent
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(
          userAgent
        )

      // Combinar largura da tela com detecção de touch e user agent
      const isSmallScreen = width < TABLET_BREAKPOINT

      setIsMobileOrTablet((isSmallScreen && isTouchDevice) || isMobileDevice)
    }

    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    mql.addEventListener('change', checkDevice)
    checkDevice()

    return () => mql.removeEventListener('change', checkDevice)
  }, [])

  return !!isMobileOrTablet
}
