import React from 'react';
import PropTypes from 'prop-types';
import { formatTitle } from './helper';
import './style.css';

const Divider = ({ title, show }) => {
  if (!show) return null;
  if (!title) return <hr />;
  return <div className="divider">{formatTitle(title)}</div>;
};

Divider.propTypes = {
  title: PropTypes.string,
  show: PropTypes.bool
};

Divider.defaultProps = {
  title: null,
  show: true
};

Divider.displayName = 'Divider';

export default Divider ;
