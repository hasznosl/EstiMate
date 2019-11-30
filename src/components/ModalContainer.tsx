import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { modalStyles } from "../styles";

interface IProps {
  visible: boolean;
  onRequestClose: () => void;
  titleLabel: string;
  rightButtonLabel?: string;
  onRequestDone: () => void;
  itemsNumber: number;
  children: any;
}

export default class ModalContainer extends React.Component<IProps> {
  render() {
    const {
      visible,
      onRequestClose = () => {},
      titleLabel,
      rightButtonLabel,
      onRequestDone,
      itemsNumber,
      children
    } = this.props;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.innerContainer(itemsNumber)}>
            <View style={modalStyles.headerContainer}>
              <Text style={modalStyles.titleText}>{titleLabel}</Text>
            </View>
            <View style={modalStyles.contentContainer(itemsNumber)}>
              {children}
            </View>
            <View style={modalStyles.footerContainer}>
              <TouchableOpacity
                style={modalStyles.button}
                onPress={onRequestClose}
              >
                <Text style={modalStyles.buttonText}>close</Text>
              </TouchableOpacity>
              {rightButtonLabel && (
                <TouchableOpacity
                  style={modalStyles.button}
                  onPress={onRequestDone}
                >
                  <Text style={modalStyles.buttonText}>{rightButtonLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
