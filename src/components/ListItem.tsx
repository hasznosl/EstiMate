import React from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import { listViewStyles } from "../styles";

interface IProps {
  needsBorderBottom: boolean;
  title: string;
  title2?: string;
  title3?: string;
  title4?: string;
  title5?: string;
  contents: any;
  uniqueIdentifier?: string;
}

export default class ListItem extends React.Component<IProps> {
  render() {
    const {
      needsBorderBottom,
      title,
      title2,
      title3,
      title4,
      title5,
      contents,
      uniqueIdentifier
    } = this.props;

    return (
      <View
        style={listViewStyles.listItemInnerContainer({
          needsBorderBottom
        })}
        key={uniqueIdentifier}
      >
        <View style={listViewStyles.listItemTitlesContainer}>
          <Text style={listViewStyles.sectionTitleText}>{title}</Text>
          {title2 && (
            <Text style={listViewStyles.sectionTitleText}>{title2}</Text>
          )}
          {title3 && (
            <Text style={listViewStyles.sectionTitleText}>{title3}</Text>
          )}
          {title4 && (
            <Text style={listViewStyles.sectionTitleText}>{title4}</Text>
          )}
          {title5 && (
            <Text style={listViewStyles.sectionTitleText}>{title5}</Text>
          )}
        </View>
        <View style={listViewStyles.listItemContentsContainer}>{contents}</View>
      </View>
    );
  }
}
