import React, {useState, useContext} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {GlobalContext} from '../Contexts';
import {
  ImportTransactionsManually,
  NetWorthAtDateDoubleInput,
  ListItem,
} from '../components';
import DatePicker from 'react-native-datepicker';
import {addMonths} from 'date-fns';
import {generalStyles, listViewStyles} from '../styles';
import get from 'lodash/get';
import {IPickableContextType} from '../utils/types';

const Settings = () => {
  const [changedFinancialGoal, setChangedFinancialGoal] = useState<{
    readonly netWorthValue?: string;
    readonly date?: Date;
  } | null>(null);
  const [dangerZoneEnabled, setDangerZoneEnabled] = useState<boolean>(false);
  const {
    importantDates,
    setBirthDay,
    birthDay,
    addImportantDate,
    deleteImportantDate,
    saveFinancialGoal,
    financialGoal,
    deleteData,
    importFile,
  }: IPickableContextType = useContext(GlobalContext);

  return (
    <ScrollView>
      <View style={generalStyles.container}>
        <ListItem
          needsBorderBottom={true}
          title="Import transactions from .qif file"
          uniqueIdentifier="Import transactions from .qif file"
          contents={
            <TouchableOpacity style={generalStyles.button} onPress={importFile}>
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
                setChangedFinancialGoal({
                  date: get(financialGoal, 'date') || changedFinancialGoal.date,
                  netWorthValue,
                })
              }
              textInputValue={get(
                changedFinancialGoal,
                'netWorthValue',
                get(financialGoal, 'netWorthValue', '0'),
              )}
              datePickerValue={get(
                changedFinancialGoal,
                'date',
                get(financialGoal, 'date'),
              )}
              onDateChange={date =>
                setChangedFinancialGoal({
                  date,
                  netWorthValue:
                    get(financialGoal, 'netWorthValue') ||
                    changedFinancialGoal.netWorthValue,
                })
              }
              showSaveButton={
                changedFinancialGoal &&
                (changedFinancialGoal.netWorthValue ||
                  changedFinancialGoal.date) &&
                (get(changedFinancialGoal, 'date') !==
                  get(financialGoal, 'date') ||
                  get(changedFinancialGoal, 'netWorthValue') !==
                    get(financialGoal, 'netWorthValue'))
              }
              onClickSave={() =>
                saveFinancialGoal({
                  financialGoal: changedFinancialGoal,
                })
              }
              minDate={addMonths(new Date(), 1)}
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
                [...importantDates].reverse().map((importantDate, index) => (
                  <ListItem
                    title={importantDate}
                    needsBorderBottom={index !== importantDates.length - 1}
                    key={`${importantDate}`}
                    contents={
                      <TouchableOpacity
                        onPress={deleteImportantDate(importantDate)}>
                        <Text>del</Text>
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
            needsBorderBottom: false,
          })}>
          <View style={listViewStyles.listItemTitlesContainer}>
            <Text style={listViewStyles.sectionTitleText}>Danger zone</Text>
          </View>
          <View style={listViewStyles.listItemContentsContainer}>
            <TouchableOpacity
              style={generalStyles.button}
              onPress={() => setDangerZoneEnabled(!dangerZoneEnabled)}>
              <Text style={generalStyles.buttonText}>
                {dangerZoneEnabled ? 'disable' : 'enable'}
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
                  </TouchableOpacity>
                }
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

Settings.navigationOptions = {
  title: 'Settings',
};

export default Settings;
