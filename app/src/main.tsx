import { GameProvider } from '@gamepark/react-game'
import { SanOptionsSpecV2 } from '@gamepark/san/SanOptions'
import { SanRules } from '@gamepark/san/SanRules'
import { SanSetup } from '@gamepark/san/SanSetup'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { ai } from './ai'
import { App } from './App'
import { SanLogDescription } from './logs/SanLogDescription'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import { Scoring } from './Scoring'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="san"
      Rules={SanRules}
      optionsSpec={SanOptionsSpecV2}
      GameSetup={SanSetup}
      material={Material}
      locators={Locators}
      logs={new SanLogDescription()}
      animations={gameAnimations}
      scoring={Scoring}
      theme={theme}
      ai={ai}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
