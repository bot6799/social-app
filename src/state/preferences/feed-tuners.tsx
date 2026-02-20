import {useMemo} from 'react'

import {FeedTuner} from '#/lib/api/feed-manip'
import {type FeedDescriptor} from '../queries/post-feed'
import {usePreferencesQuery} from '../queries/preferences'
import {useSession} from '../session'
import {useLanguagePrefs} from './languages'

import {filterEuropeOnly} from '#europe/feeds/EuropeFeedFilter'

export function useFeedTuners(feedDesc: FeedDescriptor, europeOnly?: boolean) {
  const langPrefs = useLanguagePrefs()
  const {data: preferences} = usePreferencesQuery()
  const {currentAccount} = useSession()

  return useMemo(() => {
    const tuners = []

    // Europe-only filter — prepend so it runs first
    if (europeOnly) {
      tuners.push(filterEuropeOnly)
    }

    if (feedDesc.startsWith('author')) {
      if (feedDesc.endsWith('|posts_with_replies')) {
        // TODO: Do this on the server instead.
        tuners.push(FeedTuner.removeReposts)
        return tuners
      }
    }
    if (feedDesc.startsWith('feedgen')) {
      tuners.push(
        FeedTuner.preferredLangOnly(langPrefs.contentLanguages),
        FeedTuner.removeMutedThreads,
      )
      return tuners
    }
    if (feedDesc === 'following' || feedDesc.startsWith('list')) {
      tuners.push(FeedTuner.removeOrphans)

      if (preferences?.feedViewPrefs.hideReposts) {
        tuners.push(FeedTuner.removeReposts)
      }
      if (preferences?.feedViewPrefs.hideReplies) {
        tuners.push(FeedTuner.removeReplies)
      } else {
        tuners.push(
          FeedTuner.followedRepliesOnly({
            userDid: currentAccount?.did || '',
          }),
        )
      }
      if (preferences?.feedViewPrefs.hideQuotePosts) {
        tuners.push(FeedTuner.removeQuotePosts)
      }
      tuners.push(FeedTuner.dedupThreads)
      tuners.push(FeedTuner.removeMutedThreads)

      return tuners
    }
    return tuners
  }, [feedDesc, currentAccount, preferences, langPrefs, europeOnly])
}
