import React from 'react';
import { Message } from '../../common/components/Message';
import { WeatherHistory } from '../../types';
import { PressureChange } from '../PressureChange';

type PressureDetailsProps = {
  details: WeatherHistory;
};

export const PressureDetails = ({ details }: PressureDetailsProps) => {
  const firstValue = details.pressure[0].value;
  const lastValue = details.pressure[details.pressure.length - 1].value;
  const pressureChangeIn4Hours = firstValue - lastValue;

  return (
    <Message
      header={`${details.date}, ${details.location.name} (${details.location.altitude})`}
      messageClassName="is-size-5"
    >
      <PressureChange value={pressureChangeIn4Hours} />
      {details.pressure.map(({ hour, value, unit }) => {
        return (
          <p key={hour}>
            {`${hour}: ${value} ${unit}`}
          </p>
        );
      })}
    </Message>
  );
};
