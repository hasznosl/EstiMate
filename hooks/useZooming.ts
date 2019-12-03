import React, { useState } from 'react'
import getStartAndEndDates from '../src/utils/getStartAndEndDates';
import getRelevantDates from '../src/utils/getRelevantDates';
import zoomingOut from '../src/utils/zoomingOut';
import { isWithinRange } from 'date-fns';
import { Animated } from 'react-native';


const useZooming = ({ netWorthOverTimeToFuture, State, pinchScale, width }) => {

  const [hasZoomed, setHasZoomed] = useState(false)
  const [zoomedDates, setZoomedDates] = useState([])

  return {
    hasZoomed,
    zoomedDates,
    onPinchGestureEvent: Animated.event(
      [{ nativeEvent: { scale: pinchScale } }],
      { useNativeDriver: true }
    ),
    onPinchHandlerStateChange: (event) => {
      const { oldState, scale } = event.nativeEvent
      if (oldState === State.ACTIVE || oldState === State.BEGAN) {
        pinchScale.setValue(1);
        const { startDate, endDate } = getStartAndEndDates({
          scale,
          focalX: event.nativeEvent.focalX,
          width,
          netWorthOverTimeToFuture,
          hasZoomed,
          zoomedDates
        })
        setZoomedDates(
          getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates })
            .filter(date => isWithinRange(date, new Date(startDate), new Date(endDate)))
        )
        setHasZoomed(!zoomingOut({ scale }))
      }
    }

  }
}

export default useZooming