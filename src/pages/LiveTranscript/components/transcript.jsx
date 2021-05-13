import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { TextArea } = Input;

export default function Transcript(props) {
  try {
    // When resultsBySpeaker is enabled, each msg.results array may contain multiple results.
    // The result_index is for the first result in the message,
    // so we need to count up from there to calculate the key.
    const results = props.messages.map(msg => msg.results.map((result, i) => (
      // `${result.alternatives[0].timestamps[0][1]}-${result.alternatives[0].timestamps.lastItem[2]}\n${result.alternatives[0].transcript}\n`
      <>
      <p key={`timestamp-result-${msg.result_index + i}`}>
        {result.alternatives[0].timestamps[0][1]}-{result.alternatives[0].timestamps.lastItem[2]}<br/>
        {result.alternatives[0].transcript}
      </p>
      </>
    ))).reduce((a, b) => a.concat(b), []); // the reduce() call flattens the array
    return (
      <div style={{textAlign: 'left', overflow: 'auto'}}>
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
