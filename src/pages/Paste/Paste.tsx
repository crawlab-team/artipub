import React from 'react';

const Paste: React.FC<any> = () => {
  return (
    <div>
      <textarea id="paste" style={{ display: 'block', width: '100%' }} rows={10} />
    </div>
  );
};

export default Paste;
