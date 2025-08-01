import HomeComponent from '@/components/home-component'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/')({
  component: App,
})

function App() {
  return (
    <>
      <HomeComponent />
    </>
  )
}
