import { loadScript, onAnalyticsReady, hasGoogleScript } from './helpers'
import config, { update } from './config'
import createTrackers from './create-trackers'
import collectors from './collectors'
import untracked from 'lib/untracked'
import * as page from 'lib/page'
import * as exception from 'lib/exception'

export default function bootstrap () {
  if (typeof document === 'undefined') {
    return
  }

  const { id, debug, checkDuplicatedScript, disableScriptLoader } = config
  const filename = debug.enabled ? 'analytics_debug' : 'analytics'
  const googleScript = `https://www.google-analytics.com/${filename}.js`

  if (!id) {
    throw new Error('[vue-analytics] Please enter a Google Analytics tracking ID')
  }

  return new Promise((resolve, reject) => {
    if ((checkDuplicatedScript && hasGoogleScript(googleScript)) || disableScriptLoader) {
      return resolve()
    }

    // Load Google Analytics script file
    return loadScript(googleScript)
      .then(() => {
        resolve()
      })
      .catch(() => {
        reject('[vue-analytics] It\'s not possible to load Google Analytics script')
      })
  })
  .then(() => {
    // Extra check on the availability of the js library
    return onAnalyticsReady()
  })
  .then(() => {
    // Create analytics trackers first    
    createTrackers()
    // Add all collectors
    collectors()
    // Fire the callback function that analytics is ready
    config.ready()
    // Run exception autotracking
    exception.autotracking()
    // Run page autotracking
    page.autotracking()
    // Fire all untracked events
    untracked()
  })
  .catch(error => {
    console.error(error)
  })
}
