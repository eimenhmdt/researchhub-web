import { Box, Typography } from "@mui/material";
import {
  DEFAULT_PROJECT_VALUES,
  useReferenceProjectUpsertContext,
} from "./reference_organizer/context/ReferenceProjectsUpsertContext";
import { Fragment, useState, ReactNode, useEffect, useRef } from "react";
import { connect } from "react-redux";
import {
  emptyFncWithMsg,
  isEmpty,
  isNullOrUndefined,
  nullthrows,
} from "~/config/utils/nullchecks";
import { fetchReferenceOrgProjects } from "./reference_organizer/api/fetchReferenceOrgProjects";
import { MessageActions } from "~/redux/message";
import { parseUserSuggestion } from "~/components/SearchSuggestion/lib/types";
import { removeReferenceCitations } from "./api/removeReferenceCitations";
import { StyleSheet, css } from "aphrodite";
import { toast } from "react-toastify";
import { useOrgs } from "~/components/contexts/OrganizationContext";
import { useReferenceTabContext } from "./reference_item/context/ReferenceItemDrawerContext";
import { useReferenceUploadDrawerContext } from "./reference_uploader/context/ReferenceUploadDrawerContext";
import { useRouter } from "next/router";
import { faFolderPlus, faPlus } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ID } from "~/config/types/root_types";
import { useReferenceActiveProjectContext } from "./reference_organizer/context/ReferenceActiveProjectContext";
import api, { generateApiUrl } from "~/config/api";
import AuthorFacePile from "~/components/shared/AuthorFacePile";
import BasicTogglableNavbarLeft, {
  LEFT_MAX_NAV_WIDTH,
  LEFT_MIN_NAV_WIDTH,
} from "../basic_page_layout/BasicTogglableNavbarLeft";
import Button from "~/components/Form/Button";
import colors from "~/config/themes/colors";
import DropdownMenu from "../menu/DropdownMenu";
import DroppableZone from "~/components/DroppableZone";
import ExpandMore from "@mui/icons-material/ExpandMore";
import gateKeepCurrentUser from "~/config/gatekeeper/gateKeepCurrentUser";
import ListIcon from "@mui/icons-material/List";
import ManageOrgModal from "~/components/Org/ManageOrgModal";
import QuickModal from "../menu/QuickModal";
import ReferenceItemDrawer from "./reference_item/ReferenceItemDrawer";
import ReferenceManualUploadDrawer from "./reference_uploader/ReferenceManualUploadDrawer";
import ReferencesBibliographyModal from "./reference_bibliography/ReferencesBibliographyModal";
import ReferencesTable from "./reference_table/ReferencesTable";
import withWebSocket from "~/components/withWebSocket";

interface Props {
  showMessage: ({ show, load }) => void;
  wsResponse: string;
  wsConnected: boolean;
  setMessage?: any;
}

type Preload = {
  citation_type: string;
  id: string;
  created: boolean;
};

const useEffectFetchOrgProjects = ({
  fetchTime,
  onError,
  onSuccess,
  orgID,
  setIsFethingProjects,
}) => {
  useEffect((): void => {
    if (!isEmpty(orgID)) {
      setIsFethingProjects(true);
      fetchReferenceOrgProjects({
        onError,
        onSuccess,
        payload: {
          organization: orgID,
        },
      });
    }
  }, [orgID, fetchTime]);
};

const useEffectSetActiveProject = ({
  currentOrgProjects,
  isFetchingProjects,
  router,
  setActiveProject,
}): void => {
  const urlProjectID = parseInt(router.query.project);
  const findNestedTargetProject = (allProjects: any[], targetProjectID: ID) => {
    for (const project of allProjects) {
      if (project.id === targetProjectID) {
        return project;
      }
      const projectChildren = project.children;
      if (!isEmpty(projectChildren)) {
        const childTarget = findNestedTargetProject(
          projectChildren,
          targetProjectID
        );
        if (!isNullOrUndefined(childTarget)) {
          return childTarget;
        }
      }
    }
  };

  useEffect((): void => {
    if (!isFetchingProjects) {
      const activeProject = findNestedTargetProject(
        currentOrgProjects,
        urlProjectID
      );
      if (isNullOrUndefined(activeProject)) {
        setActiveProject({ DEFAULT_PROJECT_VALUES });
      } else {
        const {
          collaborators: { editors, viewers },
          id,
          project_name,
          is_public,
        } = activeProject ?? { collaborators: { editors: [], viewers: [] } };
        setActiveProject({
          collaborators: [
            ...editors.map((rawUser: any) => {
              return {
                ...parseUserSuggestion(rawUser),
                role: "EDITOR",
              };
            }),
            ...viewers.map((rawUser: any) => {
              return {
                ...parseUserSuggestion(rawUser),
                role: "VIEWER",
              };
            }),
          ],
          projectID: id,
          projectName: project_name,
          isPublic: is_public,
        });
      }
    }
  }, [urlProjectID, isFetchingProjects]);
};

// TODO: @lightninglu10 - fix TS.
function ReferencesContainer({
  showMessage,
  setMessage,
  wsResponse,
  wsConnected,
}: Props): ReactNode {
  const userAllowed = gateKeepCurrentUser({
    application: "REFERENCE_MANAGER",
    shouldRedirect: true,
  });
  const { currentOrg, refetchOrgs } = useOrgs();
  const router = useRouter();

  const { activeProject, setActiveProject } =
    useReferenceActiveProjectContext();
  const { setReferencesFetchTime } = useReferenceTabContext();
  const {
    projectsFetchTime,
    setIsModalOpen: setIsProjectUpsertModalOpen,
    setProjectValue: setProjectUpsertValue,
    setUpsertPurpose: setProjectUpsertPurpose,
  } = useReferenceProjectUpsertContext();
  const {
    setIsDrawerOpen: setIsRefUploadDrawerOpen,
    setProjectID: setProjectIDForUploadDrawer,
  } = useReferenceUploadDrawerContext();

  const [currentOrgProjects, setCurrentOrgProjects] = useState<any[]>([]);
  const [isFetchingProjects, setIsFethingProjects] = useState<boolean>(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const [isLeftNavOpen, setIsLeftNavOpen] = useState<boolean>(true);
  const [createdReferences, setCreatedReferences] = useState<any[]>([]);
  const [selectedReferenceIDs, setSelectedReferenceIDs] = useState<any[]>([]);
  const [isRemoveRefModalOpen, setIsRemoveRefModalOpen] =
    useState<boolean>(false);
  const [isBibModalOpen, setIsBibModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const leftNavWidth = isLeftNavOpen ? LEFT_MAX_NAV_WIDTH : LEFT_MIN_NAV_WIDTH;
  const currentProjectName = activeProject?.projectName ?? null;
  const currentOrgID = currentOrg?.id ?? null;
  const isOnOrgTab = !isEmpty(router.query?.org_refs);
  const onOrgUpdate = (): void => {
    refetchOrgs();
    setIsOrgModalOpen(false);
  };
  const onShareClick = (): void => {
    setProjectUpsertPurpose("update");
    setProjectUpsertValue({
      ...DEFAULT_PROJECT_VALUES,
      ...activeProject,
    });
    setIsProjectUpsertModalOpen(true);
  };
  const inputRef = useRef();

  const getPresignedUrl = async (fileName, organizationID, projectID) => {
    const url = generateApiUrl("citation_entry/upload_pdfs");
    const resp = await fetch(
      url,
      api.POST_CONFIG({
        filename: fileName,
        organization_id: organizationID,
        project_id: projectID,
      })
    );

    return await resp.json();
  };

  const handleFileDrop = async (acceptedFiles) => {
    const fileNames = [];
    acceptedFiles.forEach(async (file) => {
      const preSignedUrl = await getPresignedUrl(
        file.name,
        nullthrows(currentOrg).id,
        nullthrows(activeProject).projectID
      );
      const fileBlob = new Blob([await file.arrayBuffer()], {
        type: "application/pdf",
      });
      const result = fetch(preSignedUrl, {
        method: "PUT",
        body: fileBlob,
      });
    });
    const preload: Array<Preload> = [];

    acceptedFiles.map(() => {
      const uuid = window.URL.createObjectURL(new Blob([])).substring(31);
      preload.push({
        citation_type: "LOADING",
        id: uuid,
        created: true,
      });
    });

    setCreatedReferences(preload);
    setLoading(false);
  };

  useEffectFetchOrgProjects({
    fetchTime: projectsFetchTime,
    onError: emptyFncWithMsg,
    onSuccess: (payload): void => {
      setCurrentOrgProjects(payload ?? []);
      setIsFethingProjects(false);
    },
    orgID: currentOrgID,
    setIsFethingProjects,
  });
  useEffectSetActiveProject({
    currentOrgProjects,
    router,
    setActiveProject,
    isFetchingProjects,
  });

  useEffect(() => {
    if (wsResponse) {
      const newReferences = [...createdReferences];
      const ind = newReferences.findIndex((reference) => {
        return reference.citation_type === "LOADING";
      });
      const wsJson = JSON.parse(wsResponse);
      const createdCitationJson = wsJson.created_citation;

      if (wsJson.dupe_citation) {
        newReferences.splice(ind, 1);
        toast(
          <div style={{ fontSize: 16, textAlign: "center" }}>
            Citation for <br />
            <br />
            <strong style={{ fontWeight: 600 }}>
              {createdCitationJson.fields.title}
            </strong>{" "}
            <br />
            <br />
            already exists!
          </div>,
          {
            position: "top-center",
            autoClose: 5000,
            progressStyle: { background: colors.NEW_BLUE() },
            hideProgressBar: false,
          }
        );
      } else {
        newReferences[ind] = createdCitationJson;
      }

      setCreatedReferences(newReferences);
    }
  }, [wsResponse]);

  if (!userAllowed) {
    return <Fragment />;
  } else {
    return (
      <>
        <ManageOrgModal
          org={currentOrg}
          isOpen={isOrgModalOpen}
          closeModal={(): void => setIsOrgModalOpen(false)}
          onOrgChange={onOrgUpdate}
        />
        <QuickModal
          isOpen={isRemoveRefModalOpen}
          modalContent={
            <Box sx={{ height: "80px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography id="modal-modal-title" variant="h6">
                  {`Are you sure you want to remove selected reference${
                    selectedReferenceIDs.length > 1 ? "s" : ""
                  }?`}
                </Typography>
              </Box>
            </Box>
          }
          modalWidth="300px"
          onPrimaryButtonClick={(): void => {
            removeReferenceCitations({
              onError: emptyFncWithMsg,
              onSuccess: (): void => {
                setReferencesFetchTime(Date.now());
                setIsRemoveRefModalOpen(false);
              },
              payload: {
                citation_entry_ids: selectedReferenceIDs,
              },
            });
          }}
          onSecondaryButtonClick={(): void => setIsRemoveRefModalOpen(false)}
          onClose={(): void => setIsRemoveRefModalOpen(false)}
          primaryButtonConfig={{ label: "Remove" }}
        />
        <ReferencesBibliographyModal
          isOpen={isBibModalOpen}
          onClose={(): void => setIsBibModalOpen(false)}
          selectedReferenceIDs={selectedReferenceIDs}
        />
        <ReferenceManualUploadDrawer key="root-nav" />
        <ReferenceItemDrawer />
        <Box flexDirection="row" display="flex" maxWidth={"calc(100vw - 79px)"}>
          <BasicTogglableNavbarLeft
            currentOrgProjects={currentOrgProjects}
            isOpen={isLeftNavOpen}
            navWidth={leftNavWidth}
            setIsOpen={setIsLeftNavOpen}
          />
          <DroppableZone
            multiple
            noClick
            handleFileDrop={handleFileDrop}
            accept=".pdf"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: "32px 32px",
                width: "100%",
                overflow: "auto",
                boxSizing: "border-box",
                flex: 1,
              }}
              className={"references-section"}
            >
              <div
                style={{
                  marginBottom: 32,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {currentProjectName ??
                    (isOnOrgTab ? "Organization References" : `My References`)}
                </Typography>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    handleFileDrop(Array.from(e.target.files));
                  }}
                />

                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {activeProject?.collaborators && (
                    <AuthorFacePile
                      horizontal
                      margin={-10}
                      authorProfiles={(activeProject?.collaborators ?? {})?.map(
                        (collaborator) => {
                          collaborator.authorProfile.user = collaborator;
                          return collaborator.authorProfile;
                        }
                      )}
                      imgSize={""}
                    />
                  )}
                  {(isOnOrgTab || !isEmpty(router.query.project)) && (
                    <Button
                      variant="outlined"
                      fontSize="small"
                      size="small"
                      customButtonStyle={styles.shareButton}
                      onClick={
                        isOnOrgTab
                          ? () => setIsOrgModalOpen(true)
                          : onShareClick
                      }
                    >
                      <Typography variant="h6" fontSize={"16px"}>
                        {isOnOrgTab ? "Update Organization" : "Share"}
                      </Typography>
                    </Button>
                  )}
                </div>
              </div>
              <Box className="ReferencesContainerMain">
                <Box
                  className="ReferencesContainerTitleSection"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    height: 44,
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {!isEmpty(selectedReferenceIDs) && (
                      <>
                        <DropdownMenu
                          disabled={isEmpty(selectedReferenceIDs)}
                          menuItemProps={[
                            {
                              itemLabel: `Export reference${
                                selectedReferenceIDs.length > 1 ? "s" : ""
                              }`,
                              onClick: () => {
                                setIsBibModalOpen(true);
                              },
                            },
                            {
                              itemLabel: (
                                <Typography color="red">{`Remove reference${
                                  selectedReferenceIDs.length > 1 ? "s" : ""
                                }`}</Typography>
                              ),
                              onClick: () => {
                                setIsRemoveRefModalOpen(true);
                              },
                            },
                          ]}
                          menuLabel={
                            <div
                              style={{
                                alignItems: "center",
                                color: "rgba(170, 168, 180, 1)",
                                display: "flex",
                                justifyContent: "space-between",
                                width: 68,
                                height: 36,
                                padding: 6,
                                boxSizing: "border-box",
                              }}
                            >
                              <ListIcon
                                fontSize="medium"
                                sx={{ color: "#AAA8B4" }}
                              />
                              <ExpandMore
                                fontSize="medium"
                                sx={{ color: "#AAA8B4" }}
                              />
                            </div>
                          }
                          size="medium"
                        />
                        <Typography
                          sx={{ marginLeft: "8px" }}
                        >{`${selectedReferenceIDs.length} selected`}</Typography>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className={css(styles.button, styles.secondary)}
                      onClick={(e) => {
                        e.preventDefault();
                        setProjectUpsertPurpose("create_sub_project");
                        setProjectUpsertValue({
                          ...DEFAULT_PROJECT_VALUES,
                          projectID: activeProject?.projectID,
                        });
                        setIsProjectUpsertModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faFolderPlus}
                        color={colors.NEW_BLUE(1)}
                        fontSize="20px"
                        style={{ marginRight: 8 }}
                      />
                      {"Add a project"}
                    </div>
                    <DropdownMenu
                      menuItemProps={[
                        {
                          itemLabel: "Import PDF(s)",
                          onClick: (): void =>
                            // @ts-ignore unnecessary never handling
                            nullthrows(inputRef?.current).click(),
                        },
                        {
                          itemLabel: "Manual upload",
                          onClick: (): void => {
                            setProjectIDForUploadDrawer(
                              activeProject?.projectID ?? null
                            );
                            setIsRefUploadDrawerOpen(true);
                          },
                        },
                      ]}
                      menuLabel={
                        <div className={css(styles.button)}>
                          <FontAwesomeIcon
                            icon={faPlus}
                            color="#fff"
                            fontSize="20px"
                            style={{ marginRight: 8 }}
                          />
                          {"Add a reference"}
                        </div>
                      }
                      size={"small"}
                    />
                  </div>
                </Box>
                <ReferencesTable
                  createdReferences={createdReferences}
                  // @ts-ignore TODO: @@lightninglu10 - fix TS.
                  handleFileDrop={handleFileDrop}
                  setSelectedReferenceIDs={setSelectedReferenceIDs}
                />
              </Box>
            </Box>
          </DroppableZone>
        </Box>
        {/* <ToastContainer
          autoClose={true}
          closeOnClick
          hideProgressBar={false}
          newestOnTop
          containerId={"reference-toast"}
          position="top-center"
          autoClose={5000}
          progressStyle={{ background: colors.NEW_BLUE() }}
        ></ToastContainer> */}
      </>
    );
  }
}

const styles = StyleSheet.create({
  shareButton: {
    marginLeft: 16,
    color: colors.BLACK(),
    border: "none",
    background: "unset",
  },
  button: {
    alignItems: "center",
    background: colors.NEW_BLUE(),
    borderRadius: 4,
    boxSizing: "border-box",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    fontSize: 14,
    fontWeight: 500,
    height: 40,
    justifyContent: "center",
    marginLeft: 16,
    padding: 16,
  },
  secondary: {
    border: `1px solid ${colors.NEW_BLUE()}`,
    background: "#fff",
    color: colors.NEW_BLUE(),
  },
});

const mapDispatchToProps = {
  showMessage: MessageActions.showMessage,
  setMessage: MessageActions.setMessage,
};

export default withWebSocket(
  // @ts-ignore - faulty legacy connect hook
  connect(null, mapDispatchToProps)(ReferencesContainer)
);
