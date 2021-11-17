import DiscordLogo from '../static/discord-logo.svg'
import ElementLogo from '../static/element-logo.svg'
import TwitterLogo from '../static/twitter-logo.svg'
import { ExternalLink } from './base'

const SocialIcons = () => (
  <div className='me-2'>
    <ExternalLink href="https://discord.gg/9AWjTf8wSk">
      <img src={DiscordLogo} alt="Discord Logo" />
    </ExternalLink>
    &nbsp;
    <ExternalLink href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io">
      <img src={ElementLogo} alt="Element Logo" />
    </ExternalLink>
    &nbsp;
    <ExternalLink href="https://twitter.com/kusamanetwork">
      <img src={TwitterLogo} alt="Twitter Logo" style={{color: 'red'}} />
    </ExternalLink>
  </div>
)

export { SocialIcons }
