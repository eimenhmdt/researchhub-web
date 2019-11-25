import moment from "moment";

import { UPVOTE, DOWNVOTE } from "~/config/constants";
import { doesNotExist, getNestedValue } from "~/config/utils";

export { handleCatch, logFetchError } from "~/config/utils";

export function transformVote(vote) {
  if (!doesNotExist(vote) && vote !== "null") {
    return {
      itemId: vote.item || vote.paper,
      voteType: transformVoteType(vote.vote_type),
      userId: vote.created_by,
      createdDate: transformDate(vote.created_date),
    };
  } else {
    return {};
  }
}

export function transformVoteType(voteType) {
  if (voteType === 1 || voteType === "1") {
    return UPVOTE;
  }
  if (voteType === 2 || voteType === "2") {
    return DOWNVOTE;
  }
}

export function transformDate(date) {
  return moment(date);
}

export function transformUser(user) {
  return {
    id: getNestedValue(user, ["id"], null),
    firstName: getNestedValue(user, ["first_name"], ""),
    lastName: getNestedValue(user, ["last_name"], ""),
    authorProfile: getNestedValue(user, ["author_profile"], {}),
  };
}
