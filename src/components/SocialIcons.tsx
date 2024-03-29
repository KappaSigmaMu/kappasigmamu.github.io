import { ExternalLink } from './base'
import DiscordLogo from '../static/discord-logo.svg'
import ElementLogo from '../static/element-logo.svg'
import TwitterLogo from '../static/twitter-logo.svg'

const SocialIcons = () => (
  <div className="me-1">
    <ExternalLink href="https://kusa.ma/discord">
      <img src={DiscordLogo} alt="Discord Logo" />
    </ExternalLink>
    &nbsp;
    <ExternalLink href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io">
      <img src={ElementLogo} alt="Element Logo" />
    </ExternalLink>
    &nbsp;
    <ExternalLink href="https://twitter.com/kusamanetwork">
      <img src={TwitterLogo} alt="Twitter Logo" style={{ color: 'red' }} />
    </ExternalLink>
  </div>
)

export { SocialIcons }
