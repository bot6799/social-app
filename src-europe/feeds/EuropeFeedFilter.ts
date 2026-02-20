import {type FeedTunerFn} from '#/lib/api/feed-manip'

/**
 * Client-side feed tuner that filters to only show posts from
 * Europe Social (eur.so) accounts.
 */
export const filterEuropeOnly: FeedTunerFn = (_tuner, slices, _dryRun) => {
  return slices.filter(slice => {
    const author = slice.items[0]?.post.author
    return author?.handle?.endsWith('.eur.so')
  })
}
