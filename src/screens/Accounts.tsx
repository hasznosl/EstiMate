import React from "react";
import { View, ScrollView } from "react-native";
import { GlobalContext } from "../Contexts";
import { AccountSmallCard } from "../components";
import { sortBy } from "lodash";
import { listViewStyles } from "../styles";
import { calculateSumOfTransactions } from "../utils";
import { IAppContext } from "../utils/types";

export default class Accounts extends React.Component {
  static navigationOptions = {
    title: "Accounts"
  };

  render() {
    return (
      <GlobalContext.Consumer>
        {({ accounts }: IAppContext) => {

          return (
            <View style={listViewStyles.container}>
              <ScrollView>
                {sortBy(
                  accounts,
                  account => {
                    const exchangeToDefault = account && account.currency && account.currency.exchangeToDefault || '1'

                    return (-1 * calculateSumOfTransactions(account)) /
                      parseInt(exchangeToDefault)
                  }
                ).map((account, index) => (
                  <AccountSmallCard key={account.name} account={account} />
                ))}
              </ScrollView>
            </View>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}
