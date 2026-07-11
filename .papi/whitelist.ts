export const whitelist = {
  ksmAssetHub: [
    'query.ParachainSystem.LastRelayChainBlockNumber',
    'query.Timestamp.MinimumPeriod',
    'query.Indices.Accounts',
    'query.Society.*',
    'const.Society.*',
    'tx.Society.*',
    'event.Society.*'
  ],
  ksmPeople: ['query.Identity.IdentityOf', 'query.Identity.SuperOf']
}
