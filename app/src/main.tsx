import { GameProvider } from '@gamepark/react-game'
import { SanOptionsSpecV2 } from '@gamepark/san/SanOptions'
import { SanRules } from '@gamepark/san/SanRules'
import { SanSetup } from '@gamepark/san/SanSetup'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="san"
      Rules={SanRules}
      optionsSpec={SanOptionsSpecV2}
      GameSetup={SanSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
