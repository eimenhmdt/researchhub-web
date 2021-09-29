import { AUTH_TOKEN } from "~/config/constants";
import {
  fetchUnifiedDocFeed,
  fetchLatestActivity,
  fetchLeaderboard,
  fetchTopHubs,
} from "~/config/fetch";
import { filterOptions } from "~/config/utils/options";
import { getInitialScope } from "~/config/utils/dates";
import { isNullOrUndefined } from "~/config/utils/nullchecks";
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";

export function buildStaticPropsForFeed({
  docType = "all",
  feed = null,
  hubSlug = null,
}) {
  return (async function () {
    const defaultProps = {
      initialFeed: null,
      leaderboardFeed: null,
      initialHubList: null,
      feed,
    };

    let currentHub;
    if (hubSlug) {
      currentHub = await fetch(API.HUB({ slug: hubSlug }), API.GET_CONFIG())
        .then((res) => res.json())
        .then((body) => body.results[0]);

      if (!currentHub) {
        return {
          props: {
            error: {
              code: 404,
            },
          },
          revalidate: 5,
        };
      }
    }

    const initialActivityPromise = fetchLatestActivity({
      hubIds: currentHub ? [currentHub.id] : null,
    });
    const initialHubListPromise = fetchTopHubs();
    const leaderboardPromise = fetchLeaderboard({
      limit: 10,
      page: 1,
      hubId: currentHub?.id ?? null,
      timeframe: "past_week",
    });
    const initialFeedPromise = fetchUnifiedDocFeed({
      hubId: currentHub?.id ?? null,
      ordering: "hot",
      page: 1,
      subscribedHubs: false,
      timePeriod: getInitialScope(),
      type: docType,
    });

    const [leaderboardFeed, initialFeed, initialHubList, initialActivity] =
      await Promise.all([
        leaderboardPromise,
        initialFeedPromise,
        initialHubListPromise,
        initialActivityPromise,
      ]);

    return {
      revalidate: 10,
      props: {
        ...defaultProps,
        initialFeed,
        leaderboardFeed,
        initialHubList,
        initialActivity,
        key: `${hubSlug}-${docType}`,
        ...(currentHub && { currentHub }),
        ...(feed !== null && { feed }),
        ...(hubSlug && { slug: hubSlug }),
      },
    };
  })();
}
