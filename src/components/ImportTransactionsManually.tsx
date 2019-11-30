import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { listViewStyles, generalStyles, lineColor } from "../styles";
import { ModalContainer, ListItem } from ".";
import { GlobalContext } from "../Contexts";
import DatePicker from "react-native-datepicker";
import { subDays } from "date-fns";
import { IAppContext } from "../utils/types";

interface IState {
  account: string;
  beginningDate: Date;
  endDate: Date;
  amount: string;
  showModal: boolean;
  deteriorationConstant: string;
}

export default class ImportTransactionsManually extends React.Component<
  {},
  IState
> {
  state = {
    showModal: false,
    account: "",
    saving: false,
    deteriorationConstant: "",
    beginningDate: subDays(new Date(), 1),
    endDate: new Date(),
    amount: ""
  };

  renderModal = ({ onClickSaveManuallyImportedData }) => {
    const {
      account,
      beginningDate,
      endDate,
      amount,
      showModal,
      deteriorationConstant
    } = this.state;

    return (
      <ModalContainer
        visible={showModal}
        onRequestDone={() => this.setState({ showModal: false })}
        onRequestClose={() => this.setState({ showModal: false })}
        titleLabel="Import transactions"
        itemsNumber={6}
      >
        <ListItem
          needsBorderBottom
          title="account name:"
          contents={
            <TextInput
              underlineColorAndroid={lineColor}
              onChangeText={account => this.setState({ account })}
              value={account}
            />
          }
        />
        <ListItem
          needsBorderBottom
          title="start date: "
          contents={
            account ? (
              <DatePicker
                showIcon={false}
                date={beginningDate}
                format="YYYY-MM-DD"
                onDateChange={beginningDate => {
                  this.setState({ beginningDate });
                }}
              />
            ) : (
              <View />
            )
          }
        />
        <ListItem
          needsBorderBottom
          title="end date: "
          contents={
            beginningDate ? (
              <DatePicker
                showIcon={false}
                date={endDate}
                format="YYYY-MM-DD"
                onDateChange={endDate => {
                  this.setState({ endDate });
                }}
              />
            ) : (
              <View />
            )
          }
        />
        <ListItem
          needsBorderBottom
          title="net worth: "
          contents={
            endDate ? (
              <TextInput
                underlineColorAndroid={lineColor}
                onChangeText={amount => {
                  this.setState({ amount });
                }}
                value={amount}
              />
            ) : (
              <View />
            )
          }
        />
        <ListItem
          needsBorderBottom
          title="deterioration constant:"
          contents={
            !isNaN(parseInt(amount)) ? (
              <TextInput
                underlineColorAndroid={lineColor}
                onChangeText={deteriorationConstant =>
                  this.setState({ deteriorationConstant })
                }
                value={deteriorationConstant}
              />
            ) : (
              <View />
            )
          }
        />
        <ListItem
          needsBorderBottom={false}
          title="save: "
          contents={
            !isNaN(parseFloat(deteriorationConstant)) ? (
              <TouchableOpacity
                style={generalStyles.button}
                onPress={() =>
                  onClickSaveManuallyImportedData({
                    account,
                    endDate,
                    beginningDate,
                    amount,
                    deteriorationConstant: parseFloat(deteriorationConstant)
                  })
                }
              >
                <Text style={generalStyles.buttonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )
          }
        />
      </ModalContainer>
    );
  };

  render() {
    return (
      <GlobalContext.Consumer>
        {({ onClickSaveManuallyImportedData }: IAppContext) => (
          <View
            style={listViewStyles.listItemInnerContainer({
              needsBorderBottom: true
            })}
          >
            <View style={listViewStyles.listItemTitlesContainer}>
              <Text style={listViewStyles.sectionTitleText}>
                Import transactions manually
              </Text>
            </View>
            <View style={listViewStyles.listItemTitlesContainer}>
              <TouchableOpacity
                style={generalStyles.button}
                onPress={() => this.setState({ showModal: true })}
              >
                <Text style={generalStyles.buttonText}>start</Text>
              </TouchableOpacity>
              {this.renderModal({ onClickSaveManuallyImportedData })}
            </View>
          </View>
        )}
      </GlobalContext.Consumer>
    );
  }
}
