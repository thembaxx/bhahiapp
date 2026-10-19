import { renderBahiBrandIcon } from '../brand-pwa-icon';

export const dynamic = 'force-static';

export function GET() {
  return renderBahiBrandIcon(512);
}
