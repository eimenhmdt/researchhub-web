import { css, StyleSheet } from "aphrodite";
import ALink from "~/components/ALink";
import { getUrlToUniDoc } from "~/config/utils/routing";
import {
  BountyContributionItem,
  CommentContributionItem,
  Contribution,
  HypothesisContributionItem,
  PaperContributionItem,
  PostContributionItem,
  RscSupportContributionItem,
} from "~/config/types/contribution";
import { truncateText } from "~/config/utils/string";
import colors from "~/config/themes/colors";
import ContributionHeader from "../Contribution/ContributionHeader";
import { ReactNode } from "react";
import Link from "next/link";
import { isEmpty } from "~/config/utils/nullchecks";
import CommentReadOnly from "~/components/Comment/CommentReadOnly";
import config from "~/components/Comment/lib/config";


type Args = {
  entry: Contribution;
  actions: Array<any>;
  setHubsDropdownOpenForKey?: Function;
  hubsDropdownOpenForKey?: string;
};

const ContributionEntry = ({
  entry,
  actions,
  setHubsDropdownOpenForKey,
  hubsDropdownOpenForKey,
}: Args) => {
  const { contentType } = entry;
  let { item } = entry;
  let showActions = false;

  let title: string | ReactNode;
  let body: string | ReactNode;

  try {
    switch (contentType.name) {
      case "comment":
        showActions = true;

        item = item as CommentContributionItem;
        body = (
          <span className={css(styles.commentBody)}>
            <CommentReadOnly content={item.content} previewMaxImageLength={config.liveFeed.previewMaxImages} previewMaxCharLength={config.liveFeed.previewMaxChars} />
          </span>
        );
        break;

      case "rsc_support":
        item = item as RscSupportContributionItem;

        if (item.source.contentType.name === "comment") {
          body = (
            <span className={css(styles.commentBody)}>
              <CommentReadOnly content={item.source.content} previewMaxImageLength={config.liveFeed.previewMaxImages} previewMaxCharLength={config.liveFeed.previewMaxChars} />
            </span>
          );
        } else {
          body = truncateText(item?.source.unifiedDocument?.document?.body, 300);
          title = (
            <ALink href={getUrlToUniDoc(item?.source.unifiedDocument)}>
              {item?.source.unifiedDocument?.document?.title}
            </ALink>
          );
        }
        break;

      case "bounty":
        title = (
          <ALink href={getUrlToUniDoc(entry.relatedItem?.unifiedDocument)}>
            {entry.relatedItem?.unifiedDocument?.document?.title}
          </ALink>
        );


        body = truncateText(
          entry.relatedItem?.unifiedDocument?.document?.body,
          300
        );

        break;

      case "hypothesis":
      case "post":
      case "question":
      case "paper":
        // default:
        showActions = true;
        item =
          contentType.name === "hypothesis"
            ? (item as HypothesisContributionItem)
            : contentType.name === "post"
              ? (item as PostContributionItem)
              : (item as PaperContributionItem);

        // @ts-ignore
        body = truncateText(
          item?.unifiedDocument?.document?.body ||
          item?.abstract ||
          item?.renderable_text,
          300
        );
        if (contentType.name === "hypothesis") {
          /* below is a hack (need to address in the future) */
          item.unifiedDocument.documentType = "hypothesis";
          item.unifiedDocument.document = { id: item.id, slug: item.slug };
          body = item.renderable_text;
        }
        title = (
          <ALink href={getUrlToUniDoc(item?.unifiedDocument)}>
            {item?.unifiedDocument?.document?.title ?? item?.title ?? ""}
          </ALink>
        );
        break;
      default:
        console.warn("[Contribution] Could not render contribution item", item);
    }
  }
  catch (error) {
    console.warn("[Contribution] Could not render", entry)
    return null;
  }

  return (
    <>
      <div className={css(styles.entryContent)}>
        <ContributionHeader entry={entry} />
        <div className={css(styles.highlightedContentContainer)}>
          <div className={css(styles.highlightedContent)}>
            {title && (
              <div className={`${css(styles.title)} highlightedContentTitle`}>
                {title}
              </div>
            )}
            {body && (
              <div className={`${css(styles.body)} highlightedContentBody`}>
                <div className={css(styles.textContainer)}>{body}</div>
              </div>
            )}
          </div>
          {/* {showActions && (
            <div className={css(styles.actions)}>
              {actions.map(
                (action, idx) =>
                  action.isActive && (
                    <span
                      key={`action-${idx}`}
                      onClick={(event) => {
                        event.preventDefault();
                      }}
                    >
                      {action.html}
                    </span>
                  )
              )}
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

const styles = StyleSheet.create({
  entryContent: {
    fontSize: 14,
    lineHeight: "20px",
    width: "100%",
  },
  hubLink: {
    color: colors.DARKER_GREY(),
    textTransform: "capitalize",
    fontSize: 14,
    ":hover": {
      color: colors.DARKER_GREY(),
      textDecoration: "underline",
    },
  },
  avatarContainer: {
    display: "flex",
    marginRight: "8px",
  },
  details: {},
  highlightedContentContainer: {
    padding: "15px 0px 0px 0px",
    marginTop: 0,
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
  },
  highlightedContent: {
    width: "100%",
  },
  textContainer: {
    display: "flex",
  },
  title: {
    fontSize: 18,
    ":nth-child(1n) + .highlightedContentBody": {
      marginTop: 10,
    },
  },
  body: {},
  commentBody: {
    // fontStyle: "italic",
    width: "100%",
  },
  hubDropdownContainer: {
    display: "inline-block",
  },
  inDocument: {
    lineHeight: "25px",
  },
  content: {
    marginTop: 10,
  },
  icon: {
    fontSize: 16,
    color: colors.BLACK(0.75),
    marginLeft: 7,
    marginRight: 7,
  },
  timestamp: {
    color: colors.BLACK(0.5),
  },
  dot: {
    color: colors.BLACK(0.5),
  },
  comment: {
    display: "flex",
  },
  actions: {
    marginTop: 5,
    display: "flex",
  },
});

export default ContributionEntry;
