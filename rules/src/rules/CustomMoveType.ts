export enum CustomMoveType {
  /** End the "play cards" phase and move on to the optional "buy cards" phase. */
  EndPlayPhase = 1,
  /** Decline the optional effect currently offered (Destroy / Play from discard / Corrupt / Copy). */
  Pass,
  /** Pick one side of an "either / or" effect. `data` = index in the effect's `option` array. */
  ChooseEffectOption,
  /** Copy a River card. `data` = the item index of the chosen River card. */
  CopyRiverCard,
  /** End the optional "buy cards" phase and move on to the end of turn. */
  EndBuyPhase
}
