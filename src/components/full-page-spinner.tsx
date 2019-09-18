import React from 'react';

function FullPageSpinner() {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>Loading...</div>
    </div>
  );
}

export default FullPageSpinner;
