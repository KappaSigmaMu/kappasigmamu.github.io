import { MarkdownRenderer } from '../../../components/MarkdownRenderer'

const RulesPage = (): JSX.Element => {
  const rulesMarkdown =
    // eslint-disable-next-line max-len
    '# Proof-of-Ink Rules\n\n(# Kappa Sigma Mu (KÎ£M): The Kusama Fratority\n\n#### Or, _Kusama Human Blockchain Project_\n\n\n## Preamble\n\nKappa Sigma Mu is a membership club using the the Substrate _Society_ pallet. Society pallet defines most of the process behind becoming a member, however it leaves undefined the specific qualities by which members should be judging member-candidates and challenged-members. This is what is refered to by the `rules` that are passed into the `found` transaction.\n\n## `rules`: Convention of Approval of Membership\n\nNew candidate members shall be judged on their ability to provide *Proof-of-Ink* to existing members, where the *Ink* shall be a **permanent tattoo** including at least two elements:\n\n1. **An identifier of the Kusama network.** One or more of: the Kusama network\'s canary symbol; the typography; the full logo; or the Kusama genesis hash. Designs may be filled and in outline. The hash must be rendered in full as a barcode, binary or in hex. An artistic derivative of one or more of these is also acceptable, but may not deviate from the style, design or content sufficently that it be no longer obviously identifiable as Kusama.\n2. **An identifier of the parent member.** The parent member, as defined by the society pallet instance\'s `Head` storage item at the time of candidacy. This should be rendered as one of: an SS58 account or index address; decimal accout index; binary account ID; or a machine-readable image capable of being recognised by a mainstream Kusama wallet.\n\nThe proof should contain compelling evidence that the tattoo:\n- exists on the body;\n- could fit into a circle no smaller than 2.54cm; and\n- is permanent.\n\nIn proving each of these, we recommend:\n- at least t high-quality well-lit photographs;\n- a video of it being done where the equipment is visible is better;\n- live witnessing by other members is best, together with pre-publication of the location and time that the tattooing takes place to allow other members to gather and witness.\n\nThe identity of the member need *not* be discernable nor the specific part of the body on which it is placed.\n\n### Founder\n\nExactly as per the standard convention, but there is no need for the second, "identifier of the parent member" since there is no parent member to identify.\n\n### Existing Members (Challenges)\n\nEvidence of the continued existence of the tattoo should be provided; high-resolution photographic evidence in good light from a variety of angles and with proof that it was taken after the challenge as announced, such as a recent kusama block hash in frame.'

  return (
    <>
      <MarkdownRenderer markdownText={rulesMarkdown} />
    </>
  )
}

export { RulesPage }
