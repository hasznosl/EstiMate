import {
  StyleSheet,
  TextStyle,
  StyleProp,
  ViewStyle
} from "react-native";
import { material } from "react-native-typography";
import { Orientation } from "../utils/types";

const MODAL_HEADER_FOOTER_HEIGHT = 50;
const modalFullHeight = itemsNumber => itemsNumber * 110;
const TABLE_ROW_HEIGHT = 20;
export const appBackground = "#ffffff";
export const lineColor = "#dedede";
export const backgroundLineColor = "#ebebeb";

export const lineChartSVGPropsPrimary = {
  stroke: "black"
};

export const chartSVGProps = {
  stroke: lineColor
};

export const lineChartSVGPropsSecondary = {
  stroke: lineColor
};

export const lineChartSVGPropsTertiary = {
  stroke: lineColor,
  strokeWidth: "2px"
};

export const chartContainer = {
  height: 200,
  padding: 20,
  flexDirection: "row",
  flex: 5
} as StyleProp<ViewStyle>;
export const verticalContentInset = { top: 10, bottom: 10 };

export const xAxisContentInset = { left: 7, right: 7 };

const button = {
  borderColor: lineColor,
  borderWidth: 1,
  flex: 1,
  padding: 16,
  margin: 5,
  backgroundColor: appBackground,
  justifyContent: "center" as "center",
  alignItems: "center" as "center",
  maxHeight: 30,
  minHeight: 30
};

export const modalStyles = StyleSheet.create({
  button,
  buttonText: material.button as TextStyle,
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  innerContainer: ((itemsNumber: number) => ({
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lineColor,
    width: 320,
    height: modalFullHeight(itemsNumber),
    backgroundColor: "white"
  })) as any,
  footerContainer: {
    maxHeight: MODAL_HEADER_FOOTER_HEIGHT,
    minHeight: MODAL_HEADER_FOOTER_HEIGHT,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  contentContainer: ((itemsNumber: number) => ({
    width: "100%",
    height: modalFullHeight(itemsNumber) - 2 * MODAL_HEADER_FOOTER_HEIGHT,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10
  })) as any,
  headerContainer: {
    paddingLeft: 10,
    maxHeight: MODAL_HEADER_FOOTER_HEIGHT,
    minHeight: MODAL_HEADER_FOOTER_HEIGHT,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  titleText: material.headline as TextStyle
});

export const listViewStyles = StyleSheet.create({
  listItemInnerContainer: (({ needsBorderBottom = false }) => ({
    ...(needsBorderBottom
      ? { borderBottomColor: lineColor, borderBottomWidth: 1 }
      : {}),
    backgroundColor: appBackground,
    margin: 2,
    paddingBottom: 20,
    paddingTop: 5,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    alignItems: "flex-start"
  })) as any,
  listItemTitlesContainer: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10
  },
  listItemContentsContainer: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
    height: "100%",
    alignItems: "stretch",
    justifyContent: "center"
  },
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: appBackground
  },
  sectionTitleText: material.caption as TextStyle
});

export const generalStyles = StyleSheet.create({
  buttonText: material.button as TextStyle,
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appBackground
  },
  button,
  smallContainer: {
    flex: 1,
    margin: 4
  }
});

export const twoMainItemsScreen = StyleSheet.create({
  container: (({ orientation }: { orientation: Orientation }) => {
    const flexDirection =
      orientation === Orientation.LANDSCAPE ? "row-reverse" : "column";
    return {
      flex: 1,
      flexDirection,
      justifyContent: "space-between",
      alignItems: "stretch",
      backgroundColor: appBackground
    };
  }) as any
});

export const tableStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: appBackground
  },
  head: {
    backgroundColor: "#ffdc7c",
    height: TABLE_ROW_HEIGHT
  },
  row: (({ index }: { readonly index: number }) => ({
    height: TABLE_ROW_HEIGHT,
    backgroundColor: index % 2 ? "#dbd4c0" : "white"
  })) as any,
  title: {
    flex: 2,
    backgroundColor: appBackground
  },
  wrapper: { flexDirection: "row" },
  text: { paddingLeft: 10, textAlign: "left", fontSize: 10 },
  titleText: { paddingLeft: 10, textAlign: "left", fontSize: 10 },
  headerText: { paddingLeft: 10, textAlign: "left", fontSize: 10 }
});

export const navbarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%"
  },
  text: material.caption as TextStyle,
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: lineColor,
    height: 50
  }
});
