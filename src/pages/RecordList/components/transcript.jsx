import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { TextArea } = Input;

function toTimestampString(time) {
  const d = Number(time);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = (d - 3600*h - 60*m).toFixed(2);

  const hDisplay = `${h <= 9 ? `0${  h}` : h  }:`;
  const mDisplay = `${m <= 9 ? `0${  m}` : m  }:`;
  const sDisplay = s <= 9 ? `0${  s}` : s;
  return hDisplay + mDisplay + sDisplay;
}

export default function Transcript(props) {
  try {
    // When resultsBySpeaker is enabled, each msg.results array may contain multiple results.
    // The result_index is for the first result in the message,
    // so we need to count up from there to calculate the key.
    const results = props.messages.map(msg => msg.results.map((result, i) => (
      // `${result.alternatives[0].timestamps[0][1]}-${result.alternatives[0].timestamps.lastItem[2]}\n${result.alternatives[0].transcript}\n`
      // <>
      <div className="transcript-paragraph" key={`timestamp-result-${result.alternatives[0].timestamps[0][2]*2}-${msg.result_index}-${i}-${msg.result_index + i}`}>
        <div className="transcript-timing">
          {props.fileType === 2 && toTimestampString(result.alternatives[0].timestamps[0][1])}
        </div>
        <div className="transcript-paragraph-content">
        {
          result.alternatives[0].timestamps.map((timestamp, j) => (
            <span key={`timestamp-${msg.result_index}-${i}-${msg.result_index + i}-${ j}`}>
              {timestamp[0]}
            </span>
          )
          ).reduce((c, d) => c.concat(d), [])
          }
        </div>
      </div>
      // <p key={`timestamp-result-${msg.result_index}-${i}-${msg.result_index + i}`}>
      //   {result.alternatives[0].timestamps[0][1]}-{result.alternatives[0].timestamps.lastItem[2]}<br/>
      //   {result.alternatives[0].transcript}
      // </p>
      // </>
    ))).reduce((a, b) => a.concat(b), []); // the reduce() call flattens the array
    return (
      <div className="transcript-render" style={{ textAlign: 'left', overflow: 'auto' }}>
        {results}
      </div>
    );
  } catch (ex) {
    console.log(ex);
    return <div>{ex.message}</div>;
  }
}

Transcript.propTypes = {
  messages: PropTypes.array.isRequired, // eslint-disable-line
};
