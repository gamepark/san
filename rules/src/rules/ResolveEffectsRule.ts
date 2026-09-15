import { MaterialMove } from '@gamepark/rules-api'
import { CardEffect, EffectType, getCardData } from '../material/CardsData'
import { CardType, SanCard } from '../material/SanCard'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/** Which resource counter an {@link EffectType.Corruption}/{@link EffectType.Propaganda}/{@link EffectType.Virus} feeds. */
const POINTS_KEY = {
  [EffectType.Corruption]: 'corruption',
  [EffectType.Propaganda]: 'propaganda',
  [EffectType.Virus]: 'virus'
} as const

const RESOURCE_TYPES: EffectType[] = [EffectType.Corruption, EffectType.Propaganda, EffectType.Virus]

/** A Multiplier played this turn, plus how many matching cards it has already paid out for. */
interface MultiplierState {
  gain: EffectType.Corruption | EffectType.Propaganda | EffectType.Virus
  per: CardType
  value: number
  counted: number
}

/**
 * An "either / or" that is really "gain any resource": every branch is a plain resource gain
 * (e.g. `propaganda(1) / virus(1) / corruption(1)` on the starting Equipment card). The player must
 * not have to pick one — see {@link import('./Memory').ResourcesMemory.flex}.
 */
const isAnyResourceEither = (effect: CardEffect): boolean =>
  !!effect.option && effect.option.length >= 2 && effect.option.every((option) => RESOURCE_TYPES.includes(option.type))

/**
 * Dispatcher for the effects of the card being played. It applies the automatic effects (resource
 * gains, multiplier, "play every type", single use) directly, and delegates the ones that need the
 * player — a choice or a targeted action — to a dedicated sub-rule. When the queue is empty it hands
 * control back to {@link RuleId.PlayCards}.
 */
export class ResolveEffectsRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.resolve()
  }

  resolve(): MaterialMove[] {
    const queue = this.effectQueue

    while (queue.length) {
      const effect = queue[0]
      switch (effect.type) {
        case EffectType.Corruption:
        case EffectType.Propaganda:
        case EffectType.Virus:
          this.resourcesHelper.addPoints(POINTS_KEY[effect.type], effect.value ?? 0)
          queue.shift()
          break

        case EffectType.Multiplier: {
          // Register it; the points are granted (and topped up for later cards) by applyMultipliers().
          const multipliers = this.remind<MultiplierState[]>(Memory.Multipliers) ?? []
          multipliers.push({ gain: effect.gain!, per: effect.per!, value: effect.value ?? 1, counted: 0 })
          this.memorize(Memory.Multipliers, multipliers)
          queue.shift()
          break
        }

        case EffectType.AllTypes:
          this.turnFlagsHelper.setAllTypesAllowed()
          queue.shift()
          break

        case EffectType.SingleUse:
        case EffectType.CopyPlayed: // unused by the printed cards
          queue.shift()
          break

        case EffectType.Draw:
          this.setQueue(queue)
          this.memorize(Memory.RepeatCount, effect.value ?? 1)
          return [this.startRule(RuleId.DrawCards)]

        case EffectType.Either:
          // "Gain any resource": no choice — feed the shared pool (see ResourcesMemory.flex).
          if (isAnyResourceEither(effect)) {
            this.resourcesHelper.addFlexPoints(effect.option![0].value ?? 0)
            queue.shift()
            break
          }
          this.setQueue(queue)
          return [this.startRule(RuleId.ChooseEffect)]

        case EffectType.Destroy:
          this.setQueue(queue)
          this.memorize(Memory.RepeatCount, effect.value ?? 1)
          return [this.startRule(RuleId.DestroyCard)]

        case EffectType.PlayFromDiscard:
          this.setQueue(queue)
          return [this.startRule(RuleId.PlayFromDiscard)]

        case EffectType.CorruptFromHand:
          this.setQueue(queue)
          this.memorize(Memory.RepeatCount, effect.value ?? 1)
          return [this.startRule(RuleId.CorruptFromHand)]

        case EffectType.CopyRiver:
          this.setQueue(queue)
          return [this.startRule(RuleId.CopyRiver)]

        default:
          queue.shift()
      }
    }

    this.setQueue([])
    this.applyMultipliers()
    return [this.startRule(RuleId.PlayCards)]
  }

  /**
   * Bring every Multiplier played this turn up to date with the cards now in the play area, so a
   * Multiplier ends up counting every matching card of the turn whatever the order it was played in
   * (rules, p.20: "autant de fois que de cartes jouées lors de ce tour").
   */
  applyMultipliers(): void {
    const multipliers = this.remind<MultiplierState[]>(Memory.Multipliers)
    if (!multipliers?.length) return
    for (const multiplier of multipliers) {
      const played = this.countPlayed(multiplier.per)
      if (played > multiplier.counted) {
        this.resourcesHelper.addPoints(POINTS_KEY[multiplier.gain], (played - multiplier.counted) * multiplier.value)
        multiplier.counted = played
      }
    }
    this.memorize(Memory.Multipliers, multipliers)
  }

  /** Cards of that type already played this turn (the card carrying the multiplier is among them). */
  countPlayed(type: CardType): number {
    return this.playArea.getItems<SanCard>().filter((item) => getCardData(item.id)?.type === type).length
  }
}
