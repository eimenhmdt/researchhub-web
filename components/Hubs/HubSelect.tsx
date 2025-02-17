import { Hub } from "~/config/types/hub";
import Select, { ValueType, OptionTypeBase, components } from "react-select";
import HubCard from "../Hubs/HubCard";
import FormSelect from "../Form/FormSelect";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { fetchHubSuggestions } from "../SearchSuggestion/lib/api";
import { HubSuggestion } from "../SearchSuggestion/lib/types";
import { css, StyleSheet } from "aphrodite";
import colors from "~/config/themes/colors";

interface Props {
  selectedHubs?: Hub[];
  onChange: Function;
  menuPlacement?: "auto" | "top" | "bottom";
}

const selectDropdownStyles = {
  multiTagLabelStyle: {
    color: colors.NEW_BLUE(1),
    cursor: "pointer",
  },
  multiTagStyle: {
    border: 0,
    background: colors.NEW_BLUE(0.1),
    padding: "4px 12px",
    height: "unset",
    textDecoration: "none",
    fontWeight: 400,
    borderRadius: 50,
    color: colors.NEW_BLUE(),
  },
  option: {
    width: "calc(33% - 10px)",
    boxSizing: "border-box",
    textAlign: "center",
    backgroundColor: "unset",
    padding: 0,
    marginTop: 0,
    marginBottom: 8,
    ":nth-child(3n+1)": {
      paddingLeft: 5,
    },
    ":nth-child(3n)": {
      width: "33%",
    },
    ":hover": {
      backgroundColor: "unset",
    },
  },
  menuList: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "10px",
  },
  valueContainer: {
    padding: "7px 7px 7px 4px",
  },
};

const CustomOption: React.FC<any> = (props) => {
  return (
    <components.Option {...props}>
      <HubCard
        cardStyle={formStyles.hubCardStyle}
        descriptionStyle={formStyles.hubDescriptionStyle}
        hub={props.data.hub}
        showCommentCount={false}
        numberCharactersToShow={100}
        preventLinkClick={true}
        metadataStyle={formStyles.metadataStyle}
      />
    </components.Option>
  );
};

const HubSelect = ({
  selectedHubs = [],
  onChange,
  menuPlacement = "auto",
}: Props) => {
  const [suggestedHubs, setSuggestedHubs] = useState<HubSuggestion[]>([]);

  const handleHubInputChange = async (value) => {
    if (value.length >= 3) {
      const suggestions = await fetchHubSuggestions(value);
      setSuggestedHubs(suggestions);
    }
  };

  const debouncedHandleInputChange = useCallback(
    debounce(handleHubInputChange, 250),
    [suggestedHubs]
  );

  const formattedSelectedHubs = selectedHubs.map((h) => ({
    label: h.name,
    value: h.id,
  }));

  return (
    <div>
      <FormSelect
        containerStyle={formStyles.container}
        id="hubs"
        isMulti
        label="Hubs"
        reactStyles={{}}
        inputStyle={formStyles.inputStyle}
        reactSelect={{ styles: selectDropdownStyles }}
        onInputChange={(field, value) => {
          debouncedHandleInputChange(field, value);
        }}
        onChange={(name, values) => {
          const allAvailableHubs = suggestedHubs
            .map((suggestion) => suggestion.hub)
            .concat(selectedHubs);
          const newHubs = (values || [])
            .map((v) => allAvailableHubs.find((h) => h.id === v.value))
            .filter((h) => ![undefined, null].includes(h));

          onChange(newHubs);
        }}
        selectComponents={{
          Option: CustomOption,
          IndicatorsContainer: () => null,
        }}
        menu={{
          display: "flex",
          flexWrap: "wrap",
        }}
        options={suggestedHubs}
        placeholder="Search Hubs"
        value={formattedSelectedHubs}
        menuPlacement={menuPlacement}
      />
    </div>
  );
};

const formStyles = StyleSheet.create({
  hubCardStyle: {
    fontSize: 14,
    border: 0,
    borderLeft: "unset",
    textAlign: "left",
    padding: 8,
    paddingBottom: 0,
    height: "auto",
  },
  hubDescriptionStyle: {
    height: 70,
    fontSize: 12,
    marginTop: 10,
    lineHeight: "1.25em",
  },
  metadataStyle: {
    paddingBottom: 0,
  },
  container: {},
  inputStyle: {},
  formWrapper: {
    width: "100%",
  },
});

export default HubSelect;
