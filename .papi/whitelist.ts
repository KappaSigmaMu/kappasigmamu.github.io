export const whitelist = {
  ksmAssetHub: [
    'query.ParachainSystem.LastRelayChainBlockNumber',
    'query.Timestamp.MinimumPeriod',
    'query.Indices.Accounts',
    'const.Indices.Deposit',
    'tx.Indices.claim',
    'tx.Indices.free',
    'tx.Indices.freeze',
    'query.Society.*',
    'const.Society.*',
    'tx.Society.*',
    'event.Society.*'
  ],
  ksmPeople: ['query.Identity.IdentityOf', 'query.Identity.SuperOf']
}
