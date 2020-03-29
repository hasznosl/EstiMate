import React from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {generalStyles, lineColor} from '../styles';
import DatePicker from 'react-native-datepicker';

interface IProps {
  onChangeText: (text: string) => void;
  textInputValue?: string;
  datePickerValue?: Date;
  onDateChange: (date: Date) => void;
  showSaveButton: boolean;
  onClickSave: () => void;
  minDate: Date;
  placeholder: string;
  datePlaceholder: string;
}

export default class NetWorthAtDateDoubleInput extends React.Component<IProps> {
  render() {
    const {
      onChangeText,
      textInputValue,
      datePickerValue,
      onDateChange,
      showSaveButton,
      onClickSave,
      minDate,
      placeholder,
      datePlaceholder,
    } = this.props;
    return (
      <View>
        <TextInput
          underlineColorAndroid={lineColor}
          onChangeText={onChangeText}
          value={textInputValue}
          placeholder={placeholder}
        />
        <DatePicker
          placeholder={datePlaceholder}
          date={datePickerValue}
          format="YYYY-MM-DD"
          minDate={minDate}
          onDateChange={onDateChange}
          showIcon={false}
        />
        {showSaveButton && (
          <TouchableOpacity style={generalStyles.button} onPress={onClickSave}>
            <Text style={generalStyles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
