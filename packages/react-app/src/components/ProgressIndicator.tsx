import * as React from 'react';
import styled from 'styled-components';
import CheckmarkIcon from '../assets/check-solid.svg';
import TransferState from '../enums/TransferState';

const SProgressIndicator = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const SProgressIndicatorPoints = styled.div`
  width: 400px;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SProgressIndicatorSteps = styled(SProgressIndicatorPoints)`
  height: auto;
  font-size: 12px;
  font-weight: 600;
`;

enum PointType {
  None,
  Bordered,
  Checked,
}

enum LineType {
  None,
  Bordered,
}

const getPointColor = (type: PointType): string => {
  switch (type) {
    case PointType.Checked:
      return '#4A5FC1';
    case PointType.Bordered:
      return 'white';
    default:
      return 'transparent';
  }
};

const SPoint = styled.span<{ type: number }>`
  height: 25px;
  width: 25px;
  background-color: ${props => getPointColor(props.type)};
  border-radius: 50%;
  ${({ type }): string => {
    if (type === PointType.Bordered) {
      return 'border: 2px solid #4A5FC1;';
    }
    if (type === PointType.None) {
      return 'border: 2px solid #bbb;';
    }
    return '';
  }}
  display: inline-block;
  & img {
    display: ${props => (props.type === PointType.Checked ? 'initial' : 'none')};
    width: 57%;
    padding-top: 6px;
  }
`;

const SLine = styled.span<{ type: LineType }>`
  width: 162.5px;
  height: 3px;
  display: inline-block;
  background-color: ${props => (props.type === LineType.Bordered ? '#4A5FC1' : '#bbb')};
`;

interface IProgressIndicatorProps {
  transferState: TransferState;
}

const getPoint1Type = (state: TransferState): PointType => {
  switch (state) {
    case TransferState.PendingUserConfirmation: return PointType.None;
    case TransferState.PendingApproval: return PointType.Bordered;
    default: return PointType.Checked;
  }
}

const getPoint2Type = (state: TransferState): PointType => {
  switch (state) {
    case TransferState.PendingUserConfirmation: return PointType.None;
    case TransferState.PendingApproval: return PointType.None;
    case TransferState.Approved: return PointType.Bordered;
    default: return PointType.Checked;
  }
}

const ProgressIndicator = (props: IProgressIndicatorProps) => (
  <SProgressIndicator>
    <SProgressIndicatorPoints>
      <SPoint type={getPoint1Type(props.transferState)}>
        <img src={CheckmarkIcon} alt="Checkmark icon" />
      </SPoint>
      <SLine type={props.transferState >= TransferState.Approved ? LineType.Bordered : LineType.None} />
      <SPoint type={getPoint2Type(props.transferState)}>
        <img src={CheckmarkIcon} alt="Checkmark icon" />
      </SPoint>
      <SLine type={props.transferState >= TransferState.Confirmed ? LineType.Bordered : LineType.None} />
      <SPoint type={props.transferState === TransferState.Confirmed ? PointType.Bordered : PointType.None}>
        <img src={CheckmarkIcon} alt="Checkmark icon" />
      </SPoint>
    </SProgressIndicatorPoints>
    <SProgressIndicatorSteps>
      <div>{'Approved'}</div>
      <div>{'Confirmed'}</div>
      <div>{'Completed'}</div>
    </SProgressIndicatorSteps>
  </SProgressIndicator>
);

export default ProgressIndicator;
