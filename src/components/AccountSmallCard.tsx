import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import {
  getInitialValueOfItem,
  calculateCurrentWorthOfDeterioratingItem,
  calculateSumOfTransactions
} from "../utils";
import { GlobalContext } from "../Contexts";
import { lineColor } from "../styles";
import { ModalContainer, ListItem } from ".";
import { IAppContext, IRealmAccountType } from "../utils/types";
import formatDate from "../utils/formatDate";
import { Icon } from "react-native-elements";

interface IProps {
  account: IRealmAccountType;
}

interface IState { }

export default class AccountSmallCard extends React.Component<IProps, IState> {
  state = { showModal: false, newBalance: "" };

  renderModal = ({ saveTransaction, sumOfTransactions }) => {
    const { showModal, newBalance } = this.state;
    return (
      <ModalContainer
        visible={showModal}
        onRequestClose={() => this.setState({ showModal: false })}
        onRequestDone={() => {
          saveTransaction({
            amount: `${parseInt(newBalance) - sumOfTransactions}`,
            date: formatDate(new Date()),
            account: this.props.account
          });
          this.setState({ showModal: false });
        }}
        titleLabel="Adjust balance"
        rightButtonLabel="adjust"
        itemsNumber={3}
      >
        <>
          <ListItem
            needsBorderBottom
            title="Current balance:"
            contents={<Text>{sumOfTransactions}</Text>}
          />
          <ListItem
            needsBorderBottom
            title="New transaction:"
            contents={
              <Text>
                {!isNaN(parseInt(newBalance))
                  ? parseInt(newBalance) - sumOfTransactions
                  : ""}
              </Text>
            }
          />
          <ListItem
            needsBorderBottom={false}
            title="New balance:"
            contents={
              <TextInput
                underlineColorAndroid={lineColor}
                onChangeText={newBalance => this.setState({ newBalance })}
                value={newBalance}
              />
            }
          />
        </>
      </ModalContainer>
    );
  };

  render() {
    const { account } = this.props;
    const sumOfTransactions = calculateSumOfTransactions(account);
    const exchangeToDefault = account && account.currency && account.currency.exchangeToDefault || '1'

    return (
      <GlobalContext.Consumer>
        {({ saveTransaction, deleteAccount }: IAppContext) => (
          <View>
            <ListItem
              needsBorderBottom
              title={
                account.deteriorationConstant
                  ? `${account.name} (${getInitialValueOfItem(account)})`
                  : account.name
              }
              title2={`${account && account.currency && account.currency.name} (${Math.round(
                parseFloat(exchangeToDefault)
              )})`}
              title3={
                account.deteriorationConstant
                  ? `currentWorth: ${calculateCurrentWorthOfDeterioratingItem(
                    account
                  )}`
                  : `balance: ${sumOfTransactions}`
              }
              title4={
                account.deteriorationConstant &&
                  sumOfTransactions !==
                  calculateCurrentWorthOfDeterioratingItem(account)
                  ? `balance: ${sumOfTransactions}`
                  : undefined
              }
              title5={
                account.deteriorationConstant
                  ? `deterioration: ${Math.round(
                    account.deteriorationConstant * 100000
                  ) / 100000}`
                  : undefined
              }
              contents={
                <View style={{ flexDirection: "row" }}>
                  {!account.deteriorationConstant ? (
                    <TouchableOpacity
                      style={{
                        width: 60,
                        margin: 10,
                        padding: 20,
                        height: 50
                      }}
                      onPress={() => this.setState({ showModal: true })}
                    >
                      <Icon
                        name="plus-square"
                        type="feather"
                        color={lineColor}
                        size={18}
                      />
                    </TouchableOpacity>
                  ) : (
                      <View
                        style={{
                          width: 60,
                          margin: 10,
                          padding: 20,
                          height: 50
                        }}
                      />
                    )}
                  <TouchableOpacity
                    style={{
                      width: 60,
                      margin: 10,
                      padding: 20,
                      height: 50
                    }}
                    onPress={() => deleteAccount({ account })}
                  >
                    <Icon
                      name="trash-2"
                      type="feather"
                      color={lineColor}
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            {this.renderModal({
              saveTransaction,
              sumOfTransactions
            })}
          </View>
        )}
      </GlobalContext.Consumer>
    );
  }
}
