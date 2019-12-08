import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { GlobalContext } from "../Contexts";
import {
  ImportTransactionsManually,
  NetWorthAtDateDoubleInput,
  ListItem
} from "../components";
import DatePicker from "react-native-datepicker";
import { pushTransactionsToLambda } from "../utils";
import { addMonths } from "date-fns";
import { generalStyles, listViewStyles, lineColor } from "../styles";
import get from "lodash/get";
import { Icon } from "react-native-elements";
import {
  IFinancialGoalType,
  IAppContext,
  IRealmDocumentNameType
} from "../utils/types";
import persistency from "../persistenceUtils/persistency";

interface IState {
  readonly dangerZoneEnabled: boolean;
  readonly changedFinancialGoal?: IFinancialGoalType;
}

export default class Settings extends Component<{}, IState> {
  static navigationOptions = {
    title: "Settings"
  };

  constructor(props) {
    super(props);
    this.state = {
      dangerZoneEnabled: false,
      changedFinancialGoal: { date: new Date(), netWorthValue: '0' }
    };
  }

  render() {
    const { dangerZoneEnabled } = this.state;
    return (
      <GlobalContext.Consumer>
        {({
          importantDates,
          setBirthDay,
          birthDay,
          addImportantDate,
          deleteImportantDate,
          changeVirtualSpending,
          virtualSpending,
          saveFinancialGoal,
          financialGoal,
          deleteData,
          importFile
        }: IAppContext) => {
          const changedFinancialGoal =
            (this.state.changedFinancialGoal.date ||
              this.state.changedFinancialGoal.netWorthValue)
              ? this.state.changedFinancialGoal
              : financialGoal;
          return (
            <ScrollView>
              <View style={generalStyles.container}>
                <ListItem
                  needsBorderBottom={true}
                  title="Import transactions from .qif file"
                  uniqueIdentifier="Import transactions from .qif file"
                  contents={
                    <TouchableOpacity
                      style={generalStyles.button}
                      onPress={importFile}
                    >
                      <Text style={generalStyles.buttonText}>find file</Text>
                    </TouchableOpacity>
                  }
                />
                <ImportTransactionsManually />
                <ListItem
                  needsBorderBottom={true}
                  title="Financial goal"
                  uniqueIdentifier="Financial goal"
                  contents={
                    <NetWorthAtDateDoubleInput
                      datePlaceholder="at given date"
                      placeholder="net worth value"
                      onChangeText={netWorthValue =>
                        this.setState(
                          ({
                            changedFinancialGoal: { date = new Date() }
                          }) => ({
                            changedFinancialGoal: {
                              date: get(financialGoal, "date") || date,
                              netWorthValue
                            }
                          })
                        )
                      }
                      textInputValue={get(
                        changedFinancialGoal,
                        "netWorthValue"
                      )}
                      datePickerValue={get(changedFinancialGoal, "date")}
                      onDateChange={date =>
                        this.setState(
                          ({
                            changedFinancialGoal: { netWorthValue = "" }
                          }) => ({
                            changedFinancialGoal: {
                              date,
                              netWorthValue:
                                get(financialGoal, "netWorthValue") ||
                                netWorthValue
                            }
                          })
                        )
                      }
                      showSaveButton={
                        get(changedFinancialGoal, "date") !==
                        get(financialGoal, "date") ||
                        get(changedFinancialGoal, "netWorthValue") !==
                        get(financialGoal, "netWorthValue")
                      }
                      onClickSave={() =>
                        saveFinancialGoal({
                          financialGoal: changedFinancialGoal
                        })
                      }
                      minDate={addMonths(new Date(), 1)}
                    />
                  }
                />
                <ListItem
                  needsBorderBottom={true}
                  title="Add an imaginary spending"
                  uniqueIdentifier="Add an imaginary spending"
                  contents={
                    <TextInput
                      underlineColorAndroid={lineColor}
                      value={virtualSpending}
                      onChangeText={changeVirtualSpending}
                    />
                  }
                />
                <ListItem
                  needsBorderBottom={true}
                  title="Set birthday"
                  uniqueIdentifier="Set birthday"
                  contents={
                    <DatePicker
                      showIcon={false}
                      date={birthDay}
                      format="YYYY-MM-DD"
                      minDate="1900-01-01"
                      maxDate="2000-01-01"
                      onDateChange={setBirthDay}
                    />
                  }
                />
                <ListItem
                  needsBorderBottom={true}
                  title="Developer button"
                  uniqueIdentifier="Developer button"
                  contents={
                    <TouchableOpacity
                      style={generalStyles.button}
                      onPress={async () => {
                        await pushTransactionsToLambda({
                          accounts: await persistency.getDocuments({
                            documentName: IRealmDocumentNameType.account
                          })
                        });
                      }}
                    >
                      <Text style={generalStyles.buttonText}>trigger</Text>
                    </TouchableOpacity>
                  }
                />
                <ListItem
                  needsBorderBottom={true}
                  title="Important dates"
                  contents={
                    <>
                      <View style={generalStyles.smallContainer}>
                        <DatePicker
                          showIcon={false}
                          date={null}
                          placeholder="add"
                          onDateChange={addImportantDate}
                        />
                      </View>
                      {importantDates && importantDates.length ? (
                        [...importantDates]
                          .reverse()
                          .map((importantDate, index) => (
                            <ListItem
                              title={importantDate}
                              needsBorderBottom={
                                index !== importantDates.length - 1
                              }
                              key={`${importantDate}`}
                              contents={
                                <TouchableOpacity
                                  onPress={deleteImportantDate(importantDate)}
                                >

                                  <Text>del</Text>
                                  {/* <Icon
                                    name="trash-2"
                                    type="feather"
                                    color={lineColor}
                                    size={18}
                                  /> */}
                                </TouchableOpacity>
                              }
                            />
                          ))
                      ) : (
                          <Text>No date set</Text>
                        )}
                    </>
                  }
                />

                <View
                  style={listViewStyles.listItemInnerContainer({
                    needsBorderBottom: false
                  })}
                >
                  <View style={listViewStyles.listItemTitlesContainer}>
                    <Text style={listViewStyles.sectionTitleText}>
                      Danger zone
                    </Text>
                  </View>
                  <View style={listViewStyles.listItemContentsContainer}>
                    <TouchableOpacity
                      style={generalStyles.button}
                      onPress={() =>
                        this.setState(state => ({
                          dangerZoneEnabled: !state.dangerZoneEnabled
                        }))
                      }
                    >
                      <Text style={generalStyles.buttonText}>
                        {dangerZoneEnabled ? "disable" : "enable"}
                      </Text>
                    </TouchableOpacity>

                    {dangerZoneEnabled && (
                      <ListItem
                        title="Delete data"
                        needsBorderBottom={false}
                        key="delete data"
                        contents={
                          <TouchableOpacity onPress={deleteData}>
                            <Text>del</Text>
                            {/* <Icon
                              name="trash-2"
                              type="feather"
                              color={lineColor}
                              size={18}
                            /> */}
                          </TouchableOpacity>
                        }
                      />
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}
