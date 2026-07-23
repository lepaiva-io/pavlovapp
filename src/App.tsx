import { useApp } from './state/store'
import { Spinner } from './components/ui'
import Auth from './components/Auth'
import Shell from './components/Shell'
import Onboarding from './components/forms/Onboarding'

export default function App() {
  const { user, authReady, needsOnboarding, modalNode, toastMsg } = useApp()

  let body
  if (!authReady) body = <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>
  else if (!user) body = <Auth />
  else body = <Shell />

  return (
    <>
      {body}
      {user && needsOnboarding && <Onboarding />}
      {modalNode}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  )
}
